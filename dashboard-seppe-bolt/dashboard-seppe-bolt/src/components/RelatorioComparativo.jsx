import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Award, AlertTriangle,
  Calendar, Filter, Download, RefreshCw
} from 'lucide-react';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const RelatorioComparativo = () => {
  const [loading, setLoading] = useState(true);
  const [secretarias, setSecretarias] = useState([]);
  const [dadosComparativos, setDadosComparativos] = useState([]);
  const [evolucaoTemporal, setEvolucaoTemporal] = useState([]);
  const [ranking, setRanking] = useState([]);
  
  // Filtros
  const [periodoInicio, setPeriodoInicio] = useState({ mes: 1, ano: 2025 });
  const [periodoFim, setPeriodoFim] = useState({ mes: new Date().getMonth() + 1, ano: 2025 });
  const [secretariasSelecionadas, setSecretariasSelecionadas] = useState([]);
  
  useEffect(() => {
    carregarDados();
  }, [periodoInicio, periodoFim, secretariasSelecionadas]);
  
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
      
      // Carregar entregas do período
      let query = supabase
        .from('entregas')
        .select(`
          *,
          secretarias (sigla, nome_completo, cor_primaria)
        `)
        .gte('ano_referencia', periodoInicio.ano)
        .lte('ano_referencia', periodoFim.ano);
      
      if (secretariasSelecionadas.length > 0) {
        query = query.in('secretaria_id', secretariasSelecionadas);
      }
      
      const { data: entData } = await query;
      
      if (entData) {
        processarDadosComparativos(entData);
        processarEvolucaoTemporal(entData);
        calcularRanking(entData);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const processarDadosComparativos = (entregas) => {
    const comparativo = {};
    
    entregas.forEach(entrega => {
      const sigla = entrega.secretarias?.sigla;
      if (!sigla) return;
      
      if (!comparativo[sigla]) {
        comparativo[sigla] = {
          sigla,
          nome: entrega.secretarias.nome_completo,
          cor: entrega.secretarias.cor_primaria,
          total: 0,
          concluidas: 0,
          atrasadas: 0,
          emAndamento: 0,
          naoIniciadas: 0,
          somaPercentual: 0
        };
      }
      
      comparativo[sigla].total++;
      comparativo[sigla].somaPercentual += (entrega.percentual_execucao || 0);
      
      switch (entrega.status) {
        case 'CONCLUÍDA':
          comparativo[sigla].concluidas++;
          break;
        case 'ATRASADA':
          comparativo[sigla].atrasadas++;
          break;
        case 'EM ANDAMENTO':
          comparativo[sigla].emAndamento++;
          break;
        case 'NÃO INICIADA':
          comparativo[sigla].naoIniciadas++;
          break;
      }
    });
    
    const dados = Object.values(comparativo).map(item => ({
      ...item,
      percentualMedio: item.total > 0 ? (item.somaPercentual / item.total).toFixed(2) : 0,
      taxaConclusao: item.total > 0 ? ((item.concluidas / item.total) * 100).toFixed(2) : 0,
      taxaAtraso: item.total > 0 ? ((item.atrasadas / item.total) * 100).toFixed(2) : 0
    }));
    
    setDadosComparativos(dados);
  };
  
  const processarEvolucaoTemporal = (entregas) => {
    const evolucao = {};
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    entregas.forEach(entrega => {
      const key = `${entrega.ano_referencia}-${entrega.mes_referencia}`;
      
      if (!evolucao[key]) {
        evolucao[key] = {
          periodo: `${meses[entrega.mes_referencia - 1]}/${entrega.ano_referencia}`,
          ano: entrega.ano_referencia,
          mes: entrega.mes_referencia,
          total: 0,
          concluidas: 0,
          somaPercentual: 0
        };
      }
      
      evolucao[key].total++;
      if (entrega.status === 'CONCLUÍDA') {
        evolucao[key].concluidas++;
      }
      evolucao[key].somaPercentual += (entrega.percentual_execucao || 0);
    });
    
    const dados = Object.values(evolucao)
      .map(e => ({
        ...e,
        percentualMedio: e.total > 0 ? (e.somaPercentual / e.total).toFixed(2) : 0,
        taxaConclusao: e.total > 0 ? ((e.concluidas / e.total) * 100).toFixed(2) : 0
      }))
      .sort((a, b) => {
        if (a.ano !== b.ano) return a.ano - b.ano;
        return a.mes - b.mes;
      });
    
    setEvolucaoTemporal(dados);
  };
  
  const calcularRanking = (entregas) => {
    const stats = {};
    
    entregas.forEach(entrega => {
      const sigla = entrega.secretarias?.sigla;
      if (!sigla) return;
      
      if (!stats[sigla]) {
        stats[sigla] = {
          sigla,
          nome: entrega.secretarias.nome_completo,
          cor: entrega.secretarias.cor_primaria,
          pontuacao: 0,
          total: 0,
          concluidas: 0,
          percentualMedio: 0
        };
      }
      
      stats[sigla].total++;
      if (entrega.status === 'CONCLUÍDA') {
        stats[sigla].concluidas++;
      }
      stats[sigla].percentualMedio += (entrega.percentual_execucao || 0);
    });
    
    const ranking = Object.values(stats)
      .map(item => {
        const taxaConclusao = item.total > 0 ? (item.concluidas / item.total) * 100 : 0;
        const percentualMedio = item.total > 0 ? item.percentualMedio / item.total : 0;
        
        // Pontuação: 60% taxa de conclusão + 40% percentual médio
        const pontuacao = (taxaConclusao * 0.6) + (percentualMedio * 0.4);
        
        return {
          ...item,
          taxaConclusao: taxaConclusao.toFixed(2),
          percentualMedio: percentualMedio.toFixed(2),
          pontuacao: pontuacao.toFixed(2)
        };
      })
      .sort((a, b) => parseFloat(b.pontuacao) - parseFloat(a.pontuacao));
    
    setRanking(ranking);
  };
  
  const exportarRelatorio = () => {
    const headers = [
      'Posição', 'Secretaria', 'Nome Completo', 'Total Entregas', 
      'Concluídas', 'Taxa Conclusão (%)', 'Percentual Médio (%)', 'Pontuação'
    ];
    
    const rows = ranking.map((item, index) => [
      index + 1,
      item.sigla,
      item.nome,
      item.total,
      item.concluidas,
      item.taxaConclusao,
      item.percentualMedio,
      item.pontuacao
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_comparativo_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
        <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Processando dados...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Relatório Comparativo</h2>
            <p className="text-gray-600 mt-1">
              Análise de performance entre secretarias e evolução temporal
            </p>
          </div>
          
          <button
            onClick={exportarRelatorio}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Exportar</span>
          </button>
        </div>
        
        {/* Filtros de Período */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período Inicial
            </label>
            <div className="flex space-x-2">
              <select
                value={periodoInicio.mes}
                onChange={(e) => setPeriodoInicio({ ...periodoInicio, mes: parseInt(e.target.value) })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
              >
                {[
                  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                ].map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                value={periodoInicio.ano}
                onChange={(e) => setPeriodoInicio({ ...periodoInicio, ano: parseInt(e.target.value) })}
                className="w-28 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período Final
            </label>
            <div className="flex space-x-2">
              <select
                value={periodoFim.mes}
                onChange={(e) => setPeriodoFim({ ...periodoFim, mes: parseInt(e.target.value) })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
              >
                {[
                  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                ].map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                value={periodoFim.ano}
                onChange={(e) => setPeriodoFim({ ...periodoFim, ano: parseInt(e.target.value) })}
                className="w-28 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ranking de Secretarias */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Award className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-800">Ranking de Performance</h3>
        </div>
        
        <div className="space-y-4">
          {ranking.slice(0, 10).map((item, index) => (
            <div
              key={item.sigla}
              className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-shadow"
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg ${
                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' :
                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}º
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.cor }}
                  />
                  <span className="font-bold text-gray-800">{item.sigla}</span>
                </div>
                <p className="text-sm text-gray-600">{item.nome}</p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-2xl font-bold text-gray-800">{item.pontuacao}</span>
                  <span className="text-sm text-gray-500">pts</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-600">
                  <span>Taxa: {item.taxaConclusao}%</span>
                  <span>Prog: {item.percentualMedio}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Gráfico de Comparação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Comparação por Secretaria
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosComparativos.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="sigla" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Legend />
              <Bar dataKey="taxaConclusao" fill="#10B981" name="Taxa de Conclusão (%)" />
              <Bar dataKey="percentualMedio" fill="#3B82F6" name="Progresso Médio (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Evolução Temporal
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={evolucaoTemporal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="periodo" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="taxaConclusao" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Taxa de Conclusão (%)"
              />
              <Line 
                type="monotone" 
                dataKey="percentualMedio" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Progresso Médio (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RelatorioComparativo;
