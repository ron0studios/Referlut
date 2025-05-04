import os
import logging
from fastapi import FastAPI, Depends, HTTPException, Request, Header, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
import datetime
from supabase import create_client, Client
import openai
from typing import Optional, Dict, List, Annotated, Union
import jwt
from jwt import PyJWKClient
import requests
from banking import (
    initiate_requisition,
    handle_requisition_callback,
    fetch_accounts,
    fetch_transactions,
)
from ai import Transaction, analyze_transactions, classify_transaction_with_llm, get_expert_tips, get_spending_insights, scrape_best_deals
from pydantic import BaseModel
import asyncio
from datetime import datetime, timedelta
import json

# Try to import PocketBase, but handle case where it's not installed
try:
    from pocketbase import PocketBase
    pocketbase_available = True
except ImportError:
    pocketbase_available = False
    logging.warning("PocketBase package not available. PocketBase authentication will be disabled.")

from mock_data import MOCK_TRANSACTIONS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Authentication configs
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_API_AUDIENCE = os.getenv("AUTH0_API_AUDIENCE")
POCKETBASE_URL = os.getenv("POCKETBASE_URL")

# Dictionary to cache transaction classifications
transaction_classifications = {}

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

# Initialize clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai.api_key = OPENAI_API_KEY

# Initialize Auth0 JWT verification
if AUTH0_DOMAIN and AUTH0_API_AUDIENCE:
    auth0_jwks_client = PyJWKClient(f"https://{AUTH0_DOMAIN}/.well-known/jwks.json")
else:
    auth0_jwks_client = None
    logger.warning("AUTH0_DOMAIN or AUTH0_API_AUDIENCE not set. Auth0 authentication will be disabled.")

# Initialize PocketBase client if URL is set and package is available
pocketbase_client = PocketBase(POCKETBASE_URL) if POCKETBASE_URL and pocketbase_available else None
if not pocketbase_client:
    logger.warning("PocketBase authentication will be disabled.")

security = HTTPBearer()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication dependency for user identification
async def get_authenticated_user(
    auth: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    auth_provider: str = Header(None, alias="Auth-Provider")
) -> Dict[str, str]:
    """
    Authenticate user and return user data based on the authentication provider
    auth_provider can be one of: 'auth0', 'supabase', 'pocketbase'
    """
    if not auth:
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = auth.credentials

    # Default to Auth0 if provider not specified
    provider = auth_provider.lower() if auth_provider else "auth0"

    try:
        if provider == "auth0" and auth0_jwks_client:
            # Verify Auth0 JWT
            signing_key = auth0_jwks_client.get_signing_key_from_jwt(token)
            user_data = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=AUTH0_API_AUDIENCE,
                issuer=f"https://{AUTH0_DOMAIN}/"
            )
            return {"user_id": user_data.get("sub"), "provider": "auth0"}

        elif provider == "supabase":
            # Verify Supabase JWT
            try:
                result = supabase.auth.get_user(token)
                if result and hasattr(result, 'user') and result.user:
                    return {"user_id": result.user.id, "provider": "supabase"}
                else:
                    logger.error("Supabase authentication returned invalid user data")
                    raise HTTPException(status_code=401, detail="Invalid Supabase token")
            except Exception as e:
                logger.error(f"Supabase authentication error: {str(e)}")
                raise HTTPException(status_code=401, detail="Invalid Supabase token")

        elif provider == "pocketbase" and pocketbase_client:
            # Verify PocketBase token
            try:
                # Manual verification since PocketBase Python SDK doesn't expose this
                response = requests.get(
                    f"{POCKETBASE_URL}/api/collections/users/auth-refresh",
                    headers={"Authorization": f"Bearer {token}"}
                )
                if response.status_code == 200:
                    user_data = response.json()
                    return {"user_id": user_data.get("record", {}).get("id"), "provider": "pocketbase"}
                else:
                    raise HTTPException(status_code=401, detail="Invalid PocketBase token")
            except Exception as e:
                logger.error(f"PocketBase authentication error: {str(e)}")
                raise HTTPException(status_code=401, detail="PocketBase authentication failed")
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported auth provider: {provider}")

    except jwt.PyJWTError as e:
        logger.error(f"JWT decode error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")

class InsightsRequest(BaseModel):
    prompt: str

# API routers for better organization
# Create router groups
banking_router = APIRouter(prefix="/api/banking", tags=["Banking"])
statistics_router = APIRouter(prefix="/api/statistics", tags=["Statistics"])
ai_router = APIRouter(prefix="/api/ai", tags=["AI"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Referlut API"}

# Banking endpoints
@banking_router.post("/link/initiate")
async def bank_link_initiate(
    user_data: Annotated[Dict[str, str], Depends(get_authenticated_user)],
    institution_id: str,
    redirect_url: str
):
    user_id = user_data["user_id"]
    return initiate_requisition(user_id, institution_id, redirect_url)

@banking_router.get("/link/callback")
async def bank_link_callback(ref: str):
    return handle_requisition_callback(ref)

@banking_router.get("/accounts")
async def get_user_accounts(user_data: Annotated[Dict[str, str], Depends(get_authenticated_user)]):
    user_id = user_data["user_id"]
    try:
        # fetch all linked requisitions for user
        resp = supabase.table("requisitions").select("requisition_id").eq("user_id", user_id).eq("status", "LN").execute()
        accounts = []
        for r in resp.data:
            accounts.extend(fetch_accounts(r["requisition_id"], user_id))
        return accounts
    except Exception as e:
        logger.error(f"Error fetching accounts: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@banking_router.get("/transactions")
async def get_account_transactions(
    user_data: Annotated[Dict[str, str], Depends(get_authenticated_user)],
    account_id: str,
    months: int = 12
):
    # Return persisted transactions from Supabase
    try:
        # Verify the account belongs to the authenticated user
        account_check = supabase.table("accounts").select("user_id").eq("account_id", account_id).execute()

        if not account_check.data or account_check.data[0]["user_id"] != user_data["user_id"]:
            raise HTTPException(status_code=403, detail="You don't have permission to access this account")

        response = supabase.table("transactions").select("*").eq("account_id", account_id).execute()

        # If no transactions found, try to fetch them
        if not response.data:
            # Fetch transactions for the account
            try:
                from banking import fetch_transactions
                count = fetch_transactions(account_id)
                logger.info(f"Fetched {count} transactions for account {account_id}")

                # Try again to get the transactions
                response = supabase.table("transactions").select("*").eq("account_id", account_id).execute()
            except Exception as e:
                logger.error(f"Error fetching transactions: {str(e)}")

        return response.data
    except Exception as e:
        logger.error(f"Error retrieving transactions: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Statistics endpoints
@statistics_router.get("/summary")
async def get_statistics_summary(
    user_data: Annotated[Dict[str, str], Depends(get_authenticated_user)],
    months: int = 12
):
    """
    Get a summary of the user's financial statistics
    """
    user_id = user_data["user_id"]
    try:
        # Get all accounts for the user
        resp = supabase.table("requisitions").select("requisition_id").eq("user_id", user_id).eq("status", "LN").execute()

        if not resp.data:
            logger.warning(f"No linked accounts found for user {user_id}")
            raise HTTPException(status_code=404, detail="No linked accounts found. Please connect your bank account first.")

        accounts = []
        for r in resp.data:
            accounts.extend(fetch_accounts(r["requisition_id"], user_id))

        if not accounts:
            logger.warning(f"No accounts found for user {user_id}")
            raise HTTPException(status_code=404, detail="No accounts found")

        # Initialize statistics
        total_spending = 0
        total_income = 0
        category_spending = {}
        monthly_spending = {}
        top_merchants = {}
        savings_opportunities = []

        # Process each account
        for account in accounts:
            account_id = account["account_id"]
            # Get transactions for this account
            response = supabase.table("transactions").select("*").eq("account_id", account_id).execute()
            transactions = response.data

            if not transactions:
                logger.info(f"No transactions found for account {account_id}")
                continue

            # Process each transaction
            for tx in transactions:
                # Use snake_case fields from upserted records
                amount = tx.get("amount", 0)

                # Parse booking_date
                try:
                    date = datetime.fromisoformat(tx.get("booking_date", "").replace("Z", "+00:00"))
                    # Skip transactions older than the requested months
                    if date < datetime.now() - timedelta(days=30*months):
                        continue

                    month_key = date.strftime("%Y-%m")
                    merchant = tx.get("merchant_name", "Unknown")
                    category = tx.get("category", "Uncategorized")

                    # Update monthly spending trend
                    monthly_spending[month_key] = monthly_spending.get(month_key, 0) + amount

                    # Update category spending totals
                    category_spending[category] = category_spending.get(category, 0) + amount

                    # Tally spending per merchant
                    top_merchants[merchant] = top_merchants.get(merchant, 0) + amount

                    # Update overall income vs spending
                    if amount < 0:
                        total_spending += abs(amount)
                    else:
                        total_income += amount
                except Exception as e:
                    logger.error(f"Error processing transaction: {str(e)}")

        # Sort and limit top merchants
        top_merchants = dict(sorted(top_merchants.items(), key=lambda x: x[1], reverse=True)[:10])

        # Store statistics in Supabase
        stats_data = {
            "user_id": user_id,
            "total_spending": total_spending,
            "total_income": total_income,
            "category_spending": json.dumps(category_spending),
            "monthly_spending": json.dumps(monthly_spending),
            "top_merchants": json.dumps(top_merchants),
            "last_updated": datetime.utcnow().isoformat()
        }

        # Upsert statistics
        supabase.table("user_statistics").upsert(stats_data).execute()

        return {
            "total_spending": total_spending,
            "total_income": total_income,
            "category_spending": category_spending,
            "monthly_spending": monthly_spending,
            "top_merchants": top_merchants,
            "savings_opportunities": savings_opportunities
        }
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@statistics_router.get("/spending/chart")
async def get_spending_chart(
    user_data: Annotated[Dict[str, str], Depends(get_authenticated_user)],
    category: str = "all"
):
    """
    Get weekly spending data for the chart.
    category can be: transportation, shopping, groceries, dining out, entertainment, bills, other, all
    """
    user_id = user_data["user_id"]
    try:
        # Get user transactions from all their accounts
        transactions = []

        # Get all accounts for the user
        resp = supabase.table("requisitions").select("requisition_id").eq("user_id", user_id).eq("status", "LN").execute()
        account_ids = []

        for r in resp.data:
            accounts = fetch_accounts(r["requisition_id"], user_id)
            account_ids.extend([acc["account_id"] for acc in accounts])

        # Get transactions for all accounts
        for account_id in account_ids:
            tx_response = supabase.table("transactions").select("*").eq("account_id", account_id).execute()
            if tx_response.data:
                transactions.extend(tx_response.data)

        # If no transactions found, return empty data
        if not transactions:
            logger.warning(f"No transactions found for user {user_id}")
            return {
                "success": True,
                "data": []
            }

        # Convert to Transaction objects and classify them
        transaction_objects = []
        for tx in transactions:
            try:
                # Create a Transaction object
                transaction = Transaction(
                    transactionId=tx.get("transaction_id", ""),
                    bookingDate=tx.get("booking_date", ""),
                    valueDate=tx.get("value_date", ""),
                    transactionAmount={"amount": str(tx.get("amount", 0)), "currency": tx.get("currency", "GBP")},
                    remittanceInformationUnstructured=tx.get("description", ""),
                    proprietaryBankTransactionCode=tx.get("bank_transaction_code", ""),
                    internalTransactionId=tx.get("internal_transaction_id", "")
                )

                # Only classify if we haven't seen this transaction before
                if transaction.transactionId not in transaction_classifications:
                    tx_category = await classify_transaction_with_llm(transaction)
                    # Map backend categories to frontend categories
                    category_mapping = {
                        "Groceries": "groceries",
                        "Transportation": "transportation",
                        "Dining Out": "dining out",
                        "Entertainment": "entertainment",
                        "Shopping": "shopping",
                        "Bills": "bills",
                        "Other": "other"
                    }
                    transaction_classifications[transaction.transactionId] = category_mapping.get(tx_category, "other")

                # Use the existing category if classification failed or is missing
                if transaction.transactionId not in transaction_classifications:
                    transaction_classifications[transaction.transactionId] = tx.get("category", "other")

                transaction_objects.append(transaction)
            except Exception as e:
                logger.error(f"Error creating transaction object: {e}")
                continue

        # Process transactions to generate weekly spending data
        weekly_data = {}

        for transaction in transaction_objects:
            try:
                # Convert booking date to datetime
                booking_date = datetime.fromisoformat(transaction.bookingDate.replace('Z', '+00:00'))
                # Get the start of the week (Monday)
                week_start = booking_date - timedelta(days=booking_date.weekday())
                week_key = week_start.strftime("%Y-%m-%d")

                if week_key not in weekly_data:
                    weekly_data[week_key] = {
                        "total": 0,
                        "categories": {}
                    }

                amount = float(transaction.transactionAmount["amount"])
                if amount < 0:  # Only include spending (negative amounts)
                    tx_category = transaction_classifications[transaction.transactionId]
                    if tx_category not in ["Rewards", "Income"]:
                        # Initialize category if not exists
                        if tx_category not in weekly_data[week_key]["categories"]:
                            weekly_data[week_key]["categories"][tx_category] = 0

                        # Add amount to both category and total
                        weekly_data[week_key]["categories"][tx_category] += abs(amount)
                        weekly_data[week_key]["total"] += abs(amount)
            except Exception as e:
                logger.error(f"Error processing transaction for chart: {str(e)}")

        # Convert to array format and sort by week
        chart_data = [
            {"month": week, **data}  # Keep "month" key for frontend compatibility
            for week, data in sorted(weekly_data.items())
        ]

        # If specific category requested, update totals
        if category != "all":
            for week_data in chart_data:
                # Set total to the specific category's amount
                week_data["total"] = week_data["categories"].get(category, 0)
                # Keep only the requested category in categories
                week_data["categories"] = {category: week_data["total"]}

        # Print debug information
        logger.info(f"Category: {category}")
        logger.info(f"Chart data: {json.dumps(chart_data, indent=2)}")

        return {
            "success": True,
            "data": chart_data
        }

    except Exception as e:
        logger.error(f"Error getting spending chart data: {e}")
        return {
            "success": False,
            "error": str(e)
        }

# AI endpoints
@ai_router.post("/insights")
async def get_ai_insights(
    user_data: Annotated[Dict[str, str], Depends(get_authenticated_user)]
):
    user_id = user_data["user_id"]
    try:
        # Get user's statistics
        stats_response = await get_statistics_summary(user_data)

        # Construct a detailed prompt for AI analysis
        prompt = f"""
        Analyze the following spending data and provide personalized insights and recommendations:

        Total Spending: £{stats_response['total_spending']:.2f}
        Total Income: £{stats_response['total_income']:.2f}

        Spending by Category:
        {json.dumps(stats_response['category_spending'], indent=2)}

        Monthly Spending Trend:
        {json.dumps(stats_response['monthly_spending'], indent=2)}

        Top Spending Areas:
        {json.dumps(stats_response['top_merchants'], indent=2)}

        Please provide:
        1. A summary of spending patterns
        2. Areas where spending could be optimized
        3. Specific recommendations for saving money
        4. Comparison with average spending in these categories
        5. Actionable steps to improve financial health
        """

        insights = await get_spending_insights(prompt)
        return {"insights": insights}
    except Exception as e:
        logger.error(f"Error getting AI insights: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@ai_router.get("/expert-tips")
async def get_ai_expert_tips(
    user_data: Annotated[Dict[str, str], Depends(get_authenticated_user)]
):
    user_id = user_data["user_id"]
    try:
        # Get user's statistics
        stats = await get_statistics_summary(user_data)

        # Generate expert tips based on spending data
        tips = await get_expert_tips({
            "category_spending": stats["category_spending"],
            "top_merchants": stats["top_merchants"],
            "monthly_spending": stats["monthly_spending"]
        })

        return {
            "tips": tips,
            "last_updated": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating expert tips: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/test/expert-tips")
async def test_expert_tips():
    """
    Get expert tips based on mock transaction data.
    """
    # Get mock transactions
    transactions = MOCK_TRANSACTIONS["transactions"]["booked"]

    # Convert to Transaction objects
    transaction_objects = []
    for t in transactions:
        try:
            transaction = Transaction(
                transactionId=t["transactionId"],
                bookingDate=t["bookingDate"],
                valueDate=t["valueDate"],
                transactionAmount=t["transactionAmount"],
                remittanceInformationUnstructured=t["remittanceInformationUnstructured"],
                proprietaryBankTransactionCode=t["proprietaryBankTransactionCode"],
                internalTransactionId=t["internalTransactionId"],
                entryReference=t.get("entryReference"),
                additionalInformation=t.get("additionalInformation"),
                creditorName=t.get("creditorName"),
                creditorAccount=t.get("creditorAccount"),
                debtorName=t.get("debtorName"),
                debtorAccount=t.get("debtorAccount"),
                bookingDateTime=t.get("bookingDateTime"),
                valueDateTime=t.get("valueDateTime")
            )
            transaction_objects.append(transaction)
        except Exception as e:
            print(f"Error creating transaction: {e}")
            continue

    print(f"Created {len(transaction_objects)} transaction objects")

    # Analyze transactions
    analysis = await analyze_transactions(transaction_objects)

    # Get expert tips
    tips = await get_expert_tips(analysis.model_dump())

    return {"tips": tips}


@ai_router.get("/deals")
async def get_ai_deals(
    user_data: Annotated[Dict[str, str], Depends(get_authenticated_user)],
    category: str = "all"
):
    user_id = user_data["user_id"]
    try:
        # Get user's statistics to find categories they spend the most on
        stats = await get_statistics_summary(user_data)

        # Use category spending data to determine which deals to search for
        category_spending = stats["category_spending"]

        # If a specific category is requested, only search for that category
        if category != "all":
            # Search for deals in the requested category
            deals = await scrape_best_deals(category)
            return {
                "deals": deals,
                "category": category,
                "last_updated": datetime.utcnow().isoformat()
            }
        else:
            # Find the top 3 spending categories
            top_categories = sorted(
                [(k, v) for k, v in category_spending.items() if v < 0],
                key=lambda x: abs(x[1]),
                reverse=True
            )[:3]

            all_deals = []
            for cat, _ in top_categories:
                cat_deals = await scrape_best_deals(cat)
                for deal in cat_deals:
                    deal["category"] = cat
                all_deals.extend(cat_deals)

            return {
                "deals": all_deals,
                "top_categories": [cat for cat, _ in top_categories],
                "last_updated": datetime.utcnow().isoformat()
            }
    except Exception as e:
        logger.error(f"Error finding deals: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Register routers
app.include_router(banking_router)
app.include_router(statistics_router)
app.include_router(ai_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)