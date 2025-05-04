import openai
from typing import List, Dict, Optional
import json
from pydantic import BaseModel, Field
from datetime import datetime
from openai import AsyncOpenAI

# Initialize OpenAI client
client = AsyncOpenAI()

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
    creditorAccount: Optional[Dict] = None
    debtorName: Optional[str] = None
    debtorAccount: Optional[Dict] = None
    bookingDateTime: Optional[str] = None
    valueDateTime: Optional[str] = None

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

async def classify_transaction_with_llm(transaction: Transaction) -> str:
    """
    Use LLM to classify a transaction into a spending category or income type.
    """
    amount = float(transaction.transactionAmount["amount"])
    
    # Handle income and rewards
    if amount > 0:
        # Check if it's cashback or rewards
        description = transaction.remittanceInformationUnstructured.lower()
        if any(keyword in description for keyword in ["cashback", "reward", "interest", "refund"]):
            return "Rewards"
        return "Income"

    # Prepare the prompt for the LLM
    prompt = f"""
    Analyze this transaction and classify it into one of these categories:
    - Groceries (food, household items from supermarkets, grocery stores)
    - Transportation (trains, buses, taxis, fuel)
    - Dining Out (restaurants, cafes, pubs, takeaway)
    - Entertainment (movies, streaming services, events)
    - Shopping (retail stores, online shopping, clothing, electronics)
    - Bills (utilities, rent, subscriptions)
    - Other (anything that doesn't fit above)

    Transaction details:
    - Amount: {transaction.transactionAmount['amount']} {transaction.transactionAmount['currency']}
    - Description: {transaction.remittanceInformationUnstructured}
    - Date: {transaction.bookingDate}
    - Additional Info: {transaction.additionalInformation if transaction.additionalInformation else 'None'}

    Return ONLY the category name, nothing else.
    """

    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a financial transaction classifier. Respond with ONLY the category name."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1  # Low temperature for consistent categorization
        )
        category = response.choices[0].message.content.strip()
        print(f"Classified transaction '{transaction.remittanceInformationUnstructured}' as {category}")
        return category
    except Exception as e:
        print(f"Error classifying transaction: {e}")
        return "Other"

async def analyze_transactions(transactions: List[Transaction]) -> SpendingAnalysis:
    """
    Analyze raw transactions to generate spending statistics.
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

async def get_spending_insights(prompt: str):
    try:
        response = await client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {"role": "system", "content": "You are a financial advisor providing spending insights and recommendations."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error getting spending insights: {e}")
        return "Unable to generate spending insights at this time."

async def scrape_best_deals(query: str):
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a deal finder that provides current best deals and savings opportunities."},
                {"role": "user", "content": f"Find the best current deals for: {query}"}
            ],
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error finding deals: {e}")
        return "Unable to find deals at this time."

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
                potential_savings=0,  # Removed hardcoded savings
                alternatives=["Aldi", "Lidl", "Asda"]
            ))
        elif shopping_at_budget:
            tips.append(SpendingTip(
                category="Groceries",
                current_spending=spending_data.category_spending.get("Groceries", 0),
                tip="You're already shopping at budget-friendly stores. Consider meal planning to reduce food waste",
                potential_savings=0,
                alternatives=["Meal planning", "Batch cooking", "Shopping list"]
            ))
    
    # Dining Out tip - only if they spend frequently
    if spending_data.category_spending.get("Dining Out", 0) > 100:  # Only if spending more than £100
        tips.append(SpendingTip(
            category="Dining Out",
            current_spending=spending_data.category_spending.get("Dining Out", 0),
            tip="Consider cooking at home more often and save dining out for special occasions",
            potential_savings=0,
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
                potential_savings=0,
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

async def get_expert_tips(spending_data: Dict) -> List[Dict]:
    """
    Generate personalized spending tips based on transaction analysis.
    """
    # Convert input data to structured model
    analysis = SpendingAnalysis(**spending_data)
    
    print(f"Generating tips for spending data: {spending_data}")
    
    tips = []
    
    # Generate tips based on spending patterns
    for category, amount in analysis.category_spending.items():
        # Calculate monthly average
        monthly_amount = amount / len(analysis.monthly_spending)
        print(f"Category {category}: Monthly amount = {monthly_amount}")
        
        # Generate category-specific tips
        if category == "Groceries":
            if monthly_amount > 400:
                tips.append(SpendingTip(
                    category=category,
                    current_spending=monthly_amount,
                    tip="Consider meal planning and bulk buying to reduce grocery costs",
                    potential_savings=monthly_amount * 0.15,
                    alternatives=["Aldi", "Lidl", "Tesco Clubcard", "Sainsbury's Nectar"]
                ))
        elif category == "Dining Out":
            if monthly_amount > 200:
                tips.append(SpendingTip(
                    category=category,
                    current_spending=monthly_amount,
                    tip="Try cooking at home more often and use meal prep to save time",
                    potential_savings=monthly_amount * 0.4,
                    alternatives=["HelloFresh", "Gousto", "Meal prep recipes"]
                ))
        elif category == "Transportation":
            if monthly_amount > 150:
                tips.append(SpendingTip(
                    category=category,
                    current_spending=monthly_amount,
                    tip="Consider using a railcard or season ticket for regular travel",
                    potential_savings=monthly_amount * 0.3,
                    alternatives=["Railcard", "Season ticket", "Car sharing"]
                ))
        elif category == "Entertainment":
            if monthly_amount > 100:
                tips.append(SpendingTip(
                    category=category,
                    current_spending=monthly_amount,
                    tip="Bundle your streaming services or share accounts with family",
                    potential_savings=monthly_amount * 0.5,
                    alternatives=["Family sharing plans", "Student discounts"]
                ))
        elif category == "Shopping":
            if monthly_amount > 300:
                tips.append(SpendingTip(
                    category=category,
                    current_spending=monthly_amount,
                    tip="Use cashback websites and wait for sales before making purchases",
                    potential_savings=monthly_amount * 0.2,
                    alternatives=["Quidco", "TopCashback", "Honey browser extension"]
                ))
        elif category == "Bills":
            if monthly_amount > 500:
                tips.append(SpendingTip(
                    category=category,
                    current_spending=monthly_amount,
                    tip="Compare utility providers and consider switching to save money",
                    potential_savings=monthly_amount * 0.1,
                    alternatives=["Uswitch", "MoneySuperMarket", "Compare the Market"]
                ))
    
    print(f"Generated {len(tips)} tips")
    return [tip.model_dump() for tip in tips] 