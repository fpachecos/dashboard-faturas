import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import FilterBar from '@/components/FilterBar';
import CSVUpload from '@/components/CSVUpload';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWithAuth } from '@/lib/api-client';
import { Transaction, Category, FilterOptions } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function DashboardContent() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
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
  
  // Calculate statistics by category
  const categoryStats = categories.map(category => {
    const categoryTransactions = transactions.filter(t => t.category === category.id);
    const total = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.value), 0);
    const count = categoryTransactions.length;
    
    return {
      name: category.name,
      total,
      count,
      color: category.color,
    };
  }).filter(stat => stat.total > 0);
  
  // Calculate total by category for pie chart
  const pieData = categoryStats.map(stat => ({
    name: stat.name,
    value: stat.total,
  }));
  
  // Calculate monthly totals
  const monthlyData = transactions.reduce((acc, transaction) => {
    const [day, month, year] = transaction.date.split('/');
    const monthKey = `${year}-${month}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, total: 0 };
    }
    acc[monthKey].total += Math.abs(transaction.value);
    return acc;
  }, {} as Record<string, { month: string; total: number }>);
  
  const monthlyChartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Dashboard por Categoria</h1>
        
        <CSVUpload onUpload={handleUpload} />
        
        <FilterBar categories={categories} onFilterChange={setFilters} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Gastos por Categoria</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryStats[index]?.color || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Gastos Mensais</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="total" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Resumo por Categoria</h2>
          
          {/* Mobile: Cards */}
          <div className="block md:hidden space-y-3">
            {categoryStats
              .sort((a, b) => b.total - a.total)
              .map((stat) => (
                <div key={stat.name} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: stat.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">{stat.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      R$ {stat.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{stat.count} transações</span>
                    <span>Média: R$ {stat.count > 0 ? (stat.total / stat.count).toFixed(2) : '0.00'}</span>
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
                    Total
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Média
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryStats
                  .sort((a, b) => b.total - a.total)
                  .map((stat) => (
                    <tr key={stat.name}>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: stat.color }}
                          />
                          <span className="text-sm font-medium text-gray-900">{stat.name}</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {stat.total.toFixed(2)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.count}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        R$ {stat.count > 0 ? (stat.total / stat.count).toFixed(2) : '0.00'}
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

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

