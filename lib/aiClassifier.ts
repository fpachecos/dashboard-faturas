import { Transaction, Category } from '@/types';

export async function classifyTransactionsWithAI(
  transactions: Transaction[],
  categories: Category[]
): Promise<Transaction[]> {
  // Using Hugging Face Inference API (free tier)
  // Alternative: Use OpenAI API if you have a key
  // For now, we'll use a simple rule-based classifier as fallback
  // and provide structure for AI integration
  
  const classifiedTransactions = transactions.map(transaction => {
    // Simple rule-based classification as fallback
    const category = classifyByRules(transaction, categories);
    const type = determineType(transaction);
    
    return {
      ...transaction,
      category: category?.id,
      type,
    };
  });
  
  return classifiedTransactions;
}

function classifyByRules(transaction: Transaction, categories: Category[]): Category | undefined {
  const establishment = transaction.establishment.toLowerCase();
  
  // Alimentação / Restaurante
  if (
    establishment.includes('rest') ||
    establishment.includes('food') ||
    establishment.includes('ifood') ||
    establishment.includes('99food') ||
    establishment.includes('cafeteria') ||
    establishment.includes('lanchonete') ||
    establishment.includes('pizz') ||
    establishment.includes('espeto') ||
    establishment.includes('paprika') ||
    establishment.includes('quintal')
  ) {
    return categories.find(c => c.name === 'Restaurante') || categories.find(c => c.name === 'Alimentação');
  }
  
  // Farmácia
  if (
    establishment.includes('drogaria') ||
    establishment.includes('drogasil') ||
    establishment.includes('farmacia')
  ) {
    return categories.find(c => c.name === 'Farmácia');
  }
  
  // Saúde
  if (
    establishment.includes('saude') ||
    establishment.includes('medico') ||
    establishment.includes('hospital') ||
    establishment.includes('clinica') ||
    establishment.includes('prudent') ||
    establishment.includes('rd saude') ||
    establishment.includes('totalpass')
  ) {
    return categories.find(c => c.name === 'Saúde');
  }
  
  // Transporte
  if (
    establishment.includes('uber') ||
    establishment.includes('taxi') ||
    establishment.includes('valet') ||
    establishment.includes('park') ||
    establishment.includes('estacionamento')
  ) {
    return categories.find(c => c.name === 'Transporte');
  }
  
  // Supermercado
  if (
    establishment.includes('sam') ||
    establishment.includes('pao de acucar') ||
    establishment.includes('zaffari') ||
    establishment.includes('supermercado') ||
    establishment.includes('hortifrut')
  ) {
    return categories.find(c => c.name === 'Supermercado');
  }
  
  // Assinaturas
  if (
    establishment.includes('microsoft') ||
    establishment.includes('apple') ||
    establishment.includes('amazon prime') ||
    establishment.includes('cursor') ||
    establishment.includes('netflix') ||
    establishment.includes('spotify')
  ) {
    return categories.find(c => c.name === 'Assinaturas');
  }
  
  // Combustível
  if (
    establishment.includes('shell') ||
    establishment.includes('petrobras') ||
    establishment.includes('ipiranga') ||
    establishment.includes('combustivel')
  ) {
    return categories.find(c => c.name === 'Combustível');
  }
  
  // Compras
  if (
    establishment.includes('amazon') ||
    establishment.includes('shopee') ||
    establishment.includes('mercado') ||
    establishment.includes('leroy') ||
    establishment.includes('sodimac')
  ) {
    return categories.find(c => c.name === 'Compras');
  }
  
  // Serviços
  if (
    establishment.includes('vivo') ||
    establishment.includes('conta') ||
    establishment.includes('servico') ||
    establishment.includes('paygo')
  ) {
    return categories.find(c => c.name === 'Serviços');
  }
  
  // Lazer
  if (
    establishment.includes('sony') ||
    establishment.includes('playstation') ||
    establishment.includes('resort') ||
    establishment.includes('cabeleireiro') ||
    establishment.includes('hair')
  ) {
    return categories.find(c => c.name === 'Lazer');
  }
  
  return categories.find(c => c.name === 'Outros');
}

function determineType(transaction: Transaction): 'Fixo' | 'Variável' {
  const establishment = transaction.establishment.toLowerCase();
  
  // Fixed expenses (recurring)
  const fixedKeywords = [
    'microsoft',
    'apple',
    'cursor',
    'prudent',
    'rd saude',
    'conta vivo',
    'totalpass',
    'amazon prime',
  ];
  
  if (fixedKeywords.some(keyword => establishment.includes(keyword))) {
    return 'Fixo';
  }
  
  // Check if it's a recurring establishment (appears multiple times)
  // This would require checking against existing transactions
  // For now, default to Variável
  return 'Variável';
}

