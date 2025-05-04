-- Schema for Referlut users table with Auth0 integration
-- This file should be run in your Supabase project SQL editor

-- Create a users table that integrates with Auth0
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth0_id TEXT UNIQUE NOT NULL,  -- Auth0 user ID (sub claim)
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  has_connected_bank BOOLEAN DEFAULT FALSE,  -- Flag to track if user has connected a bank
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to view/edit only their own data
CREATE POLICY "Users can view and edit their own data"
  ON public.users
  FOR ALL
  USING (auth.uid()::text = auth0_id)
  WITH CHECK (auth.uid()::text = auth0_id);

-- Create a policy that allows authenticated users to insert their own data
CREATE POLICY "Users can insert their own data"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid()::text = auth0_id);

-- Create fetch_logs table to track API calls to bank data providers
CREATE TABLE IF NOT EXISTS public.fetch_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id TEXT NOT NULL,
  scope TEXT NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id TEXT REFERENCES public.users(auth0_id) ON DELETE CASCADE
);

-- Create requisitions table to track bank account connection requests
CREATE TABLE IF NOT EXISTS public.requisitions (
  requisition_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(auth0_id) ON DELETE CASCADE,
  institution_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL,  -- CR: Created, LN: Linked, etc.
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create accounts table to store connected bank accounts
CREATE TABLE IF NOT EXISTS public.accounts (
  account_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(auth0_id) ON DELETE CASCADE,
  institution_id TEXT NOT NULL,
  iban TEXT,
  bban TEXT,
  name TEXT,
  owner_name TEXT,
  status TEXT,
  currency TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create account_queue table for transaction processing queue
CREATE TABLE IF NOT EXISTS public.account_queue (
  account_id TEXT PRIMARY KEY REFERENCES public.accounts(account_id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(auth0_id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- pending, processing, completed, error
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table to store bank transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  transaction_id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES public.accounts(account_id) ON DELETE CASCADE,
  entry_reference TEXT,
  internal_transaction_id TEXT,
  additional_information TEXT,
  merchant_name TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT,
  booking_date DATE,
  value_date DATE,
  proprietary_bank_transaction_code TEXT,
  category TEXT,  -- debit, credit, cash, transfer, other
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth0_id ON public.users(auth0_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_booking_date ON public.transactions(booking_date);
CREATE INDEX IF NOT EXISTS idx_fetch_logs_account_scope ON public.fetch_logs(account_id, scope);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_requisitions_updated_at
BEFORE UPDATE ON public.requisitions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_account_queue_updated_at
BEFORE UPDATE ON public.account_queue
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();