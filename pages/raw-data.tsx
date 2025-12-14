import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import FilterBar from '@/components/FilterBar';
import CSVUpload from '@/components/CSVUpload';
import { Transaction, Category, FilterOptions } from '@/types';

export default function RawData() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const [loading, setLoading] = useState(true);
  
  const fetchData = useCallback(async () => {
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
        fetch(`/api/transactions?${params.toString()}`),
        fetch('/api/categories'),
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
  }, [filters]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleUpload = async (csvContent: string, filename: string) => {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvContent, filename }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload');
    }
    
    await fetchData();
  };
  
  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      category: transaction.category,
      type: transaction.type,
    });
  };
  
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };
  
  const saveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update');
      }
      
      await fetchData();
      setEditingId(null);
      setEditForm({});
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
      const response = await fetch(`/api/transactions/${id}`, {
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
  
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Sem categoria';
    return categories.find(c => c.id === categoryId)?.name || 'Sem categoria';
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
              {editingId === transaction.id ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Estabelecimento</div>
                    <div className="text-sm font-medium text-gray-900">{transaction.establishment}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Valor</div>
                    <div className="text-lg font-semibold text-gray-900">R$ {Math.abs(transaction.value).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Data</div>
                    <div className="text-sm text-gray-900">{transaction.date}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Categoria</label>
                    <select
                      value={editForm.category || ''}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-2"
                    >
                      <option value="">Sem categoria</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tipo</label>
                    <select
                      value={editForm.type || ''}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'Fixo' | 'Variável' })}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-2"
                    >
                      <option value="">Selecione</option>
                      <option value="Fixo">Fixo</option>
                      <option value="Variável">Variável</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => saveEdit(transaction.id)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                      <span className="font-medium">Categoria:</span> {getCategoryName(transaction.category)}
                    </div>
                    <div>
                      <span className="font-medium">Tipo:</span> {transaction.type || '-'}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <button
                      onClick={() => startEdit(transaction)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </>
              )}
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
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    {editingId === transaction.id ? (
                      <>
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
                          <select
                            value={editForm.category || ''}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">Sem categoria</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <select
                            value={editForm.type || ''}
                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'Fixo' | 'Variável' })}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">Selecione</option>
                            <option value="Fixo">Fixo</option>
                            <option value="Variável">Variável</option>
                          </select>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => saveEdit(transaction.id)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancelar
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
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
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getCategoryName(transaction.category)}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.type || '-'}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => startEdit(transaction)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Excluir
                          </button>
                        </td>
                      </>
                    )}
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

