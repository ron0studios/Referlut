import openai

async def get_spending_insights(prompt: str):
    # Use OpenAI Responses API to generate insights
    response = openai.responses.create(
        model="o4-mini",
        input=[{"role": "user", "content": prompt}]
    )
    return response.content

async def scrape_best_deals(query: str):
    # Construct a detailed prompt for scraping deals
    prompt = f"""
    Scavenge the following websites for the best deals:
    - TopCashback
    - Quidco
    - Rakuten
    - hotukdeals
    - MoneySavingExpert

    Look for the best deals on:
    - Online shopping items
    - Savings bank accounts
    - Mobile contracts
    - And any other relevant deals related to: {query}

    Provide a summary of the best deals found.
    """
    # Use OpenAI to generate insights based on the prompt
    response = openai.responses.create(
        model="o4-mini",
        input=[{"role": "user", "content": prompt}]
    )
    return response.content