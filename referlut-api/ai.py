import openai
from typing import List, Dict, Optional, Any
import json
from pydantic import BaseModel, Field
from datetime import datetime
from openai import AsyncOpenAI
import asyncio
import random
import logging
import os

# Initialize OpenAI client
client = AsyncOpenAI()

# Configure logger
logger = logging.getLogger(__name__)

class Transaction(BaseModel):
    transactionId: str
    bookingDate: str
    valueDate: str
    transactionAmount: Dict[str, str]
    remittanceInformationUnstructured: str
    proprietaryBankTransactionCode: str
    internalTransactionId: str
    entryReference: Optional[str] = None
    additionalInformation: Optional[str] = None
    creditorName: Optional[str] = None
    creditorAccount: Optional[str] = None
    debtorName: Optional[str] = None
    debtorAccount: Optional[str] = None
    bookingDateTime: Optional[str] = None
    valueDateTime: Optional[str] = None
    category: Optional[str] = None

class SpendingTip(BaseModel):
    category: str = Field(description="The spending category this tip applies to")
    current_spending: float = Field(description="Current spending amount in this category")
    tip: str = Field(description="Specific advice for saving money")
    potential_savings: float = Field(description="Estimated potential savings")
    alternatives: List[str] = Field(description="List of alternative options or programs to use")

class SpendingAnalysis(BaseModel):
    category_spending: Dict[str, float] = Field(description="Spending by category")
    top_merchants: Dict[str, float] = Field(description="Top spending merchants")
    monthly_spending: Dict[str, float] = Field(description="Monthly spending trends")

class Deal(BaseModel):
    title: str = Field(description="Deal title")
    description: str = Field(description="Description of the deal")
    merchant: str = Field(description="Store or service offering the deal")
    discount: str = Field(description="Discount percentage or amount")
    expires: Optional[str] = Field(description="Deal expiration date")
    url: Optional[str] = Field(description="URL to access the deal")

async def classify_transaction_with_llm(transaction: Transaction) -> str:
    """
    Classify a transaction into a category using OpenAI's GPT model.
    """
    try:
        # Extract relevant information for classification
        description = transaction.remittanceInformationUnstructured
        amount = transaction.transactionAmount.get("amount", "0")
        date = transaction.bookingDate
        tx_type = "debit" if float(amount) < 0 else "credit"

        # Create a prompt for the AI
        prompt = f"""
        Analyze this transaction and classify it into one of these categories:
        - groceries (food, household items from supermarkets)
        - transportation (public transport, fuel, car maintenance)
        - dining_out (restaurants, cafes, takeout)
        - entertainment (movies, events, subscriptions)
        - shopping (clothes, electronics, general retail)
        - bills (utilities, rent, subscriptions)
        - other (anything that doesn't fit above)

        Transaction details:
        Description: {description}
        Amount: {amount}
        Date: {date}
        Type: {tx_type}

        Respond with ONLY the category name, nothing else.
        """

        # Call OpenAI API
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a financial transaction classifier. Respond with only the category name."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=10
        )

        # Extract and validate the category
        content = response.choices[0].message.content
        if not content:
            logger.warning("Empty response from AI. Defaulting to other category.")
            return "other"

        category = content.strip().lower()
        valid_categories = ["groceries", "transportation", "dining_out", "entertainment", "shopping", "bills", "other"]

        if category not in valid_categories:
            logger.warning(f"Invalid category returned by AI: {category}")
            return "other"

        return category

    except Exception as e:
        logger.error(f"Error classifying transaction: {str(e)}")
        return "other"

async def analyze_transactions(transactions: List[Transaction]) -> SpendingAnalysis:
    """
    Analyze a list of transactions and return spending insights.
    """
    category_spending = {}
    top_merchants = {}
    monthly_spending = {}
    total_rewards = 0

    print("\n=== Transaction Classification Results ===")
    print("----------------------------------------")

    for transaction in transactions:
        amount = float(transaction.transactionAmount["amount"])
        merchant = transaction.remittanceInformationUnstructured
        date = datetime.strptime(transaction.bookingDate, "%Y-%m-%d")
        month_key = date.strftime("%Y-%m")

        # Classify transaction using LLM
        category = await classify_transaction_with_llm(transaction)

        # Print classification result
        print(f"Transaction: {merchant}")
        print(f"Amount: £{abs(amount):.2f}")
        print(f"Category: {category}")
        print("----------------------------------------")

        if category == "Rewards":
            total_rewards += amount
            continue

        if category == "Income":
            continue

        # Update category spending (use absolute value for spending)
        category_spending[category] = category_spending.get(category, 0) + abs(amount)

        # Update merchant spending (use absolute value)
        top_merchants[merchant] = top_merchants.get(merchant, 0) + abs(amount)

        # Update monthly spending (use absolute value)
        monthly_spending[month_key] = monthly_spending.get(month_key, 0) + abs(amount)

    print("\n=== Spending Summary ===")
    print("Category Totals:")
    for category, amount in category_spending.items():
        print(f"{category}: £{amount:.2f}")

    print(f"\nTotal Rewards Earned: £{total_rewards:.2f}")

    print("\nTop Merchants:")
    sorted_merchants = dict(sorted(top_merchants.items(), key=lambda x: x[1], reverse=True)[:5])
    for merchant, amount in sorted_merchants.items():
        print(f"{merchant}: £{amount:.2f}")

    return SpendingAnalysis(
        category_spending=category_spending,
        top_merchants=sorted_merchants,
        monthly_spending=monthly_spending
    )

async def get_spending_insights(prompt: str) -> str:
    """
    Generate spending insights based on a prompt with transaction data.
    """
    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a financial advisor providing spending insights and recommendations."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        content = response.choices[0].message.content
        return content.strip() if content is not None else "No insights available."
    except Exception as e:
        print(f"Error getting spending insights: {e}")
        return "Unable to generate spending insights at this time."

async def scrape_best_deals(category: str) -> List[Dict[str, Any]]:
    """
    Find best deals based on the spending category.
    Returns a list of deals relevant to the category.
    """
    categories_mapping = {
        "Groceries": "supermarket deals",
        "Transportation": "travel discounts",
        "Dining Out": "restaurant offers",
        "Entertainment": "entertainment discounts",
        "Shopping": "retail discounts",
        "Bills": "utility bill savings",
        "Other": "general deals",
        "all": "best money saving deals"
    }

    search_term = categories_mapping.get(category, category)

    try:
        # Current date for contextual information
        current_date = datetime.now().strftime("%B %Y")

        prompt = f"""
        Find the current best deals for {search_term} available in the UK as of {current_date}.

        For each deal, provide:
        1. Title of the deal
        2. Description of what the customer gets
        3. The merchant/provider offering it
        4. The discount percentage or amount
        5. Expiration date (if applicable)
        6. URL to access the deal (if available)

        Return the deals as a JSON list with 5-8 deals. Each deal should have these fields:
        - title: string
        - description: string
        - merchant: string
        - discount: string
        - expires: string (optional)
        - url: string (optional)

        Ensure all deals are current and actually available, not speculative.
        """

        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a deals researcher who finds current promotions and offers."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content

        if not content:
            return create_fallback_deals(category)

        try:
            deals_data = json.loads(content)
            deals = deals_data.get("deals", [])

            # If no deals were found or format is wrong, use fallback
            if not deals or not isinstance(deals, list):
                return create_fallback_deals(category)

            return deals

        except json.JSONDecodeError:
            print(f"Error decoding JSON from response: {content}")
            return create_fallback_deals(category)

    except Exception as e:
        print(f"Error finding deals: {e}")
        return create_fallback_deals(category)

def create_fallback_deals(category: str) -> List[Dict[str, Any]]:
    """Create fallback deals when the API fails"""
    category_deals = {
        "Groceries": [
            {
                "title": "£10 off £60 spend at Tesco",
                "description": "Get £10 off when you spend £60 or more on groceries",
                "merchant": "Tesco",
                "discount": "£10 off",
                "expires": "End of month",
                "url": "https://www.tesco.com/offers"
            },
            {
                "title": "3 for 2 on selected items at Sainsbury's",
                "description": "Mix and match on selected products",
                "merchant": "Sainsbury's",
                "discount": "3 for 2",
                "expires": "While stocks last"
            }
        ],
        "Transportation": [
            {
                "title": "20% off first ride with Uber",
                "description": "New users get 20% off their first ride",
                "merchant": "Uber",
                "discount": "20% off",
                "expires": "Limited time"
            },
            {
                "title": "Save 1/3 on rail fares",
                "description": "Book advance tickets and save up to 1/3",
                "merchant": "National Rail",
                "discount": "Up to 1/3 off",
                "expires": "Book 12 weeks ahead"
            }
        ],
        "Dining Out": [
            {
                "title": "50% off at Pizza Express",
                "description": "Get 50% off food Monday-Thursday",
                "merchant": "Pizza Express",
                "discount": "50% off",
                "expires": "End of month"
            },
            {
                "title": "Free delivery on first order",
                "description": "New customers get free delivery",
                "merchant": "Deliveroo",
                "discount": "Free delivery",
                "expires": "First order only"
            }
        ],
        "Entertainment": [
            {
                "title": "3 months free Disney+",
                "description": "New subscribers get 3 months free",
                "merchant": "Disney+",
                "discount": "3 months free",
                "expires": "Limited time"
            },
            {
                "title": "2 for 1 cinema tickets",
                "description": "Valid on Tuesdays and Wednesdays",
                "merchant": "Odeon",
                "discount": "2 for 1",
                "expires": "Ongoing"
            }
        ],
        "Shopping": [
            {
                "title": "20% off first order",
                "description": "New customers get 20% off",
                "merchant": "ASOS",
                "discount": "20% off",
                "expires": "First order only"
            },
            {
                "title": "Student discount",
                "description": "Get 10% off with valid student ID",
                "merchant": "UNIQLO",
                "discount": "10% off",
                "expires": "Ongoing"
            }
        ],
        "Bills": [
            {
                "title": "Switch and save",
                "description": "Save up to £200 by switching energy provider",
                "merchant": "British Gas",
                "discount": "Up to £200",
                "expires": "Limited time"
            },
            {
                "title": "Bundle and save",
                "description": "Save 20% by bundling broadband and TV",
                "merchant": "Virgin Media",
                "discount": "20% off",
                "expires": "Limited time"
            }
        ],
        "Other": [
            {
                "title": "Free delivery",
                "description": "Free delivery on orders over £20",
                "merchant": "Amazon",
                "discount": "Free delivery",
                "expires": "Ongoing"
            },
            {
                "title": "Cashback rewards",
                "description": "Earn 5% cashback on purchases",
                "merchant": "TopCashback",
                "discount": "5% cashback",
                "expires": "Ongoing"
            }
        ]
    }

    return category_deals.get(category, category_deals["Other"])

async def analyze_spending_patterns(spending_data: SpendingAnalysis) -> List[SpendingTip]:
    """
    Return tips based on actual spending patterns.
    Only returns tips for categories with non-zero spending.
    """
    tips = []

    # Groceries tip - only suggest if they're spending at expensive stores
    if spending_data.category_spending.get("Groceries", 0) > 0:
        # Check if they're already shopping at budget stores
        budget_stores = ["aldi", "lidl", "asda"]
        expensive_stores = ["waitrose", "marks", "sainsbury"]

        # Look at their top merchants to see where they shop
        merchant_names = [m.lower() for m in spending_data.top_merchants.keys()]
        shopping_at_budget = any(store in " ".join(merchant_names) for store in budget_stores)
        shopping_at_expensive = any(store in " ".join(merchant_names) for store in expensive_stores)

        if shopping_at_expensive:
            tips.append(SpendingTip(
                category="Groceries",
                current_spending=spending_data.category_spending.get("Groceries", 0),
                tip="Consider shopping at Aldi or Lidl for better value on everyday items",
                potential_savings=spending_data.category_spending.get("Groceries", 0) * 0.15,
                alternatives=["Aldi", "Lidl", "Asda"]
            ))
        elif shopping_at_budget:
            tips.append(SpendingTip(
                category="Groceries",
                current_spending=spending_data.category_spending.get("Groceries", 0),
                tip="You're already shopping at budget-friendly stores. Consider meal planning to reduce food waste",
                potential_savings=spending_data.category_spending.get("Groceries", 0) * 0.05,
                alternatives=["Meal planning", "Batch cooking", "Shopping list"]
            ))

    # Dining Out tip - only if they spend frequently
    if spending_data.category_spending.get("Dining Out", 0) > 100:  # Only if spending more than £100
        tips.append(SpendingTip(
            category="Dining Out",
            current_spending=spending_data.category_spending.get("Dining Out", 0),
            tip="Consider cooking at home more often and save dining out for special occasions",
            potential_savings=spending_data.category_spending.get("Dining Out", 0) * 0.3,
            alternatives=["Home cooking", "Meal prep", "Special occasion dining"]
        ))

    # Entertainment tip - based on subscription spending
    if spending_data.category_spending.get("Entertainment", 0) > 0:
        subscriptions = ["netflix", "spotify", "prime", "disney"]
        has_multiple_subs = sum(1 for sub in subscriptions if any(sub in m.lower() for m in spending_data.top_merchants.keys())) > 1

        if has_multiple_subs:
            tips.append(SpendingTip(
                category="Entertainment",
                current_spending=spending_data.category_spending.get("Entertainment", 0),
                tip="Consider consolidating your streaming subscriptions or sharing with family",
                potential_savings=spending_data.category_spending.get("Entertainment", 0) * 0.3,
                alternatives=["Family sharing", "Subscription rotation", "Free alternatives"]
            ))

    # If we have no tips (all spending is zero), return a general tip
    if not tips:
        tips.append(SpendingTip(
            category="General",
            current_spending=0,
            tip="No significant spending patterns detected. Start tracking your expenses to get personalized saving tips.",
            potential_savings=0,
            alternatives=["Start expense tracking", "Set up budget categories", "Monitor spending habits"]
        ))

    return tips

async def get_expert_tips(spending_data: Dict) -> List[str]:
    """
    Generate personalized financial advice using OpenAI's GPT model based on spending patterns.
    """
    try:
        # Check if OpenAI API key is configured
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("ERROR: OpenAI API key not found in environment variables")
            return get_fallback_tips()

        print("\n=== OpenAI Configuration ===")
        print("API Key configured:", "Yes" if api_key else "No")

        # Extract spending data
        category_spending = spending_data.get("category_spending", {})
        weekly_averages = spending_data.get("weekly_averages", {})

        print("\n=== Preparing AI Prompt ===")
        print("Category Spending:", json.dumps(category_spending, indent=2))
        print("Weekly Averages:", json.dumps(weekly_averages, indent=2))

        # Create a detailed prompt for the AI
        prompt = f"""
        Based on this user's spending data, provide 5 specific, actionable financial tips.
        Focus on their actual spending patterns and provide personalized advice.

        Category Spending:
        {json.dumps(category_spending, indent=2)}

        Weekly Averages:
        {json.dumps(weekly_averages, indent=2)}

        Provide tips that are:
        1. Specific to their spending patterns
        2. Actionable and practical
        3. Focused on saving money
        4. Based on their actual spending data
        5. Personalized to their lifestyle

        For each tip:
        - Reference specific spending amounts
        - Suggest concrete actions
        - Explain potential savings
        - Consider their spending habits

        Return the tips as a JSON array of strings.
        """

        print("\n=== Calling OpenAI API ===")
        print("Using model: gpt-3.5-turbo")

        try:
            # Call OpenAI API
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a financial advisor providing personalized money-saving tips based on actual spending data."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            print("\n=== API Response ===")
            print("Raw response:", content)

            if not content:
                print("No content in API response, using fallback tips")
                return get_fallback_tips()

            try:
                tips_data = json.loads(content)
                tips = tips_data.get("tips", [])
                if not tips or not isinstance(tips, list):
                    print("Invalid tips format in API response, using fallback tips")
                    return get_fallback_tips()

                print("\n=== Parsed Tips ===")
                for i, tip in enumerate(tips, 1):
                    print(f"{i}. {tip}")

                return tips

            except json.JSONDecodeError as e:
                print(f"Error decoding JSON from response: {e}")
                print("Raw content:", content)
                return get_fallback_tips()

        except Exception as api_error:
            print(f"OpenAI API Error: {str(api_error)}")
            print("API Error Details:", api_error.__class__.__name__)
            return get_fallback_tips()

    except Exception as e:
        print(f"Error generating expert tips: {e}")
        print("Error Details:", e.__class__.__name__)
        return get_fallback_tips()

def get_fallback_tips() -> List[str]:
    """Provide fallback tips when the API fails"""
    return [
        "Your weekly grocery spending is high. Consider meal planning and bulk buying to reduce costs by 20%.",
        "You're spending significantly on dining out. Try cooking at home 3 nights a week to save £150 monthly.",
        "Your transportation costs are above average. Look into carpooling or public transport options to cut costs by 30%.",
        "Entertainment subscriptions are adding up. Consider sharing accounts with family or rotating services to save £50 monthly.",
        "Your shopping expenses are high. Wait for sales and use cashback apps to save 10-15% on purchases."
    ]
