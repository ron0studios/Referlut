import os
from nordigen import NordigenClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
from supabase import create_client, Client

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

    # Exchange refresh token for new access token
    new_token = client.exchange_token(token_data["refresh"])

    print("Nordigen client initialized successfully")
except Exception as e:
    print(f"Error initializing Nordigen client: {str(e)}")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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

def fetch_accounts(user_id: str):
    """
    Returns all user accounts from Supabase and appends any newly linked accounts from the API.
    """
    # First, get all existing accounts from Supabase
    existing_accounts_response = supabase.table("accounts").select("*").eq("user_id", user_id).execute()
    accounts = existing_accounts_response.data
    
    # Keep track of existing account IDs to avoid duplicates
    existing_account_ids = {account["account_id"] for account in accounts}
    
    # Now check for any new accounts via the API
    # Retrieve all requisitions for user
    response = supabase.table("requisitions").select("*").eq("user_id", user_id).execute()
    
    for req in response.data:
        requisition = client.requisition.get_requisition_by_id(req["requisition_id"])
        for account_id in requisition.get("accounts", []):
            # Get account details from API
            acct = client.account_api(id=account_id)
            
            # Skip if we already have this account
            if acct["id"] in existing_account_ids:
                continue
                
            acct_info = acct.get_details()
            
            # Use the same record structure as the original code
            record = {
                "account_id": acct["id"],
                "iban": acct["iban"],
                "institution_id": acct["institution_id"],
                "status": acct["status"],
                "owner_name": acct["owner_name"],
                "bban": acct["bban"],
                "name": acct["name"],
                "currency": acct_info["currency"],
                "user_id": user_id
            }
            
            # Upsert into Supabase accounts table
            supabase.table("accounts").upsert(record, on_conflict=["account_id"]).execute()
            accounts.append(record)
            
    return accounts

def fetch_balances(account_id: str):
    """
    Fetch balances for the given account via GET /accounts/{id}/balances/ and return list of balances.
    """
    acct = client.account_api(id=account_id)
    balances_resp = acct.get_balances()
    # extract balances array
    return balances_resp.get("balances", [])

def fetch_transactions(account_id: str, months: int = 12):
    """
    Fetch transactions via GET /accounts/{id}/transactions, flatten booked and pending,
    filter by date within 'months', categorize by merchant codes, and return list.
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30 * months)
    
    # First, get existing transactions from Supabase
    existing_tx_response = supabase.table("transactions").select("transaction_id").execute()
    existing_tx_ids = {tx["transaction_id"] for tx in existing_tx_response.data if tx["transaction_id"]}
    
    acct = client.account_api(id=account_id)
    tx_resp = acct.get_transactions()
    raw_txs = []
    raw_txs.extend(tx_resp.get("transactions", {}).get("booked", []))
    raw_txs.extend(tx_resp.get("transactions", {}).get("pending", []))
    # mapping proprietary codes to categories
    code_map = {
        "FPO": "debit",
        "BGC": "credit",
        "FPI": "credit",
        "CSH": "cash",
        "TFR": "transfer"
    }
    txs = []
    for t in raw_txs:
        # filter by date
        date_str = t.get("bookingDate") or t.get("valueDate")
        if date_str:
            dt = datetime.fromisoformat(date_str)
            if dt < start_date:
                continue
                
        # Skip if transaction already exists in database
        if t.get("transactionId") in existing_tx_ids:
            continue
            
        # determine category
        pcode = t.get("proprietaryBankTransactionCode")
        category = code_map.get(pcode, "other")
        # extract amount and currency
        amt = t.get("transactionAmount", {})
        amt_val = float(amt.get("amount", 0))
        curr = amt.get("currency")
        record = {
            "transaction_id": t.get("transactionId"),
            "entry_reference": t.get("entryReference"),
            "internal_transaction_id": t.get("internalTransactionId"),
            "additional_information": t.get("additionalInformation"),
            "merchant_name": t.get("remittanceInformationUnstructured"),
            "amount": amt_val,
            "currency": curr,
            "booking_date": t.get("bookingDate"),
            "value_date": t.get("valueDate"),
            "proprietary_bank_transaction_code": pcode,
            "category": category
        }
        # Only insert new transactions
        supabase.table("transactions").insert(record).execute()
        txs.append(record)
    return txs