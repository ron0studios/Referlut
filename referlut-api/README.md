# Referlut API Backend

This is the backend API for Referlut, built with FastAPI, Supabase, Nordigen, and OpenAI.

## Setup

1. **Clone the repo and navigate to `referlut-api`**
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Create a `.env` file with your credentials:**
   ```env
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-key
   OPENAI_API_KEY=your-openai-api-key
   ```
4. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```

## Endpoints (MVP)
- `POST /bank/link/initiate` — Start bank account linking
- `POST /bank/link/callback` — Handle bank linking callback
- `GET /accounts` — Get linked accounts
- `GET /transactions` — Get transactions
- `GET /statistics` — Get spending/savings stats
- `POST /ai/insights` — Get AI-powered spending insights

## Next Steps
- Implement Nordigen integration
- Store and query data in Supabase
- Add OpenAI-powered insights and web scraping 