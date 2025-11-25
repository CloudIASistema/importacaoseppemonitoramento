import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, 
  Clock, Target, FileText, Users, Calendar, Filter,
  Download, RefreshCw, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';

// Configuração Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Cores para status
const STATUS_COLORS = {
  'CONCLUÍDA': '#10B981',
  'EM ANDAMENTO': '#3B82F6',
  'ATRASADA': '#EF4444',
  'NÃO INICIADA': '#6B7280',
  'PAUSADA': '#F59E0B'
};

// Componente de Card Estatístico com Gradiente
const StatCard = ({ title, value, subtitle, icon: Icon, gradient, trend, trendValue }) => (
  <div className={`relative overflow-hidden rounded-2xl shadow-xl ${gradient} p-6 transform hover:scale-105 transition-all duration-300`}>
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />
    </div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white/80 text-sm font-medium mb-2">{title}</p>
          <h3 className="text-white text-4xl font-bold mb-1">{value}</h3>
          {subtitle && (
            <p className="text-white/70 text-sm">{subtitle}</p>
          )}
        </div>
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center space-x-2">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-white" />
          ) : (
            <TrendingDown className="w-4 h-4 text-white" />
          )}
          <span className="text-white/90 text-sm font-medium">{trendValue}</span>
        </div>
      )}
    </div>
  </div>
);

// Componente de Filtros Múltiplos
const MultiSelectFilter = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleOption = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 flex justify-between items-center hover:border-blue-400 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">
          {label} {selected.length > 0 && `(${selected.length})`}
        </span>
        <Filter className="w-5 h-5 text-gray-400" />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 max-h-64 overflow-y-auto">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggleOption(option.value)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente Principal do Dashboard
const DashboardSEPPE = () => {
  // Estados
  const [loading, setLoading] = useState(true);
  const [secretarias, setSecretarias] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  
  // Filtros
  const [filtroSecretarias, setFiltroSecretarias] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState([]);
  const [filtroAno, setFiltroAno] = useState([new Date().getFullYear()]);
  const [filtroMes, setFiltroMes] = useState([]);
  
  // Visualização
  const [tipoVisualizacao, setTipoVisualizacao] = useState('geral');
  
  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, [filtroSecretarias, filtroStatus, filtroAno, filtroMes]);
  
  const carregarDados = async () => {
    setLoading(true);
    
    try {
      // Carregar secretarias
      const { data: secData } = await supabase
        .from('secretarias')
        .select('*')
        .eq('ativo', true)
        .order('sigla');
      
      setSecretarias(secData || []);
      
      // Montar query de entregas com filtros
      let query = supabase
        .from('entregas')
        .select(`
          *,
          secretarias (sigla, nome_completo, cor_primaria, cor_secundaria)
        `);
      
      // Aplicar filtros
      if (filtroSecretarias.length > 0) {
        query = query.in('secretaria_id', filtroSecretarias);
      }
      
      if (filtroStatus.length > 0) {
        query = query.in('status', filtroStatus);
      }
      
      if (filtroAno.length > 0) {
        query = query.in('ano_referencia', filtroAno);
      }
      
      if (filtroMes.length > 0) {
        query = query.in('mes_referencia', filtroMes);
      }
      
      const { data: entData } = await query;
      setEntregas(entData || []);
      
      // Calcular estatísticas
      calcularEstatisticas(entData || []);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const calcularEstatisticas = (dados) => {
    const total = dados.length;
    const concluidas = dados.filter(e => e.status === 'CONCLUÍDA').length;
    const emAndamento = dados.filter(e => e.status === 'EM ANDAMENTO').length;
    const atrasadas = dados.filter(e => e.status === 'ATRASADA').length;
    const naoIniciadas = dados.filter(e => e.status === 'NÃO INICIADA').length;
    
    const percentualMedio = dados.length > 0
      ? (dados.reduce((acc, e) => acc + (e.percentual_execucao || 0), 0) / dados.length).toFixed(2)
      : 0;
    
    const taxaConclusao = total > 0 ? ((concluidas / total) * 100).toFixed(2) : 0;
    
    setEstatisticas({
      total,
      concluidas,
      emAndamento,
      atrasadas,
      naoIniciadas,
      percentualMedio,
      taxaConclusao
    });
  };
  
  // Preparar dados para gráficos
  const getDadosGraficoStatus = () => {
    if (!estatisticas) return [];
    
    return [
      { name: 'Concluídas', value: estatisticas.concluidas, color: STATUS_COLORS['CONCLUÍDA'] },
      { name: 'Em Andamento', value: estatisticas.emAndamento, color: STATUS_COLORS['EM ANDAMENTO'] },
      { name: 'Atrasadas', value: estatisticas.atrasadas, color: STATUS_COLORS['ATRASADA'] },
      { name: 'Não Iniciadas', value: estatisticas.naoIniciadas, color: STATUS_COLORS['NÃO INICIADA'] }
    ].filter(item => item.value > 0);
  };
  
  const getDadosGraficoSecretarias = () => {
    const secretariaStats = {};
    
    entregas.forEach(entrega => {
      const sigla = entrega.secretarias?.sigla;
      if (!sigla) return;
      
      if (!secretariaStats[sigla]) {
        secretariaStats[sigla] = {
          sigla,
          total: 0,
          concluidas: 0,
          percentualMedio: 0,
          cor: entrega.secretarias.cor_primaria
        };
      }
      
      secretariaStats[sigla].total++;
      if (entrega.status === 'CONCLUÍDA') {
        secretariaStats[sigla].concluidas++;
      }
      secretariaStats[sigla].percentualMedio += (entrega.percentual_execucao || 0);
    });
    
    return Object.values(secretariaStats).map(stat => ({
      ...stat,
      percentualMedio: stat.total > 0 ? (stat.percentualMedio / stat.total).toFixed(2) : 0,
      taxaConclusao: stat.total > 0 ? ((stat.concluidas / stat.total) * 100).toFixed(2) : 0
    })).sort((a, b) => b.percentualMedio - a.percentualMedio);
  };
  
  const getDadosEvolucaoMensal = () => {
    const evolucao = {};
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    entregas.forEach(entrega => {
      const key = `${entrega.ano_referencia}-${entrega.mes_referencia}`;
      const mesNome = meses[entrega.mes_referencia - 1];
      const periodo = `${mesNome}/${entrega.ano_referencia}`;
      
      if (!evolucao[key]) {
        evolucao[key] = {
          periodo,
          total: 0,
          concluidas: 0,
          percentualMedio: 0,
          ano: entrega.ano_referencia,
          mes: entrega.mes_referencia
        };
      }
      
      evolucao[key].total++;
      if (entrega.status === 'CONCLUÍDA') {
        evolucao[key].concluidas++;
      }
      evolucao[key].percentualMedio += (entrega.percentual_execucao || 0);
    });
    
    return Object.values(evolucao)
      .map(e => ({
        ...e,
        percentualMedio: e.total > 0 ? (e.percentualMedio / e.total).toFixed(2) : 0,
        taxaConclusao: e.total > 0 ? ((e.concluidas / e.total) * 100).toFixed(2) : 0
      }))
      .sort((a, b) => {
        if (a.ano !== b.ano) return a.ano - b.ano;
        return a.mes - b.mes;
      });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Carregando dados...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard SEPPE
              </h1>
              <p className="text-gray-600 mt-1">
                Sistema de Planejamento Estratégico - Campo Grande, MS
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={carregarDados}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg flex items-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Atualizar</span>
              </button>
              
              <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Filtros</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MultiSelectFilter
              label="Secretarias"
              options={secretarias.map(s => ({ value: s.id, label: s.sigla }))}
              selected={filtroSecretarias}
              onChange={setFiltroSecretarias}
            />
            
            <MultiSelectFilter
              label="Status"
              options={Object.keys(STATUS_COLORS).map(s => ({ value: s, label: s }))}
              selected={filtroStatus}
              onChange={setFiltroStatus}
            />
            
            <MultiSelectFilter
              label="Ano"
              options={[2024, 2025, 2026].map(y => ({ value: y, label: y.toString() }))}
              selected={filtroAno}
              onChange={setFiltroAno}
            />
            
            <MultiSelectFilter
              label="Mês"
              options={[
                { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
                { value: 3, label: 'Março' }, { value: 4, label: 'Abril' },
                { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
                { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' },
                { value: 9, label: 'Setembro' }, { value: 10, label: 'Outubro' },
                { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
              ]}
              selected={filtroMes}
              onChange={setFiltroMes}
            />
          </div>
        </div>
        
        {/* Cards de Estatísticas */}
        {estatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total de Entregas"
              value={estatisticas.total}
              subtitle={`${estatisticas.concluidas} concluídas`}
              icon={FileText}
              gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              trend="up"
              trendValue={`${estatisticas.taxaConclusao}% concluído`}
            />
            
            <StatCard
              title="Em Andamento"
              value={estatisticas.emAndamento}
              subtitle={`${estatisticas.percentualMedio}% progresso médio`}
              icon={Clock}
              gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
            />
            
            <StatCard
              title="Atrasadas"
              value={estatisticas.atrasadas}
              subtitle={`${((estatisticas.atrasadas / estatisticas.total) * 100).toFixed(1)}% do total`}
              icon={AlertCircle}
              gradient="bg-gradient-to-br from-red-500 to-red-600"
              trend={estatisticas.atrasadas > 0 ? "down" : "up"}
              trendValue={estatisticas.atrasadas > 0 ? "Requer atenção" : "Tudo ok"}
            />
            
            <StatCard
              title="Taxa de Conclusão"
              value={`${estatisticas.taxaConclusao}%`}
              subtitle={`Meta: 85%`}
              icon={Target}
              gradient="bg-gradient-to-br from-green-500 to-green-600"
              trend={parseFloat(estatisticas.taxaConclusao) >= 85 ? "up" : "down"}
              trendValue={parseFloat(estatisticas.taxaConclusao) >= 85 ? "Meta atingida" : "Abaixo da meta"}
            />
          </div>
        )}
        
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Status */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Distribuição por Status</h3>
              <PieChartIcon className="w-6 h-6 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getDadosGraficoStatus()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getDadosGraficoStatus().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Gráfico de Evolução Mensal */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Evolução Mensal</h3>
              <BarChart3 className="w-6 h-6 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getDadosEvolucaoMensal()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="periodo" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="percentualMedio" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="% Execução Média"
                  dot={{ fill: '#3B82F6', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="taxaConclusao" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Taxa de Conclusão"
                  dot={{ fill: '#10B981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Ranking de Secretarias */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Performance por Secretaria</h3>
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={getDadosGraficoSecretarias().slice(0, 10)} 
              layout="vertical"
              margin={{ left: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#666" />
              <YAxis dataKey="sigla" type="category" stroke="#666" />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="percentualMedio" 
                fill="#3B82F6" 
                name="% Execução Média"
                radius={[0, 8, 8, 0]}
              />
              <Bar 
                dataKey="taxaConclusao" 
                fill="#10B981" 
                name="Taxa de Conclusão"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardSEPPE;
