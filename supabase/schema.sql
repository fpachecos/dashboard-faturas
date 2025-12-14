-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
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
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice_date ON transactions(invoice_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_cardholder ON transactions(cardholder);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (id, name, color) VALUES
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
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies if you want to enable RLS
-- Example: Allow all operations for authenticated users
-- CREATE POLICY "Allow all for authenticated users" ON transactions
--   FOR ALL USING (auth.role() = 'authenticated');
-- CREATE POLICY "Allow all for authenticated users" ON categories
--   FOR ALL USING (auth.role() = 'authenticated');

