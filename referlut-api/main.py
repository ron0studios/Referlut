import os
import logging
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import datetime
from supabase import create_client, Client
import openai
from typing import Optional
from banking import (
    initiate_requisition,
    handle_requisition_callback,
    fetch_accounts,
    fetch_transactions,
)
from ai import get_spending_insights, scrape_best_deals
from pydantic import BaseModel
import asyncio
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai.api_key = OPENAI_API_KEY

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InsightsRequest(BaseModel):
    prompt: str
    deal_query: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Referlut API is running"}

@app.post("/bank/link/initiate")
async def initiate_bank_link(user_id: str, institution_id: str, redirect_url: str):
    logger.debug(f"Received request to /bank/link/initiate with params: user_id={user_id}, institution_id={institution_id}, redirect_url={redirect_url}")
    try:
        result = initiate_requisition(user_id, institution_id, redirect_url)
        return {"consent_link": result["link"]}
    except Exception as e:
        logger.error(f"Error in initiate_bank_link: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/bank/link/callback")
async def handle_bank_link_callback(ref: str):
    try:
        # finalize requisition and enqueue metadata and transactions
        result = handle_requisition_callback(ref)
        if result.get("status") != "success":
            raise HTTPException(status_code=400, detail=result.get("message"))
        requisition = result["requisition"]
        if not requisition:
            raise HTTPException(status_code=400, detail="Requisition not found")
        req_id = requisition.get("id") # type: ignore
        user_id = ref
        # fetch and enqueue all accounts (metadata + transaction jobs)
        accounts = fetch_accounts(req_id, user_id)
        return {"status": "success", "accounts": accounts}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/accounts")
async def get_accounts(user_id: str):
    try:
        # fetch all linked requisitions for user
        resp = supabase.table("requisitions").select("requisition_id").eq("user_id", user_id).eq("status", "LN").execute()
        accounts = []
        for r in resp.data:
            accounts.extend(fetch_accounts(r["requisition_id"], user_id))
        return accounts
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/transactions")
async def get_transactions(account_id: str, months: int = 12):
    # return persisted transactions from Supabase
    try:
        response = supabase.table("transactions").select("*").eq("account_id", account_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/statistics")
async def get_statistics(user_id: str, months: int = 12):
    try:
        # Get all accounts for the user
        accounts = fetch_accounts(user_id)
        if not accounts:
            raise HTTPException(status_code=404, detail="No accounts found for user")

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
            transactions = fetch_transactions(account_id, months)
            for tx in transactions:
                # Use snake_case fields from upserted records
                amount = tx.get("amount", 0)
                # Parse booking_date
                date = datetime.fromisoformat(tx.get("booking_date", "").replace("Z", "+00:00"))
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

        # Sort and limit top merchants
        top_merchants = dict(sorted(top_merchants.items(), key=lambda x: x[1], reverse=True)[:10])

        # Calculate savings opportunities
        for category, amount in category_spending.items():
            if amount > 100:  # Only suggest savings for categories with significant spending
                deals = scrape_best_deals(f"Find best deals and savings for {category}")
                if deals:
                    savings_opportunities.append({
                        "category": category,
                        "current_spending": amount,
                        "savings_suggestions": deals
                    })

        # Store statistics in Supabase
        stats_data = {
            "user_id": user_id,
            "total_spending": total_spending,
            "total_income": total_income,
            "category_spending": category_spending,
            "monthly_spending": monthly_spending,
            "top_merchants": top_merchants,
            "savings_opportunities": savings_opportunities,
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
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/ai/insights")
async def get_ai_insights(user_id: str):
    try:
        # Get user's statistics
        stats = get_statistics(user_id)

        # Construct a detailed prompt for AI analysis
        prompt = f"""
        Analyze the following spending data and provide personalized insights and recommendations:

        Total Spending: £{stats['total_spending']:.2f}
        Total Income: £{stats['total_income']:.2f}

        Spending by Category:
        {json.dumps(stats['category_spending'], indent=2)}

        Monthly Spending Trend:
        {json.dumps(stats['monthly_spending'], indent=2)}

        Top Spending Areas:
        {json.dumps(stats['top_merchants'], indent=2)}

        Please provide:
        1. A summary of spending patterns
        2. Areas where spending could be optimized
        3. Specific recommendations for saving money
        4. Comparison with average spending in these categories
        5. Actionable steps to improve financial health
        """

        insights = get_spending_insights(prompt)
        return {"insights": insights}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/expert-tips")
async def get_expert_tips_endpoint(user_id: str):
    try:
        # Get user's statistics
        stats = await get_statistics(user_id)
        
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

@app.get("/api/spending/chart")
async def get_spending_chart(category: str = "all"):
    """
    Get weekly spending data for the chart.
    category can be: transportation, shopping, groceries, dining out, entertainment, bills, other, all
    """
    try:
        # Get mock transactions directly from MOCK_TRANSACTIONS
        transactions = MOCK_TRANSACTIONS.get("transactions", {}).get("booked", [])
        
        # Convert to Transaction objects and classify them
        transaction_objects = []
        for t in transactions:
            try:
                transaction = Transaction(
                    transactionId=t.get("transactionId", ""),
                    bookingDate=t.get("bookingDate", ""),
                    valueDate=t.get("valueDate", ""),
                    transactionAmount=t.get("transactionAmount", {}),
                    remittanceInformationUnstructured=t.get("remittanceInformationUnstructured", ""),
                    proprietaryBankTransactionCode=t.get("proprietaryBankTransactionCode", ""),
                    internalTransactionId=t.get("internalTransactionId", "")
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
                
                transaction_objects.append(transaction)
            except Exception as e:
                print(f"Error creating transaction object: {e}")
                continue
        
        # Prepare chart data
        chart_data = []
        
        # Group transactions by week
        weekly_data = {}
        for transaction in transaction_objects:
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
        print(f"Category: {category}")
        print("Chart data:", json.dumps(chart_data, indent=2))
        
        return {
            "success": True,
            "data": chart_data
        }
        
    except Exception as e:
        print(f"Error getting spending chart data: {e}")
        return {
            "success": False,
            "error": str(e)
        }