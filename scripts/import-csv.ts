import { readFileSync } from 'fs';
import { join } from 'path';
import { parseCSV, extractInvoiceDateFromFilename } from '../lib/csvParser';
import { getTransactions, saveTransactions } from '../lib/data';
import { classifyTransactionsWithAI } from '../lib/aiClassifier';
import { getCategories } from '../lib/data';

async function importCSV(filePath: string) {
  try {
    const filename = filePath.split('/').pop() || '';
    const invoiceDate = extractInvoiceDateFromFilename(filename);
    
    console.log(`Importing ${filename} with invoice date: ${invoiceDate}`);
    
    const csvContent = readFileSync(filePath, 'utf-8');
    const newTransactions = parseCSV(csvContent, invoiceDate);
    
    console.log(`Parsed ${newTransactions.length} transactions`);
    
    const existingTransactions = await getTransactions();
    const categories = await getCategories();
    
    // Classify new transactions
    const classifiedTransactions = await classifyTransactionsWithAI(
      newTransactions,
      categories
    );
    
    // Merge with existing
    const allTransactions = [...existingTransactions, ...classifiedTransactions];
    
    await saveTransactions(allTransactions);
    
    console.log(`Successfully imported ${classifiedTransactions.length} transactions`);
    console.log(`Total transactions: ${allTransactions.length}`);
  } catch (error) {
    console.error('Error importing CSV:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: ts-node scripts/import-csv.ts <path-to-csv>');
    process.exit(1);
  }
  importCSV(filePath).then(() => process.exit(0));
}

export { importCSV };

