import asyncio
import uuid
from typing import List, Optional, Dict
from datetime import datetime, timedelta

from openai import AsyncOpenAI
from pydantic import BaseModel, Field

from ai import Transaction, analyze_transactions, classify_transaction_with_llm, get_expert_tips, get_spending_insights, scrape_best_deals

# --- Pydantic Models for Structured Data ---

class SpendingAnalysis(BaseModel):
    category: str = Field(description="The spending category analyzed")
    weekly_average: float = Field(description="Average weekly spending in this category")
    trend: str = Field(description="Trend analysis (increasing, decreasing, stable)")
    recommendations: List[str] = Field(description="List of specific recommendations for this category")

class MarketplaceOffer(BaseModel):
    title: str = Field(description="Title of the offer")
    description: str = Field(description="Detailed description of the offer")
    category: str = Field(description="Category this offer belongs to")
    potential_savings: float = Field(description="Estimated potential savings")
    relevance_score: float = Field(description="Score indicating how relevant this offer is to the user's spending patterns")
    url: Optional[str] = Field(default=None, description="URL to the offer if available")

class FinancialInsights(BaseModel):
    overall_spending_trend: str = Field(description="Analysis of overall spending trends")
    category_insights: List[SpendingAnalysis] = Field(description="Detailed analysis by category")
    marketplace_offers: List[MarketplaceOffer] = Field(description="Personalized marketplace offers")
    expert_tips: List[str] = Field(description="Expert tips for financial improvement")

# --- Tool Definitions ---

@function_tool
async def analyze_category_spending(transactions: List[Transaction], category: str) -> SpendingAnalysis:
    """
    Analyzes spending patterns for a specific category.

    Args:
        transactions: List of transactions to analyze
        category: Category to analyze
    """
    # Filter transactions for the category
    category_transactions = [tx for tx in transactions if tx.category == category]

    if not category_transactions:
        return SpendingAnalysis(
            category=category,
            weekly_average=0,
            trend="No data",
            recommendations=["No spending data available for this category"]
        )

    # Calculate weekly averages
    weekly_totals = {}
    for tx in category_transactions:
        date = datetime.strptime(tx.bookingDate, "%Y-%m-%d")
        week_start = date - timedelta(days=date.weekday())
        week_key = week_start.strftime("%Y-%m-%d")

        amount = float(tx.transactionAmount["amount"])
        if amount < 0:  # Only consider spending (negative amounts)
            weekly_totals[week_key] = weekly_totals.get(week_key, 0) + abs(amount)

    # Calculate average and trend
    if weekly_totals:
        weekly_average = sum(weekly_totals.values()) / len(weekly_totals)
        sorted_weeks = sorted(weekly_totals.items())
        if len(sorted_weeks) > 1:
            first_week = sorted_weeks[0][1]
            last_week = sorted_weeks[-1][1]
            trend = "increasing" if last_week > first_week else "decreasing" if last_week < first_week else "stable"
        else:
            trend = "stable"
    else:
        weekly_average = 0
        trend = "no data"

    # Generate recommendations based on spending patterns
    recommendations = []
    if weekly_average > 0:
        if trend == "increasing":
            recommendations.append(f"Your spending in {category} is increasing. Consider setting a budget.")
        elif trend == "decreasing":
            recommendations.append(f"Good job! Your spending in {category} is decreasing.")

        # Add category-specific recommendations
        if category == "groceries":
            recommendations.append("Consider meal planning to reduce grocery spending")
            recommendations.append("Look for bulk buying opportunities for non-perishable items")
        elif category == "dining_out":
            recommendations.append("Try cooking at home more often to save on dining out")
            recommendations.append("Use restaurant loyalty programs for discounts")
        elif category == "transportation":
            recommendations.append("Consider carpooling or public transport to reduce costs")
            recommendations.append("Look for fuel-saving driving techniques")

    return SpendingAnalysis(
        category=category,
        weekly_average=weekly_average,
        trend=trend,
        recommendations=recommendations
    )

@function_tool
async def find_relevant_offers(category: str, weekly_spending: float) -> List[MarketplaceOffer]:
    """
    Finds relevant marketplace offers based on spending patterns.

    Args:
        category: Category to find offers for
        weekly_spending: Average weekly spending in this category
    """
    # Get deals from the scraping function
    deals = await scrape_best_deals(category)

    # Convert deals to marketplace offers
    offers = []
    for deal in deals:
        # Calculate relevance score based on spending
        relevance_score = min(1.0, weekly_spending / 1000)  # Normalize to 0-1

        # Estimate potential savings (simplified calculation)
        potential_savings = weekly_spending * 0.1  # Assume 10% savings

        offers.append(MarketplaceOffer(
            title=deal.get("title", "Special Offer"),
            description=deal.get("description", "Limited time offer"),
            category=category,
            potential_savings=potential_savings,
            relevance_score=relevance_score,
            url=deal.get("url")
        ))

    return offers

# --- Agent Definition ---

FinancialAdvisorAgent = Agent(
    name="FinancialAdvisorAgent",
    instructions=f"""
    You are a financial advisor AI that analyzes spending patterns and provides personalized recommendations.
    Your goals are:
    1. Analyze the user's transaction data to understand spending patterns
    2. Identify key spending categories and trends
    3. Generate personalized recommendations for each category
    4. Find relevant marketplace offers that could help save money
    5. Provide expert tips for financial improvement

    Use the provided tools to:
    - Analyze spending patterns in each category
    - Find relevant marketplace offers
    - Generate comprehensive financial insights

    Your output should be structured and actionable, focusing on helping users save money and make better financial decisions.
    """,
    tools=[analyze_category_spending, find_relevant_offers],
    output_type=FinancialInsights
)

# --- Main Execution Logic ---

async def analyze_financial_data(transactions: List[Transaction]) -> FinancialInsights:
    """
    Main function to analyze financial data and generate insights.

    Args:
        transactions: List of transactions to analyze
    """
    # Get unique categories
    categories = set()
    for tx in transactions:
        if tx.category:
            categories.add(tx.category)

    # Analyze each category
    category_insights = []
    marketplace_offers = []

    for category in categories:
        # Analyze spending in this category
        analysis = await analyze_category_spending(transactions, category)
        category_insights.append(analysis)

        # Find relevant offers if spending is significant
        if analysis.weekly_average > 0:
            offers = await find_relevant_offers(category, analysis.weekly_average)
            marketplace_offers.extend(offers)

    # Get expert tips
    expert_tips = await get_expert_tips({
        "category_spending": {insight.category: insight.weekly_average for insight in category_insights},
        "weekly_averages": {insight.category: insight.weekly_average for insight in category_insights}
    })

    # Determine overall spending trend
    overall_trend = "stable"
    if category_insights:
        increasing_categories = sum(1 for insight in category_insights if insight.trend == "increasing")
        decreasing_categories = sum(1 for insight in category_insights if insight.trend == "decreasing")

        if increasing_categories > decreasing_categories:
            overall_trend = "increasing"
        elif decreasing_categories > increasing_categories:
            overall_trend = "decreasing"

    return FinancialInsights(
        overall_spending_trend=overall_trend,
        category_insights=category_insights,
        marketplace_offers=marketplace_offers,
        expert_tips=expert_tips
    )

if __name__ == "__main__":
    # Example usage
    async def main():
        # Load mock transactions
        from mock_data import MOCK_TRANSACTIONS

        # Convert mock transactions to Transaction objects
        transactions = []
        for tx in MOCK_TRANSACTIONS["transactions"]["booked"]:
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
                transactions.append(transaction)
            except Exception as e:
                print(f"Error processing transaction: {e}")
                continue

        # Analyze financial data
        insights = await analyze_financial_data(transactions)

        # Print results
        print("\n=== Financial Insights ===")
        print(f"Overall Spending Trend: {insights.overall_spending_trend}")

        print("\nCategory Insights:")
        for insight in insights.category_insights:
            print(f"\n{insight.category}:")
            print(f"  Weekly Average: £{insight.weekly_average:.2f}")
            print(f"  Trend: {insight.trend}")
            print("  Recommendations:")
            for rec in insight.recommendations:
                print(f"    - {rec}")

        print("\nMarketplace Offers:")
        for offer in insights.marketplace_offers:
            print(f"\n{offer.title}:")
            print(f"  Category: {offer.category}")
            print(f"  Potential Savings: £{offer.potential_savings:.2f}")
            print(f"  Relevance Score: {offer.relevance_score:.2f}")
            print(f"  Description: {offer.description}")

        print("\nExpert Tips:")
        for tip in insights.expert_tips:
            print(f"- {tip}")

    asyncio.run(main())