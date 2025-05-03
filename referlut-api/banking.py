import os
from nordigen import NordigenClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
from supabase import create_client, Client

load_dotenv()

NORDIGEN_SECRET_ID = os.getenv("NORDIGEN_SECRET_ID", "")
NORDIGEN_SECRET_KEY = os.getenv("NORDIGEN_SECRET_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

client = NordigenClient(
    secret_id=NORDIGEN_SECRET_ID,
    secret_key=NORDIGEN_SECRET_KEY
)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_institutions(country_code: str = "GB"):
    # Fetch available institutions for the given country
    institutions = client.institution.get_institutions(country=country_code)
    return institutions

def initiate_requisition(user_id: str, institution_id: str, redirect_url: str):
    # Create a requisition for the user to link their bank account
    requisition = client.requisition.create_requisition(
        redirect_uri=redirect_url,
        institution_id=institution_id,
        reference_id=user_id
    )
    return {"link": requisition["link"]}

def handle_requisition_callback(requisition_id: str):
    # Exchange the requisition ID for access tokens and store in Supabase
    requisition = client.requisition.get_requisition_by_id(requisition_id)
    if requisition["status"] == "LN":
        # Store the requisition details in Supabase
        supabase.table("requisitions").insert({
            "requisition_id": requisition_id,
            "user_id": requisition["reference"],
            "institution_id": requisition["institution_id"],
            "created_at": datetime.now().isoformat()
        }).execute()
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
    balances = client.account.get_balances(account_id)
    return balances

def fetch_transactions(account_id: str, months: int = 12):
    # Calculate date range for transactions
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30 * months)
    date_from = start_date.strftime("%Y-%m-%d")
    date_to = end_date.strftime("%Y-%m-%d")
    # Fetch transactions for the given account and date range
    transactions = client.account.get_transactions(account_id, date_from=date_from, date_to=date_to)
    return transactions 