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
                try:
                    # Use snake_case fields from upserted records
                    amount = tx.get("amount", 0)

                    # Parse booking_date
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
                    continue

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