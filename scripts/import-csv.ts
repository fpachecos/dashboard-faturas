import { readFileSync } from 'fs';
import { join } from 'path';
import { parseCSV, extractInvoiceDateFromFilename } from '../lib/csvParser';
import { getTransactions, addTransaction, deleteTransactionsByInvoiceMonth } from '../lib/data';
import { classifyTransactionsWithAI } from '../lib/aiClassifier';
import { getCategories } from '../lib/data';

async function importCSV(filePath: string, userId: string) {
  if (!userId) {
    throw new Error('User ID is required. Usage: ts-node scripts/import-csv.ts <path-to-csv> <user-id>');
  }

  try {
    const filename = filePath.split('/').pop() || '';
    const invoiceDate = extractInvoiceDateFromFilename(filename);
    
    console.log(`Importing ${filename} with invoice date: ${invoiceDate} for user: ${userId}`);
    
    const csvContent = readFileSync(filePath, 'utf-8');
    const newTransactions = parseCSV(csvContent, invoiceDate);
    
    console.log(`Parsed ${newTransactions.length} transactions`);
    
    // Delete existing transactions for the same invoice month
    await deleteTransactionsByInvoiceMonth(invoiceDate, userId);
    console.log(`Deleted existing transactions for invoice month: ${invoiceDate.substring(0, 7)}`);
    
    const categories = await getCategories(userId);
    
    // Classify new transactions
    const classifiedTransactions = await classifyTransactionsWithAI(
      newTransactions,
      categories
    );
    
    // Add new transactions one by one
    for (const transaction of classifiedTransactions) {
      await addTransaction(transaction, userId);
    }
    
    console.log(`Successfully imported ${classifiedTransactions.length} transactions`);
  } catch (error) {
    console.error('Error importing CSV:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const filePath = process.argv[2];
  const userId = process.argv[3];
  
  if (!filePath || !userId) {
    console.error('Usage: ts-node scripts/import-csv.ts <path-to-csv> <user-id>');
    console.error('Example: ts-node scripts/import-csv.ts ./data/fatura.csv 123e4567-e89b-12d3-a456-426614174000');
    process.exit(1);
  }
  importCSV(filePath, userId).then(() => process.exit(0));
}

export { importCSV };

