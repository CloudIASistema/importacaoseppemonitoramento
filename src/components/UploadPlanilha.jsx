import React, { useState, useRef } from 'react';
import { Upload, File, Check, X, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const UploadPlanilha = ({ onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [secretariaSelecionada, setSecretariaSelecionada] = useState('');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [secretarias, setSecretarias] = useState([]);
  const fileInputRef = useRef(null);
  
  // Carregar secretarias
  React.useEffect(() => {
    carregarSecretarias();
  }, []);
  
  const carregarSecretarias = async () => {
    const { data } = await supabase
      .from('secretarias')
      .select('*')
      .eq('ativo', true)
      .order('sigla');
    
    if (data) setSecretarias(data);
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = [...e.dataTransfer.files];
    handleFiles(droppedFiles);
  };
  
  const handleFileInput = (e) => {
    const selectedFiles = [...e.target.files];
    handleFiles(selectedFiles);
  };
  
  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      const isUnder10MB = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isExcel) {
        alert(`${file.name} não é um arquivo Excel válido`);
        return false;
      }
      
      if (!isUnder10MB) {
        alert(`${file.name} é muito grande (máximo 10MB)`);
        return false;
      }
      
      return true;
    });
    
    const filesWithMetadata = validFiles.map(file => {
      // Tentar extrair secretaria do nome do arquivo
      const nomeArquivo = file.name.toUpperCase();
      const secretariaEncontrada = secretarias.find(s => 
        nomeArquivo.includes(s.sigla)
      );
      
      // Tentar extrair mês do nome do arquivo
      const meses = {
        'JANEIRO': 1, 'FEVEREIRO': 2, 'MARÇO': 3, 'MARCO': 3,
        'ABRIL': 4, 'MAIO': 5, 'JUNHO': 6,
        'JULHO': 7, 'AGOSTO': 8, 'SETEMBRO': 9,
        'OUTUBRO': 10, 'NOVEMBRO': 11, 'DEZEMBRO': 12
      };
      
      let mesDetectado = mes;
      for (const [nomeMes, numeroMes] of Object.entries(meses)) {
        if (nomeArquivo.includes(nomeMes)) {
          mesDetectado = numeroMes;
          break;
        }
      }
      
      return {
        file,
        id: Math.random().toString(36).substring(7),
        status: 'pending',
        progress: 0,
        secretaria: secretariaEncontrada?.id || '',
        mes: mesDetectado,
        ano: ano,
        error: null
      };
    });
    
    setFiles(prev => [...prev, ...filesWithMetadata]);
  };
  
  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };
  
  const processarArquivo = async (fileData) => {
    try {
      // Atualizar status para processando
      setFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, status: 'processing', progress: 10 } : f
      ));
      
      // Ler arquivo
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('secretaria_id', fileData.secretaria);
      formData.append('mes', fileData.mes);
      formData.append('ano', fileData.ano);
      
      // Simular progresso
      for (let i = 10; i <= 90; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, progress: i } : f
        ));
      }
      
      // Enviar para API de importação
      // Aqui você chamaria sua API de importação Python
      const response = await fetch('/api/importar-planilha', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Erro ao processar arquivo');
      }
      
      const result = await response.json();
      
      // Atualizar status para concluído
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'completed', progress: 100, result } 
          : f
      ));
      
      return result;
      
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'error', error: error.message } 
          : f
      ));
      throw error;
    }
  };
  
  const handleUpload = async () => {
    // Validar se há arquivos
    if (files.length === 0) {
      alert('Adicione pelo menos um arquivo');
      return;
    }
    
    // Validar se todos os arquivos têm secretaria
    const filesWithoutSecretaria = files.filter(f => !f.secretaria);
    if (filesWithoutSecretaria.length > 0) {
      alert('Todos os arquivos devem ter uma secretaria selecionada');
      return;
    }
    
    setUploading(true);
    
    try {
      // Processar todos os arquivos
      const results = await Promise.all(
        files.map(fileData => processarArquivo(fileData))
      );
      
      // Notificar conclusão
      onUploadComplete?.(results);
      
      // Limpar após 3 segundos
      setTimeout(() => {
        setFiles([]);
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const updateFileMetadata = (fileId, field, value) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, [field]: value } : f
    ));
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Importar Planilhas Mensais
        </h3>
        <p className="text-gray-600 text-sm">
          Faça upload das planilhas Excel das secretarias para atualizar o dashboard
        </p>
      </div>
      
      {/* Área de Drop */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xlsx,.xls"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="flex flex-col items-center">
          <div className={`p-4 rounded-full ${dragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Upload className={`w-8 h-8 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          
          <h4 className="mt-4 text-lg font-semibold text-gray-700">
            {dragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
          </h4>
          <p className="mt-2 text-sm text-gray-500">
            Suporta arquivos .xlsx e .xls até 10MB
          </p>
        </div>
      </div>
      
      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="font-semibold text-gray-800">Arquivos Selecionados</h4>
          
          {files.map((fileData) => (
            <div key={fileData.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    fileData.status === 'completed' ? 'bg-green-100' :
                    fileData.status === 'error' ? 'bg-red-100' :
                    fileData.status === 'processing' ? 'bg-blue-100' :
                    'bg-gray-200'
                  }`}>
                    {fileData.status === 'completed' ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : fileData.status === 'error' ? (
                      <X className="w-5 h-5 text-red-600" />
                    ) : (
                      <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{fileData.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(fileData.file.size / 1024).toFixed(2)} KB
                    </p>
                    
                    {fileData.status === 'error' && (
                      <div className="mt-2 flex items-center space-x-2 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">{fileData.error}</span>
                      </div>
                    )}
                    
                    {fileData.status === 'processing' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${fileData.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Processando... {fileData.progress}%
                        </p>
                      </div>
                    )}
                    
                    {fileData.status === 'completed' && fileData.result && (
                      <div className="mt-2 text-sm text-green-600">
                        ✓ {fileData.result.entregas_inseridas} entregas importadas
                      </div>
                    )}
                    
                    {fileData.status === 'pending' && (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Secretaria
                          </label>
                          <select
                            value={fileData.secretaria}
                            onChange={(e) => updateFileMetadata(fileData.id, 'secretaria', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Selecione...</option>
                            {secretarias.map(s => (
                              <option key={s.id} value={s.id}>{s.sigla}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Mês
                          </label>
                          <select
                            value={fileData.mes}
                            onChange={(e) => updateFileMetadata(fileData.id, 'mes', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                          >
                            {[
                              'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                            ].map((m, i) => (
                              <option key={i} value={i + 1}>{m}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Ano
                          </label>
                          <select
                            value={fileData.ano}
                            onChange={(e) => updateFileMetadata(fileData.id, 'ano', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                          >
                            {[2024, 2025, 2026].map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {fileData.status === 'pending' && (
                  <button
                    onClick={() => removeFile(fileData.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Botão de Upload */}
      {files.length > 0 && files.some(f => f.status === 'pending') && (
        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center space-x-2"
          >
            <Upload className="w-6 h-6" />
            <span>{uploading ? 'Processando...' : 'Iniciar Importação'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadPlanilha;
