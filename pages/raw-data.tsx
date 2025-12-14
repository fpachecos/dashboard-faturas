import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import FilterBar from '@/components/FilterBar';
import CSVUpload from '@/components/CSVUpload';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWithAuth } from '@/lib/api-client';
import { Transaction, Category, FilterOptions } from '@/types';

// Componente de Chip para Categoria
function CategoryChip({ 
  transaction, 
  categories, 
  editingField, 
  setEditingField, 
  updateField 
}: { 
  readonly transaction: Transaction;
  readonly categories: Category[];
  readonly editingField: { id: string; field: 'category' | 'type' } | null;
  readonly setEditingField: (field: { id: string; field: 'category' | 'type' } | null) => void;
  readonly updateField: (id: string, field: 'category' | 'type', value: string | undefined) => Promise<void>;
}) {
  const isEditing = editingField?.id === transaction.id && editingField?.field === 'category';
  const categoryName = transaction.category 
    ? categories.find(c => c.id === transaction.category)?.name || 'Sem categoria'
    : 'Sem categoria';
  const categoryColor = transaction.category
    ? categories.find(c => c.id === transaction.category)?.color || '#95A5A6'
    : '#95A5A6';

  if (isEditing) {
    return (
      <div className="relative">
        <select
          autoFocus
          value={transaction.category || ''}
          onChange={(e) => updateField(transaction.id, 'category', e.target.value || undefined)}
          onBlur={() => setEditingField(null)}
          className="text-xs font-medium px-2 py-1 rounded-full border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: categoryColor, color: '#FFFFFF' }}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="" style={{ backgroundColor: '#95A5A6', color: '#FFFFFF' }}>Sem categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id} style={{ backgroundColor: cat.color, color: '#FFFFFF' }}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setEditingField({ id: transaction.id, field: 'category' });
      }}
      className="text-xs font-medium px-2 py-1 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
      style={{ backgroundColor: categoryColor, color: '#FFFFFF' }}
      title="Clique para editar categoria"
    >
      {categoryName}
    </button>
  );
}

// Componente de Chip para Tipo
function TypeChip({ 
  transaction, 
  editingField, 
  setEditingField, 
  updateField 
}: { 
  readonly transaction: Transaction;
  readonly editingField: { id: string; field: 'category' | 'type' } | null;
  readonly setEditingField: (field: { id: string; field: 'category' | 'type' } | null) => void;
  readonly updateField: (id: string, field: 'category' | 'type', value: string | undefined) => Promise<void>;
}) {
  const isEditing = editingField?.id === transaction.id && editingField?.field === 'type';
  let typeColor = '#9CA3AF'; // Cinza padrão
  if (transaction.type === 'Fixo') {
    typeColor = '#3B82F6'; // Azul
  } else if (transaction.type === 'Variável') {
    typeColor = '#F59E0B'; // Laranja
  }
  const typeText = transaction.type || 'Não definido';

  if (isEditing) {
    return (
      <div className="relative">
        <select
          autoFocus
          value={transaction.type || ''}
          onChange={(e) => updateField(transaction.id, 'type', e.target.value || undefined)}
          onBlur={() => setEditingField(null)}
          className="text-xs font-medium px-2 py-1 rounded-full border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: typeColor, color: '#FFFFFF' }}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="" style={{ backgroundColor: '#9CA3AF', color: '#FFFFFF' }}>Não definido</option>
          <option value="Fixo" style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}>Fixo</option>
          <option value="Variável" style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}>Variável</option>
        </select>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setEditingField({ id: transaction.id, field: 'type' });
      }}
      className="text-xs font-medium px-2 py-1 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
      style={{ backgroundColor: typeColor, color: '#FFFFFF' }}
      title="Clique para editar tipo"
    >
      {typeText}
    </button>
  );
}

function RawDataContent() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [editingField, setEditingField] = useState<{ id: string; field: 'category' | 'type' } | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.valueMin !== undefined) params.append('valueMin', filters.valueMin.toString());
      if (filters.valueMax !== undefined) params.append('valueMax', filters.valueMax.toString());
      if (filters.invoiceDate) params.append('invoiceDate', filters.invoiceDate);
      if (filters.type) params.append('type', filters.type);
      
      const [transactionsRes, categoriesRes] = await Promise.all([
        fetchWithAuth(`/api/transactions?${params.toString()}`),
        fetchWithAuth('/api/categories'),
      ]);
      
      const transactionsData = await transactionsRes.json();
      const categoriesData = await categoriesRes.json();
      
      // Ensure we always have arrays
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, user]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleUpload = async (csvContent: string, filename: string) => {
    const response = await fetchWithAuth('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ csvContent, filename }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload');
    }
    
    await fetchData();
  };
  
  const updateField = async (id: string, field: 'category' | 'type', value: string | undefined) => {
    try {
      const updateData: Partial<Transaction> = {};
      if (field === 'category') {
        updateData.category = value || undefined;
      } else if (field === 'type') {
        updateData.type = (value as 'Fixo' | 'Variável') || undefined;
      }

      const response = await fetchWithAuth(`/api/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update');
      }
      
      await fetchData();
      setEditingField(null);
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Erro ao atualizar transação');
    }
  };

  
  const deleteTransaction = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
      return;
    }
    
    try {
      const response = await fetchWithAuth(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete');
      }
      
      await fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Erro ao excluir transação');
    }
  };
  
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Dados Brutos</h1>
        
        <CSVUpload onUpload={handleUpload} />
        
        <FilterBar categories={categories} onFilterChange={setFilters} />
        
        {/* Mobile: Cards */}
        <div className="block md:hidden space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 mb-1">{transaction.establishment}</div>
                  <div className="text-xs text-gray-500">{transaction.cardholder}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">R$ {Math.abs(transaction.value).toFixed(2)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-3 pt-3 border-t">
                <div>
                  <span className="font-medium">Data:</span> {transaction.date}
                </div>
                <div>
                  <span className="font-medium">Fatura:</span> {transaction.invoiceDate}
                </div>
                <div>
                  <span className="font-medium block mb-1">Categoria:</span>
                  <CategoryChip 
                    transaction={transaction} 
                    categories={categories}
                    editingField={editingField}
                    setEditingField={setEditingField}
                    updateField={updateField}
                  />
                </div>
                <div>
                  <span className="font-medium block mb-1">Tipo:</span>
                  <TypeChip 
                    transaction={transaction}
                    editingField={editingField}
                    setEditingField={setEditingField}
                    updateField={updateField}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <button
                  onClick={() => deleteTransaction(transaction.id)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">Nenhuma transação encontrada</p>
            </div>
          )}
        </div>
        
        {/* Desktop: Table */}
        <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estabelecimento
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Portador
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parcela
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fatura
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Excluir
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.date}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.establishment}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.cardholder}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {Math.abs(transaction.value).toFixed(2)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.installment}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.invoiceDate}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <CategoryChip 
                        transaction={transaction}
                        categories={categories}
                        editingField={editingField}
                        setEditingField={setEditingField}
                        updateField={updateField}
                      />
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <TypeChip 
                        transaction={transaction}
                        editingField={editingField}
                        setEditingField={setEditingField}
                        updateField={updateField}
                      />
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {transactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma transação encontrada</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function RawData() {
  return (
    <ProtectedRoute>
      <RawDataContent />
    </ProtectedRoute>
  );
}

