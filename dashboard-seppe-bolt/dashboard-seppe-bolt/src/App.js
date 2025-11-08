import React, { useState } from 'react';
import DashboardSEPPE from './components/DashboardSEPPE';
import TabelaEntregas from './components/TabelaEntregas';
import UploadPlanilha from './components/UploadPlanilha';
import RelatorioComparativo from './components/RelatorioComparativo';
import { 
  LayoutDashboard, Table, Upload, BarChart3, 
  Settings, HelpCircle, Menu, X 
} from 'lucide-react';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleUploadComplete = (results) => {
    alert(`Upload concluído! ${results.length} arquivo(s) processado(s).`);
    // Forçar atualização do dashboard
    setRefreshKey(prev => prev + 1);
    // Voltar para o dashboard
    setCurrentView('dashboard');
  };
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tabela', label: 'Tabela Detalhada', icon: Table },
    { id: 'comparativo', label: 'Relatório Comparativo', icon: BarChart3 },
    { id: 'upload', label: 'Importar Planilhas', icon: Upload },
  ];
  
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardSEPPE key={refreshKey} />;
      case 'tabela':
        return (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <TabelaEntregas
              entregas={[]}
              onEdit={(entrega) => console.log('Editar:', entrega)}
              onView={(entrega) => console.log('Visualizar:', entrega)}
            />
          </div>
        );
      case 'comparativo':
        return (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <RelatorioComparativo />
          </div>
        );
      case 'upload':
        return (
          <div className="max-w-4xl mx-auto px-6 py-8">
            <UploadPlanilha onUploadComplete={handleUploadComplete} />
          </div>
        );
      default:
        return <DashboardSEPPE key={refreshKey} />;
    }
  };
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo e Título */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-xl font-bold">SEPPE</h1>
              <p className="text-blue-100 text-xs mt-1">Sistema de Planejamento</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Menu de Navegação */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        {/* Informações do Sistema */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 text-center">
            <p className="font-semibold">Dashboard SEPPE v1.0</p>
            <p className="mt-1">Prefeitura de Campo Grande - MS</p>
            <p className="mt-2 text-gray-500">
              © 2025 - Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
      
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Conteúdo Principal */}
      <div className={`flex-1 overflow-auto transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'ml-0'
      }`}>
        {/* Botão de Menu Mobile */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-40 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow lg:hidden"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        )}
        
        {/* Renderizar Conteúdo */}
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
