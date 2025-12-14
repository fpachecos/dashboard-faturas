import { useState, useEffect } from 'react';
import { FilterOptions, Category, TransactionType } from '@/types';

interface FilterBarProps {
  readonly categories: Category[];
  readonly onFilterChange: (filters: FilterOptions) => void;
}

export default function FilterBar({ categories, onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    onFilterChange(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);
  
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };
  
  const clearFilters = () => {
    setFilters({});
  };
  
  const hasActiveFilters = Object.keys(filters).length > 0;
  
  return (
    <div className="bg-white rounded-lg shadow mb-4 sm:mb-6 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <span className="text-sm font-medium text-gray-700">Filtros</span>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {Object.keys(filters).length}
              </span>
            )}
            <svg
              className={`h-5 w-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>
      
      {/* Filter Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} md:block p-3 sm:p-4`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          <div>
            <label htmlFor="category" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              id="category"
              value={filters.category || ''}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="dateFrom" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              id="dateFrom"
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="dateTo" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              id="dateTo"
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="valueMin" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Valor Mín.
            </label>
            <input
              id="valueMin"
              type="number"
              step="0.01"
              value={filters.valueMin || ''}
              onChange={(e) => updateFilter('valueMin', e.target.value ? Number.parseFloat(e.target.value) : undefined)}
              className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label htmlFor="valueMax" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Valor Máx.
            </label>
            <input
              id="valueMax"
              type="number"
              step="0.01"
              value={filters.valueMax || ''}
              onChange={(e) => updateFilter('valueMax', e.target.value ? Number.parseFloat(e.target.value) : undefined)}
              className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label htmlFor="invoiceDate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Mês/Ano da Fatura
            </label>
            <input
              id="invoiceDate"
              type="month"
              value={filters.invoiceDate || ''}
              onChange={(e) => updateFilter('invoiceDate', e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              id="type"
              value={filters.type || ''}
              onChange={(e) => updateFilter('type', e.target.value as TransactionType | undefined)}
              className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="Fixo">Fixo</option>
              <option value="Variável">Variável</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-3 sm:px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

