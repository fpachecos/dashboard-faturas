import Papa from 'papaparse';
import { Transaction } from '@/types';

interface CSVRow {
  Data: string;
  Estabelecimento: string;
  Portador: string;
  Valor: string;
  Parcela: string;
}

export function parseCSV(csvContent: string, invoiceDate: string): Transaction[] {
  const transactions: Transaction[] = [];
  
  const results = Papa.parse<CSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    delimiter: ';',
  });
  
  results.data.forEach((row, index) => {
    if (!row.Data || !row.Estabelecimento) return;
    
    // Parse value: "R$ 47,58" -> 47.58
    // Handle negative values like "R$ -10.690,39"
    let valueStr = row.Valor.replace('R$', '').trim();
    const isNegative = valueStr.includes('-');
    valueStr = valueStr.replace(/-/g, '').replace(/\./g, '').replace(',', '.');
    let value = parseFloat(valueStr) || 0;
    if (isNegative) value = -value;
    
    transactions.push({
      id: `${invoiceDate}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: row.Data,
      establishment: row.Estabelecimento.trim(),
      cardholder: row.Portador.trim(),
      value,
      installment: row.Parcela || '-',
      invoiceDate,
    });
  });
  
  return transactions;
}

export function extractInvoiceDateFromFilename(filename: string): string {
  // Extract date from filename like "Fatura2025-10-20.csv"
  // Returns "2025-10-20"
  const match = filename.match(/Fatura(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return match[1];
  }
  // Fallback: use current date
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

