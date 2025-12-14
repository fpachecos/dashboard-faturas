export type TransactionType = 'Fixo' | 'Variável';

export interface Transaction {
  id: string;
  date: string; // DD/MM/YYYY
  establishment: string;
  cardholder: string;
  value: number; // valor numérico em reais
  installment: string;
  invoiceDate: string; // Data da fatura extraída do nome do CSV (YYYY-MM-DD)
  category?: string;
  type?: TransactionType;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface FilterOptions {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  valueMin?: number;
  valueMax?: number;
  invoiceDate?: string;
  type?: TransactionType;
}

