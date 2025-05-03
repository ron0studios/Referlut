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
    # Fetch accounts linked to the user from Supabase
    response = supabase.table("requisitions").select("*").eq("user_id", user_id).execute()
    accounts = []
    for req in response.data:
        requisition = client.requisition.get_requisition_by_id(req["requisition_id"])
        for account_id in requisition.get("accounts", []):
            account = client.account.get_account_details(account_id)
            accounts.append(account)
    return accounts

def fetch_balances(account_id: str):
    # Fetch balances for the given account
    account = client.account_api(id=account_id)
    if not account:
        raise Exception("Account not found")

    balances = account.get_balances(account_id)
    return balances

def fetch_transactions(account_id: str, months: int = 12):
    # Calculate date range for transactions
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30 * months)
    date_from = start_date.strftime("%Y-%m-%d")
    date_to = end_date.strftime("%Y-%m-%d")

    account = client.account_api(id=account_id)
    if not account:
        raise Exception("Account not found")

    # Fetch transactions for the given account and date range
    transactions = account.get_transactions(date_from=date_from, date_to=date_to)
    return transactions 