-- Create schema
CREATE SCHEMA IF NOT EXISTS faturas;

-- Grant usage on schema
GRANT USAGE ON SCHEMA faturas TO anon, authenticated;

-- Create transactions table
CREATE TABLE IF NOT EXISTS faturas.transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  establishment TEXT NOT NULL,
  cardholder TEXT NOT NULL,
  value NUMERIC NOT NULL,
  installment TEXT,
  invoice_date TEXT NOT NULL,
  category TEXT,
  type TEXT CHECK (type IN ('Fixo', 'Variável')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create categories table (shared across users, but can be customized per user in the future)
CREATE TABLE IF NOT EXISTS faturas.categories (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON faturas.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON faturas.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice_date ON faturas.transactions(invoice_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON faturas.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON faturas.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_cardholder ON faturas.transactions(cardholder);
CREATE INDEX IF NOT EXISTS idx_transactions_establishment ON faturas.transactions(establishment);
CREATE INDEX IF NOT EXISTS idx_transactions_user_establishment ON faturas.transactions(user_id, establishment);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON faturas.categories(user_id);

-- Create function to update updated_at timestamp (in public schema so it can be used by triggers)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO anon, authenticated;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON faturas.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON faturas.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions on tables
GRANT ALL ON faturas.transactions TO anon, authenticated;
GRANT ALL ON faturas.categories TO anon, authenticated;

-- Note: Default categories will be created per user on first login
-- This is handled in the application code

-- Enable Row Level Security (RLS) for user data isolation
ALTER TABLE faturas.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturas.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions: users can only see/modify their own transactions
CREATE POLICY "Users can view their own transactions" ON faturas.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON faturas.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON faturas.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON faturas.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for categories: users can only see/modify their own categories
CREATE POLICY "Users can view their own categories" ON faturas.categories
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own categories" ON faturas.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON faturas.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON faturas.categories
  FOR DELETE USING (auth.uid() = user_id);

