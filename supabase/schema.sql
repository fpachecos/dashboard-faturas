-- Create schema
CREATE SCHEMA IF NOT EXISTS faturas;

-- Grant usage on schema
GRANT USAGE ON SCHEMA faturas TO anon, authenticated;

-- Create transactions table
CREATE TABLE IF NOT EXISTS faturas.transactions (
  id TEXT PRIMARY KEY,
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

-- Create categories table
CREATE TABLE IF NOT EXISTS faturas.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON faturas.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice_date ON faturas.transactions(invoice_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON faturas.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON faturas.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_cardholder ON faturas.transactions(cardholder);

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

-- Insert default categories
INSERT INTO faturas.categories (id, name, color) VALUES
  ('1', 'Alimentação', '#FF6B6B'),
  ('2', 'Transporte', '#4ECDC4'),
  ('3', 'Saúde', '#45B7D1'),
  ('4', 'Educação', '#FFA07A'),
  ('5', 'Lazer', '#98D8C8'),
  ('6', 'Compras', '#F7DC6F'),
  ('7', 'Serviços', '#BB8FCE'),
  ('8', 'Assinaturas', '#85C1E2'),
  ('9', 'Combustível', '#F8B739'),
  ('10', 'Supermercado', '#52BE80'),
  ('11', 'Farmácia', '#EC7063'),
  ('12', 'Restaurante', '#F1948A'),
  ('13', 'Outros', '#95A5A6')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) - optional, adjust based on your needs
-- ALTER TABLE faturas.transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE faturas.categories ENABLE ROW LEVEL SECURITY;

-- Create policies if you want to enable RLS
-- Example: Allow all operations for authenticated users
-- CREATE POLICY "Allow all for authenticated users" ON faturas.transactions
--   FOR ALL USING (auth.role() = 'authenticated');
-- CREATE POLICY "Allow all for authenticated users" ON faturas.categories
--   FOR ALL USING (auth.role() = 'authenticated');

