import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import FilterBar from '@/components/FilterBar';
import CSVUpload from '@/components/CSVUpload';
import { Transaction, Category, FilterOptions } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function FixedVariable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
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
      // Don't filter by type here, we want both
      
      const [transactionsRes, categoriesRes] = await Promise.all([
        fetch(`/api/transactions?${params.toString()}`),
        fetch('/api/categories'),
      ]);
      
      const transactionsData = await transactionsRes.json();
      const categoriesData = await categoriesRes.json();
      
      setTransactions(transactionsData);
      setCategories(categoriesData);
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
  
  // Separate fixed and variable transactions
  const fixedTransactions = transactions.filter(t => t.type === 'Fixo');
  const variableTransactions = transactions.filter(t => t.type === 'Variável');
  
  const fixedTotal = fixedTransactions.reduce((sum, t) => sum + Math.abs(t.value), 0);
  const variableTotal = variableTransactions.reduce((sum, t) => sum + Math.abs(t.value), 0);
  const total = fixedTotal + variableTotal;
  
  // Monthly comparison
  const monthlyComparison = transactions.reduce((acc, transaction) => {
    const [day, month, year] = transaction.date.split('/');
    const monthKey = `${year}-${month}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, fixed: 0, variable: 0 };
    }
    
    const value = Math.abs(transaction.value);
    if (transaction.type === 'Fixo') {
      acc[monthKey].fixed += value;
    } else if (transaction.type === 'Variável') {
      acc[monthKey].variable += value;
    }
    
    return acc;
  }, {} as Record<string, { month: string; fixed: number; variable: number }>);
  
  const monthlyChartData = Object.values(monthlyComparison).sort((a, b) => a.month.localeCompare(b.month));
  
  // Category breakdown by type
  const categoryBreakdown = categories.map(category => {
    const fixed = fixedTransactions.filter(t => t.category === category.id);
    const variable = variableTransactions.filter(t => t.category === category.id);
    
    return {
      name: category.name,
      fixed: fixed.reduce((sum, t) => sum + Math.abs(t.value), 0),
      variable: variable.reduce((sum, t) => sum + Math.abs(t.value), 0),
    };
  }).filter(stat => stat.fixed > 0 || stat.variable > 0);
  
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Fixo vs Variável</h1>
        
        <CSVUpload onUpload={handleUpload} />
        
        <FilterBar categories={categories} onFilterChange={setFilters} />
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Total Fixo</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">R$ {fixedTotal.toFixed(2)}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              {total > 0 ? ((fixedTotal / total) * 100).toFixed(1) : 0}% do total
            </p>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Total Variável</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">R$ {variableTotal.toFixed(2)}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              {total > 0 ? ((variableTotal / total) * 100).toFixed(1) : 0}% do total
            </p>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Total Geral</h3>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">R$ {total.toFixed(2)}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              {fixedTransactions.length + variableTransactions.length} transações
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Comparação Mensal</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="fixed" fill="#3B82F6" name="Fixo" />
                <Bar dataKey="variable" fill="#10B981" name="Variável" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Evolução Mensal</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="fixed" stroke="#3B82F6" name="Fixo" />
                <Line type="monotone" dataKey="variable" stroke="#10B981" name="Variável" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Gastos por Categoria e Tipo</h2>
          
          {/* Mobile: Cards */}
          <div className="block md:hidden space-y-3">
            {categoryBreakdown
              .sort((a, b) => (b.fixed + b.variable) - (a.fixed + a.variable))
              .map((stat) => (
                <div key={stat.name} className="border border-gray-200 rounded-lg p-3">
                  <div className="font-medium text-gray-900 mb-2">{stat.name}</div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Fixo</div>
                      <div className="text-blue-600 font-semibold">R$ {stat.fixed.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Variável</div>
                      <div className="text-green-600 font-semibold">R$ {stat.variable.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="text-gray-900 font-semibold">R$ {(stat.fixed + stat.variable).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {/* Desktop: Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fixo
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variável
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryBreakdown
                  .sort((a, b) => (b.fixed + b.variable) - (a.fixed + a.variable))
                  .map((stat) => (
                    <tr key={stat.name}>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.name}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        R$ {stat.fixed.toFixed(2)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        R$ {stat.variable.toFixed(2)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {(stat.fixed + stat.variable).toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

