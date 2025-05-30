import os
import logging
from fastapi import FastAPI, Depends, HTTPException, Request, Header, APIRouter, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
import datetime
import openai
from typing import Optional, Dict, List, Annotated, Union
import jwt
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
from functools import lru_cache

from mock_data import MOCK_TRANSACTIONS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Simple authentication for development
async def get_authenticated_user(
    auth: Annotated[Optional[HTTPAuthorizationCredentials], Depends(security)] = None
) -> Dict[str, str]:
    """
    Simple authentication that accepts any valid token or no token for development
    """
    # For development, we'll accept any token or no token
    return {"user_id": "mock_user", "provider": "mock"}

# API routers for better organization
banking_router = APIRouter(prefix="/api/banking", tags=["Banking"])
statistics_router = APIRouter(prefix="/api/statistics", tags=["Statistics"])
ai_router = APIRouter(prefix="/api/ai", tags=["AI"])
users_router = APIRouter(prefix="/api/users", tags=["Users"])

# Cache for transaction classifications
transaction_cache = {}

# Simple mock offers for demonstration
MOCK_OFFERS = [
    {
        "id": 1,
        "brand": "Pret A Manger",
        "title": "Pret Coffee Subscription",
        "description": "Up to 5 barista-made drinks per day for a fixed monthly fee. Choose from any organic coffees, teas, hot chocolates, and more.",
        "category": "groceries"
    },
    {
        "id": 2,
        "brand": "Virgin Atlantic",
        "title": "Flying Club",
        "description": "Earn miles when you fly with Virgin Atlantic and partner airlines. Redeem for flights, upgrades, and experiences.",
        "category": "transportation"
    },
    {
        "id": 3,
        "brand": "Starbucks",
        "title": "Starbucks Rewards",
        "description": "Earn stars with every purchase and redeem for free drinks and food.",
        "category": "dining_out"
    },
    {
        "id": 4,
        "brand": "Tesco",
        "title": "Clubcard",
        "description": "Collect points on your shopping and get discounts on future purchases.",
        "category": "shopping"
    },
]

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
        # Return mock accounts
        return [
            {
                "account_id": "mock_account_1",
                "name": "Mock Current Account",
                "balance": 1000.00,
                "currency": "GBP"
            }
        ]
    except Exception as e:
        logger.error(f"Error fetching accounts: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@banking_router.get("/status")
async def get_bank_connection_status(user_data: Annotated[Dict[str, str], Depends(get_authenticated_user)]):
    """
    Check if a user has any connected bank accounts
    """
    user_id = user_data["user_id"]
    try:
        # For mock data, always return connected
        return {
            "has_connected_bank": True,
            "accounts_count": 1,
            "requisitions_count": 1
        }
    except Exception as e:
        logger.error(f"Error checking bank connection status: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@banking_router.get("/transactions")
async def get_account_transactions(
    user_data: Annotated[Dict[str, str], Depends(get_authenticated_user)],
    account_id: str,
    months: int = 12
):
    try:
        # Return mock transactions
        return MOCK_TRANSACTIONS["transactions"]["booked"]
    except Exception as e:
        logger.error(f"Error retrieving transactions: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# User endpoints
@users_router.get("/profile")
async def get_user_profile(user_data: Annotated[Dict[str, str], Depends(get_authenticated_user)]):
    """
    Get the user's profile information
    """
    user_id = user_data["user_id"]
    try:
        # Return mock user profile
        return {
            "auth_id": user_id,
            "has_connected_bank": True,
            "exists": True,
            "accounts_count": 1
        }
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@users_router.patch("/update-bank-status")
async def update_bank_status(
    user_data: Annotated[Dict[str, str], Depends(get_authenticated_user)],
    has_connected_bank: bool
):
    """
    Manually update the user's bank connection status
    """
    user_id = user_data["user_id"]
    try:
        # For mock data, just return success
        return {"success": True, "has_connected_bank": has_connected_bank}
    except Exception as e:
        logger.error(f"Error updating bank status: {str(e)}")
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
        # Get mock transactions
        transactions = MOCK_TRANSACTIONS["transactions"]["booked"]

        # Initialize statistics
        total_spending = 0
        total_income = 0
        category_spending = {}
        monthly_spending = {}
        top_merchants = {}
        savings_opportunities = []

        # Process each transaction
        for tx in transactions:
            try:
                # Create a Transaction object
                transaction = Transaction(
                    transactionId=tx["transactionId"],
                    bookingDate=tx["bookingDate"],
                    valueDate=tx["valueDate"],
                    transactionAmount=tx["transactionAmount"],
                    remittanceInformationUnstructured=tx["remittanceInformationUnstructured"],
                    proprietaryBankTransactionCode=tx["proprietaryBankTransactionCode"],
                    internalTransactionId=tx["internalTransactionId"]
                )

                # Classify the transaction
                category = await classify_transaction_with_llm(transaction)
                amount = float(transaction.transactionAmount["amount"])

                # Parse booking_date
                date = datetime.strptime(transaction.bookingDate, "%Y-%m-%d")
                # Skip transactions older than the requested months
                if date < datetime.now() - timedelta(days=30*months):
                    continue

                month_key = date.strftime("%Y-%m")
                merchant = transaction.remittanceInformationUnstructured or "Unknown"

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
                continue

        # Sort and limit top merchants
        top_merchants = dict(sorted(top_merchants.items(), key=lambda x: x[1], reverse=True)[:10])

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
    category: str = "all",
    user_data: dict = Depends(get_authenticated_user)
):
    try:
        # Get mock transactions
        transactions = MOCK_TRANSACTIONS["transactions"]["booked"]

        # Create Transaction objects and classify them
        transaction_objects = []
        for tx in transactions:
            try:
                # Create a Transaction object
                transaction = Transaction(
                    transactionId=tx["transactionId"],
                    bookingDate=tx["bookingDate"],
                    valueDate=tx["valueDate"],
                    transactionAmount=tx["transactionAmount"],
                    remittanceInformationUnstructured=tx["remittanceInformationUnstructured"],
                    proprietaryBankTransactionCode=tx["proprietaryBankTransactionCode"],
                    internalTransactionId=tx["internalTransactionId"]
                )

                # Check if we already have this transaction classified
                cache_key = f"{transaction.transactionId}_{transaction.bookingDate}"
                if cache_key not in transaction_cache:
                    # Classify the transaction and cache the result
                    tx_category = await classify_transaction_with_llm(transaction)
                    transaction_cache[cache_key] = tx_category

                # Use the cached classification
                transaction.category = transaction_cache[cache_key]
                transaction_objects.append(transaction)
            except Exception as e:
                logger.error(f"Error creating transaction object: {e}")
                continue

        # Process transactions to get weekly data
        weekly_data = {}
        for tx in transaction_objects:
            try:
                # Skip if amount is not a valid number
                amount = float(tx.transactionAmount["amount"])
                if amount >= 0:  # Skip credits/income
                    continue

                # Get the week start date (Monday)
                date = datetime.strptime(tx.bookingDate, "%Y-%m-%d")
                week_start = date - timedelta(days=date.weekday())
                week_key = week_start.strftime("%Y-%m-%d")

                # Initialize week data if not exists
                if week_key not in weekly_data:
                    weekly_data[week_key] = {
                        "total": 0,
                        "categories": {}
                    }

                # Add to total
                weekly_data[week_key]["total"] += abs(amount)

                # Add to category
                if tx.category:
                    if tx.category not in weekly_data[week_key]["categories"]:
                        weekly_data[week_key]["categories"][tx.category] = 0
                    weekly_data[week_key]["categories"][tx.category] += abs(amount)

            except Exception as e:
                logger.error(f"Error processing transaction: {e}")
                continue

        # Convert to list and sort by week
        chart_data = [
            {
                "week": week,
                "total": data["total"],
                "categories": data["categories"]
            }
            for week, data in sorted(weekly_data.items())
        ]

        # Filter by category if specified
        if category != "all":
            filtered_data = []
            for item in chart_data:
                category_amount = item["categories"].get(category, 0)
                if category_amount > 0:  # Only include weeks with spending in this category
                    filtered_data.append({
                        "week": item["week"],
                        "total": category_amount,
                        "categories": {category: category_amount}
                    })
            chart_data = filtered_data

        return {
            "success": True,
            "data": chart_data
        }

    except Exception as e:
        logger.error(f"Error generating spending chart: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# AI endpoints
@ai_router.get("/insights")
@ai_router.post("/insights")
async def get_ai_insights():
    print("\n" + "="*50)
    print("STARTING AI INSIGHTS GENERATION")
    print("="*50)

    try:
        # Get mock transactions
        transactions = MOCK_TRANSACTIONS["transactions"]["booked"]
        print(f"\nFound {len(transactions)} transactions to analyze")

        # Convert to Transaction objects and calculate weekly averages
        transaction_objects = []
        weekly_totals = {}
        category_weekly_totals = {}

        print("\n=== Processing Transactions ===")
        for tx in transactions:
            try:
                transaction = Transaction(
                    transactionId=tx["transactionId"],
                    bookingDate=tx["bookingDate"],
                    valueDate=tx["valueDate"],
                    transactionAmount=tx["transactionAmount"],
                    remittanceInformationUnstructured=tx["remittanceInformationUnstructured"],
                    proprietaryBankTransactionCode=tx["proprietaryBankTransactionCode"],
                    internalTransactionId=tx["internalTransactionId"]
                )
                # Classify the transaction
                transaction.category = await classify_transaction_with_llm(transaction)
                transaction_objects.append(transaction)

                # Calculate weekly totals
                date = datetime.strptime(transaction.bookingDate, "%Y-%m-%d")
                week_start = date - timedelta(days=date.weekday())
                week_key = week_start.strftime("%Y-%m-%d")

                amount = float(transaction.transactionAmount["amount"])
                if amount < 0:  # Only consider spending (negative amounts)
                    # Update overall weekly totals
                    weekly_totals[week_key] = weekly_totals.get(week_key, 0) + abs(amount)

                    # Update category weekly totals
                    if transaction.category:
                        if transaction.category not in category_weekly_totals:
                            category_weekly_totals[transaction.category] = {}
                        category_weekly_totals[transaction.category][week_key] = category_weekly_totals[transaction.category].get(week_key, 0) + abs(amount)

            except Exception as e:
                print(f"Error processing transaction: {e}")
                continue

        # Calculate category spending totals
        category_spending = {}
        for tx in transaction_objects:
            try:
                amount = float(tx.transactionAmount["amount"])
                if amount < 0 and tx.category:  # Only consider spending (negative amounts)
                    category_spending[tx.category] = category_spending.get(tx.category, 0) + abs(amount)
            except Exception as e:
                print(f"Error calculating category spending: {e}")
                continue

        # Calculate weekly averages for each category
        weekly_averages = {}
        for category, weekly_data in category_weekly_totals.items():
            if weekly_data:
                weekly_averages[category] = sum(weekly_data.values()) / len(weekly_data)

        print("\n=== Spending Analysis ===")
        print("\nCategory Spending:")
        for category, amount in category_spending.items():
            print(f"{category}: £{amount:.2f}")

        print("\nWeekly Averages:")
        for category, avg in weekly_averages.items():
            print(f"{category}: £{avg:.2f}")

        # Get expert tips with the calculated data
        print("\n=== Generating Expert Tips ===")
        tips = await get_expert_tips({
            "category_spending": category_spending,
            "weekly_averages": weekly_averages
        })

        print("\n=== Generated Tips ===")
        for i, tip in enumerate(tips, 1):
            print(f"\n{i}. {tip}")

        print("\n" + "="*50)
        print("AI INSIGHTS GENERATION COMPLETE")
        print("="*50 + "\n")

        return {
            "success": True,
            "data": {
                "tips": tips,
                "category_spending": category_spending,
                "weekly_averages": weekly_averages
            }
        }
    except Exception as e:
        print(f"\nERROR in get_ai_insights: {str(e)}")
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

@ai_router.post("/marketplace-for-tip")
async def get_marketplace_for_tip(tip: dict = Body(...)):
    tip_text = tip.get("tip", "")
    offers_to_check = MOCK_OFFERS

    prompt = (
        "You are an assistant that helps match financial tips to marketplace offers. "
        "For each offer, answer YES if the offer is relevant to the tip, otherwise NO. "
        f"Tip: {tip_text}\n\n"
        "Offers:\n"
    )
    for i, offer in enumerate(offers_to_check, 1):
        prompt += f"{i}. {offer['title']} - {offer['description']}\n"

    prompt += (
        "\nRespond with a list of YES/NO, one for each offer, in order. "
        "Example: YES, NO, YES, NO"
    )

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=20,
            temperature=0,
        )
        answer = getattr(response.choices[0].message, "content", None)
        if answer is not None:
            answer = answer.strip().lower()
            yes_no = [x.strip() for x in answer.replace(".", ",").split(",")]
            matched_offers = [
                offer for offer, yn in zip(offers_to_check, yes_no) if yn.startswith("yes")
            ]
        else:
            matched_offers = offers_to_check
    except Exception as e:
        matched_offers = offers_to_check

    if not matched_offers:
        matched_offers = offers_to_check

    return {"offers": matched_offers}

# Register routers
app.include_router(banking_router)
app.include_router(statistics_router)
app.include_router(ai_router)
app.include_router(users_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)