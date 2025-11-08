import React, { useState, useMemo } from 'react';
import { 
  Search, Download, Eye, Edit, Filter, ArrowUpDown,
  ChevronLeft, ChevronRight, FileSpreadsheet
} from 'lucide-react';

// Badge de Status com cores
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'CONCLUÍDA': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    'EM ANDAMENTO': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    'ATRASADA': { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
    'NÃO INICIADA': { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' },
    'PAUSADA': { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' }
  };
  
  const config = statusConfig[status] || statusConfig['NÃO INICIADA'];
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} mr-2`}></span>
      {status}
    </span>
  );
};

// Barra de Progresso
const ProgressBar = ({ percentage }) => {
  const getColor = () => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700">{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getColor()} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Componente de Tabela de Entregas
const TabelaEntregas = ({ entregas, onEdit, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('codigo_entrega');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filtrar e ordenar dados
  const filteredData = useMemo(() => {
    let filtered = entregas.filter(entrega => {
      const searchLower = searchTerm.toLowerCase();
      return (
        entrega.codigo_entrega?.toLowerCase().includes(searchLower) ||
        entrega.descricao_entrega?.toLowerCase().includes(searchLower) ||
        entrega.secretarias?.sigla?.toLowerCase().includes(searchLower) ||
        entrega.interlocutor?.toLowerCase().includes(searchLower)
      );
    });
    
    // Ordenar
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'secretarias') {
        aVal = a.secretarias?.sigla || '';
        bVal = b.secretarias?.sigla || '';
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [entregas, searchTerm, sortField, sortDirection]);
  
  // Paginação
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const exportToCSV = () => {
    const headers = [
      'Secretaria', 'Código', 'Entrega', 'Status', 'Progresso (%)',
      'Data Início', 'Data Término', 'Interlocutor'
    ];
    
    const rows = filteredData.map(e => [
      e.secretarias?.sigla || '',
      e.codigo_entrega || '',
      e.descricao_entrega || '',
      e.status || '',
      e.percentual_execucao || 0,
      e.data_inicio || '',
      e.data_termino || '',
      e.interlocutor || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `entregas_seppe_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Entregas Detalhadas</h3>
          <div className="flex space-x-3">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>
        
        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código, descrição, secretaria..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
      </div>
      
      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('secretarias')}
                  className="flex items-center space-x-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Secretaria</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('codigo_entrega')}
                  className="flex items-center space-x-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Código</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-semibold text-gray-700">Entrega</span>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Status</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('percentual_execucao')}
                  className="flex items-center space-x-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Progresso</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-semibold text-gray-700">Interlocutor</span>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="text-xs font-semibold text-gray-700">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData.map((entrega) => (
              <tr key={entrega.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entrega.secretarias?.cor_primaria }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {entrega.secretarias?.sigla}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-gray-700 font-mono">
                    {entrega.codigo_entrega}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="max-w-md">
                    <p className="text-sm text-gray-900 line-clamp-2">
                      {entrega.descricao_entrega}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={entrega.status} />
                </td>
                <td className="px-4 py-4">
                  <div className="w-32">
                    <ProgressBar percentage={entrega.percentual_execucao || 0} />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-gray-700">
                    {entrega.interlocutor || '-'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onView?.(entrega)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit?.(entrega)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Paginação */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Mostrar</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-700">
            de {filteredData.length} registros
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-1">
            {[...Array(totalPages)].map((_, idx) => {
              const page = idx + 1;
              // Mostrar apenas páginas próximas
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return <span key={page} className="px-2 text-gray-400">...</span>;
              }
              return null;
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabelaEntregas;
