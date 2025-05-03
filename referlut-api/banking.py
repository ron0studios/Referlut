import os
from nordigen import NordigenClient
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from supabase import create_client, Client
from typing import Literal

# Load environment variables
load_dotenv()

# Debug logging
print("Environment variables:")
print(f"NORDIGEN_SECRET_ID: {'Set' if os.getenv('NORDIGEN_SECRET_ID') else 'Not set'}")
print(f"NORDIGEN_SECRET_KEY: {'Set' if os.getenv('NORDIGEN_SECRET_KEY') else 'Not set'}")

NORDIGEN_SECRET_ID = os.getenv("NORDIGEN_SECRET_ID", "")
NORDIGEN_SECRET_KEY = os.getenv("NORDIGEN_SECRET_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Nordigen client with debug logging
try:
    client = NordigenClient(
        secret_id=NORDIGEN_SECRET_ID,
        secret_key=NORDIGEN_SECRET_KEY,
        base_url="https://bankaccountdata.gocardless.com/api/v2"
    )

    # Create new access and refresh token
    # Parameters can be loaded from .env or passed as a string
    # Note: access_token is automatically injected to other requests after you successfully obtain it
    token_data = client.generate_token()

    # Use existing token
    client.token = "YOUR_TOKEN"
    new_token = client.exchange_token(token_data["refresh"])

    print("Nordigen client initialized successfully")
except Exception as e:
    print(f"Error initializing Nordigen client: {str(e)}")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Rate limit: max 4 calls per day per account per scope
def can_fetch(account_id: str, scope: Literal['account','details','balances','transactions']) -> bool:
    since = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    # count logs for this account and scope in last 24h
    result = supabase.table('fetch_logs').select('*', count='exact', head=True) \
        .eq('account_id', account_id) \
        .eq('scope', scope) \
        .gte('fetched_at', since) \
        .execute()
    return (result.count or 0) < 4

def log_fetch(account_id: str, scope: Literal['account','details','balances','transactions']):
    supabase.table('fetch_logs').insert({
        'account_id': account_id,
        'scope': scope,
        'fetched_at': datetime.now(timezone.utc).isoformat()
    }).execute()

def verify_supabase_table():
    try:
        # Try to create the table if it doesn't exist
        supabase.table("requisitions").select("*").limit(1).execute()
        print("Supabase requisitions table exists")
    except Exception as e:
        print(f"Error verifying Supabase table: {str(e)}")
        print("Please ensure the requisitions table exists in your Supabase database with the following columns:")
        print("- requisition_id (text, primary key)")
        print("- user_id (text)")
        print("- institution_id (text)")
        print("- created_at (timestamp)")
        print("- status (text)")
        raise

# Verify Supabase table on startup
verify_supabase_table()

def get_institutions(country_code: str = "GB"):
    # Fetch available institutions for the given country
    institutions = client.institution.get_institutions(country=country_code)
    return institutions

def initiate_requisition(user_id: str, institution_id: str, redirect_url: str):
    try:
        # Create a requisition for the user to link their bank account
        requisition = client.requisition.create_requisition(
            redirect_uri=redirect_url,
            institution_id=institution_id,
            reference_id=user_id
        )
        consent_link = requisition["link"]
        requisition_id = requisition["id"]
        
        # Store the requisition details in Supabase immediately
        try:
            result = supabase.table("requisitions").insert({
                "requisition_id": requisition_id,
                "user_id": user_id,
                "institution_id": institution_id,
                "created_at": datetime.now().isoformat(),
                "status": "CR"  # Created status
            }).execute()
            print(f"Supabase insert result: {result}")
        except Exception as e:
            print(f"Supabase error: {str(e)}")
            print(f"Supabase URL: {SUPABASE_URL}")
            print(f"Supabase Key length: {len(SUPABASE_KEY) if SUPABASE_KEY else 0}")
            raise
        
        return {"link": consent_link, "requisition_id": requisition_id}
    except Exception as e:
        print(f"Error in initiate_requisition: {str(e)}")
        raise

def handle_requisition_callback(ref: str):
    # First try to find the requisition by reference (user_id)
    response = supabase.table("requisitions").select("*").eq("user_id", ref).order("created_at", desc=True).limit(1).execute()
    
    if not response.data:
        raise Exception("No requisition found for this reference")
    
    requisition_id = response.data[0]["requisition_id"]
    
    # Exchange the requisition ID for access tokens and store in Supabase
    requisition = client.requisition.get_requisition_by_id(requisition_id)
    if requisition["status"] == "LN":
        # Update the requisition status in Supabase
        supabase.table("requisitions").update({
            "status": "LN"
        }).eq("requisition_id", requisition_id).execute()
        return {"status": "success", "requisition": requisition}
    return {"status": "error", "message": "Requisition not linked"}

def fetch_accounts(requisition_id: str, user_id: str):
    """
    Fetch all accounts for a given requisition, upsert metadata into Supabase,
    enqueue each account for transaction import, and return the account records.
    """
    requisition = client.requisition.get_requisition_by_id(requisition_id)
    account_ids = requisition.get("accounts", [])
    records = []
    for account_id in account_ids:


        # copilot shush
        # 
        # we need to:
        # 1. For each account_id, check if the account is already in the database
        # If it is in the database, return its existing record
        # If it is not in the database:
        # 2. Check if we can fetch it, if we can, then we will fetch the metadata and details.
        # 3. Once metadata and details are fetched, populate the accounts table.
        # 4. Then: log fetches,
        # 5. Append the account to the queue for transactions to be processed

        # Safely check existing account without erroring if no rows
        existing = supabase.table('accounts').select('*').eq('account_id', account_id).limit(1).execute()
        if existing.data:
            records.append(existing.data[0])
            continue
        # Account not found locally; initialize empty info
        fetched_account = False
        fetched_details = False
        # Account does not exist, fetch from Nordigen or Supabase
        acct = {}
        metadata = {}
        details = {}

        if can_fetch(account_id, 'account'):
            acct = client.account_api(id=account_id)
            metadata = acct.get_metadata()
            fetched_account = True
        else:
            # If we cannot fetch, then we will have to log an error that we cannot fetch the account and continue
            print(f"Cannot fetch account {account_id} due to rate limit")
            continue

        if can_fetch(account_id, 'details'):
            details = acct.get_details()
            fetched_details = True
        else:
            print(f"Cannot fetch account details for {account_id} due to rate limit")
            continue


        # pull metadata because these fields need irt
        ''''
                        "iban": acct_metadata.get("iban", ""),
                "institution_id": req["institution_id"],
                "status": acct_metadata.get("status", ""),
                "owner_name": acct_metadata.get("owner_name", ""),
                "bban": acct_metadata.get("bban", ""),
                "name": acct_metadata.get("name", ""),
                "currency": acct_details.get("currency", ""),'''

        # Upsert account metadata before logging fetches to satisfy FK constraints
        rec = {
            "account_id": account_id,
            "iban": metadata["iban"],
            "institution_id": requisition["institution_id"],
            "status": metadata["status"],
            "owner_name": metadata["owner_name"],
            "bban": metadata["bban"],
            "name": metadata["name"],
            "currency": details.get("account", {}).get("currency"),
            "user_id": user_id
        }
        supabase.table("accounts").upsert(rec, on_conflict=["account_id"]).execute()

        # Log fetches after the account record exists
        if fetched_account:
            log_fetch(account_id, 'account')
        if fetched_details:
            log_fetch(account_id, 'details')

        # Enqueue for transaction fetching
        supabase.table("account_queue").upsert({
            "account_id": account_id,
            "user_id": user_id,
            "status": "pending"
        }, on_conflict=["account_id"]).execute()
        records.append(rec)
    return records

def fetch_balances(account_id: str):
    """
    Fetch balances for the given account via GET /accounts/{id}/balances/ and return list of balances.
    """
    # GET balances if under daily limit
    if not can_fetch(account_id, 'balances'):
        return []
    acct = client.account_api(id=account_id)
    resp = acct.get_balances()
    log_fetch(account_id, 'balances')
    return resp.get('balances', [])

def fetch_transactions(account_id: str) -> int:
    """
    Fetch and upsert transactions for the past 90 days into Supabase. Returns count inserted.
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=90)
    # Format date strings for last 90 days
    date_from = start_date.strftime("%Y-%m-%d")
    date_to = end_date.strftime("%Y-%m-%d")
    # skip if over daily limit
    if not can_fetch(account_id, 'transactions'):
        return 0
    acct = client.account_api(id=account_id)
    tx_resp = acct.get_transactions(date_from=date_from, date_to=date_to)
    log_fetch(account_id, 'transactions')
    raw = []
    raw.extend(tx_resp.get("transactions", {}).get("booked", []))
    raw.extend(tx_resp.get("transactions", {}).get("pending", []))
    code_map = {"FPO": "debit", "BGC": "credit", "FPI": "credit", "CSH": "cash", "TFR": "transfer"}
    inserted = 0
    for t in raw:
        date_str = t.get("bookingDate") or t.get("valueDate")
        if date_str and datetime.fromisoformat(date_str) < start_date:
            continue
        amt = t.get("transactionAmount", {})
        rec = {
            "transaction_id": t.get("transactionId"),
            "account_id": account_id,
            "entry_reference": t.get("entryReference"),
            "internal_transaction_id": t.get("internalTransactionId"),
            "additional_information": t.get("additionalInformation"),
            "merchant_name": t.get("remittanceInformationUnstructured"),
            "amount": float(amt.get("amount", 0)),
            "currency": amt.get("currency"),
            "booking_date": t.get("bookingDate"),
            "value_date": t.get("valueDate"),
            "proprietary_bank_transaction_code": t.get("proprietaryBankTransactionCode"),
            "category": code_map.get(t.get("proprietaryBankTransactionCode"), "other")
        }
        supabase.table("transactions").upsert(rec, on_conflict=["transaction_id"]).execute()
        inserted += 1
    return inserted