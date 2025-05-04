import os
import time
import logging
from datetime import datetime, timedelta
from supabase import create_client, Client
from banking import fetch_transactions
from dotenv import load_dotenv

# Load env
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Ensure environment variables are set
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables must be set")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("worker")

POLL_INTERVAL = 60  # seconds
TRANSACTION_MONTHS = 6

if __name__ == "__main__":
    logger.info("Starting account queue worker...")
    while True:
        try:
            # fetch pending accounts
            resp = supabase.table("account_queue").select("account_id, user_id").eq("status", "pending").limit(20).execute()
            queue = resp.data or []
            if not queue:
                time.sleep(POLL_INTERVAL)
                continue
            for entry in queue:
                acct_id = entry.get("account_id")
                user_id = entry.get("user_id")
                logger.info(f"Processing account {acct_id} for user {user_id}")
                # fetch and persist last 90 days via background fetch_transactions
                try:
                    if acct_id is not None:
                        fetch_transactions(str(acct_id))
                    else:
                        logger.error(f"Skipping account with None account_id for user {user_id}")
                        continue
                    # mark processed
                    supabase.table("account_queue").update({
                        "status": "processed",
                        "processed_at": datetime.utcnow().isoformat()
                    }).eq("account_id", acct_id).execute()
                    logger.info(f"Finished processing account {acct_id}")
                except Exception as e:
                    logger.error(f"Error processing account {acct_id}: {e}")
                    # optionally retry later
            # throttle between batches
            time.sleep(POLL_INTERVAL)
        except Exception as e:
            logger.error(f"Worker encountered error: {e}")
            time.sleep(POLL_INTERVAL)
