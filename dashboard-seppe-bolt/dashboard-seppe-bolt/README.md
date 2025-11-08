# Sistema de Dashboard SEPPE
### Secretaria Especial de Planejamento e Parceria Estratégicas - Campo Grande/MS

---

## 📊 Visão Geral

Sistema completo de Business Intelligence para acompanhamento e análise de entregas das secretarias municipais de Campo Grande, MS. Desenvolvido com tecnologias modernas, oferece visualizações interativas, relatórios consolidados e comparativos, além de importação automatizada de planilhas Excel mensais.

### ✨ Principais Funcionalidades

- 📈 **Dashboard Interativo** - Visualização em tempo real de KPIs e métricas estratégicas
- 📊 **Gráficos Inteligentes** - Charts modernos com Recharts (Pizza, Barras, Linhas, Radar)
- 🎨 **Design Moderno** - Interface com gradientes, cards animados e responsiva
- 📤 **Importação Automática** - Upload de planilhas Excel com detecção automática de período
- 🔍 **Filtros Avançados** - Múltipla seleção por secretaria, status, período
- 📑 **Relatórios Comparativos** - Análise de performance entre secretarias
- 📊 **Tabelas Detalhadas** - Visualização completa com paginação e busca
- 📥 **Exportação** - Download de relatórios em CSV
- 🎯 **Ranking de Performance** - Sistema de pontuação inteligente

---

## 🏗️ Arquitetura do Sistema

### **Frontend**
- **React 18** - Framework principal
- **Recharts** - Biblioteca de gráficos
- **Tailwind CSS** - Estilização moderna
- **Lucide React** - Ícones
- **Supabase Client** - Comunicação com backend

### **Backend**
- **Supabase** - Banco de dados PostgreSQL
- **Row Level Security** - Segurança de dados
- **Views** - Consultas otimizadas
- **Functions** - Lógica de negócio no banco
- **Triggers** - Atualização automática de timestamps

### **Importação**
- **Python 3** - Scripts de importação
- **Pandas** - Processamento de Excel
- **Supabase Python** - Cliente Python

---

## 🚀 Instalação Rápida

### **Pré-requisitos**

- Node.js 18+ ([Download](https://nodejs.org/))
- Python 3.10+ ([Download](https://python.org/))
- Conta Supabase ([Criar conta](https://supabase.com/))

### **1. Configurar Banco de Dados Supabase**

1. Crie um novo projeto no Supabase
2. Copie a **URL** e **anon key** do projeto
3. No SQL Editor do Supabase, execute o arquivo `supabase-schema.sql`:

```sql
-- Cole todo o conteúdo do arquivo supabase-schema.sql aqui
```

Isso criará:
- 5 tabelas principais (secretarias, importacoes, metas, entregas, historico_entregas)
- 4 views otimizadas
- 2 funções utilitárias
- Índices para performance
- Políticas RLS
- 21 secretarias pré-cadastradas

### **2. Configurar Frontend React**

```bash
# Criar projeto React
npx create-react-app dashboard-seppe
cd dashboard-seppe

# Instalar dependências
npm install @supabase/supabase-js recharts lucide-react
npm install -D tailwindcss postcss autoprefixer

# Configurar Tailwind
npx tailwindcss init -p
```

**Criar arquivo `.env` na raiz do projeto:**

```env
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**Copiar arquivos do sistema:**

```
src/
├── components/
│   ├── DashboardSEPPE.jsx
│   ├── TabelaEntregas.jsx
│   ├── UploadPlanilha.jsx
│   └── RelatorioComparativo.jsx
├── App.js
├── App.css
└── index.css
```

**Atualizar `src/index.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**Iniciar servidor de desenvolvimento:**

```bash
npm start
```

O sistema estará disponível em: `http://localhost:3000`

### **3. Configurar Sistema de Importação Python**

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente (Windows)
venv\Scripts\activate

# Ativar ambiente (Linux/Mac)
source venv/bin/activate

# Instalar dependências
pip install pandas openpyxl supabase python-dotenv

# Criar arquivo .env
echo "SUPABASE_URL=https://seu-projeto.supabase.co" > .env
echo "SUPABASE_KEY=sua-chave-aqui" >> .env
```

**Usar o importador:**

```python
from importador_planilhas import ImportadorPlanilhasSEPPE

# Criar instância
importador = ImportadorPlanilhasSEPPE(
    supabase_url='https://seu-projeto.supabase.co',
    supabase_key='sua-chave-aqui'
)

# Importar arquivo único
resultado = importador.importar_arquivo(
    arquivo_path='SESAU_AGOSTO_SC.xlsx',
    usuario='Admin SEPPE'
)

print(resultado)
# {'sucesso': True, 'entregas_inseridas': 50, ...}

# Importar múltiplos arquivos
resultados = importador.importar_multiplos_arquivos(
    diretorio='./planilhas',
    usuario='Admin SEPPE'
)
```

---

## 📚 Guia de Uso

### **Dashboard Principal**

1. **Acesse o Dashboard** - Visualize KPIs em tempo real
2. **Cards Estatísticos** - Total de entregas, em andamento, atrasadas, taxa de conclusão
3. **Gráficos Interativos**:
   - Pizza: Distribuição por status
   - Linha: Evolução mensal
   - Barras: Performance por secretaria

### **Filtros Avançados**

- **Secretarias**: Selecione uma ou múltiplas secretarias
- **Status**: Filtre por CONCLUÍDA, EM ANDAMENTO, ATRASADA, etc.
- **Período**: Escolha ano e mês(es) específicos
- **Aplicação**: Filtros se aplicam em tempo real

### **Tabela Detalhada**

1. **Busca Inteligente** - Pesquise por código, descrição, secretaria
2. **Ordenação** - Clique nos cabeçalhos para ordenar
3. **Paginação** - Navegue entre 10, 25, 50 ou 100 registros por página
4. **Ações**: Visualizar detalhes ou editar entregas
5. **Exportar** - Download em CSV

### **Importação de Planilhas**

1. **Upload**:
   - Arraste e solte arquivos Excel (.xlsx, .xls)
   - Ou clique para selecionar
   - Máximo 10MB por arquivo

2. **Configuração Automática**:
   - Sistema detecta secretaria pelo nome do arquivo
   - Extrai mês e ano automaticamente
   - Permite ajuste manual se necessário

3. **Processamento**:
   - Validação de dados
   - Inserção no banco
   - Feedback de progresso em tempo real

4. **Resultado**:
   - Total de entregas importadas
   - Erros encontrados (se houver)
   - Atualização automática do dashboard

### **Relatório Comparativo**

1. **Selecione Período** - Escolha intervalo de análise
2. **Ranking** - Veja as 10 melhores secretarias por pontuação
3. **Gráficos**:
   - Comparação entre secretarias
   - Evolução temporal de métricas
4. **Exportar** - Baixe relatório completo em CSV

---

## 📊 Estrutura de Dados

### **Tabela: secretarias**
```sql
- id (UUID)
- sigla (VARCHAR) - Ex: SESAU, SEMED
- nome_completo (TEXT)
- cor_primaria (VARCHAR) - Cor para gráficos
- cor_secundaria (VARCHAR)
- ativo (BOOLEAN)
```

### **Tabela: entregas**
```sql
- id (UUID)
- codigo_meta (VARCHAR) - Ex: M1
- codigo_entrega (VARCHAR) - Ex: SAU.1.1A
- descricao_entrega (TEXT)
- indicador (TEXT)
- data_inicio (DATE)
- data_termino (DATE)
- status (VARCHAR) - CONCLUÍDA, EM ANDAMENTO, ATRASADA, NÃO INICIADA
- percentual_execucao (DECIMAL)
- superintendencia (TEXT)
- setor (TEXT)
- interlocutor (TEXT)
- mes_referencia (INTEGER)
- ano_referencia (INTEGER)
```

---

## 🎨 Padrão de Cores

Cada secretaria possui cores personalizadas:

| Secretaria | Cor Primária | Cor Secundária |
|-----------|-------------|----------------|
| SESAU | #3B82F6 (Azul) | #93C5FD |
| SEMED | #6366F1 (Índigo) | #A5B4FC |
| SAS | #8B5CF6 (Roxo) | #C4B5FD |
| SEFAZ | #10B981 (Verde) | #6EE7B7 |
| ... | ... | ... |

---

## 🔒 Segurança

### **Row Level Security (RLS)**
- Todas as tabelas protegidas
- Leitura pública permitida
- Inserção/atualização apenas para autenticados

### **Validações**
- Formato de arquivo (apenas .xlsx, .xls)
- Tamanho máximo (10MB)
- Campos obrigatórios
- Integridade referencial

---

## 🛠️ Troubleshooting

### **Erro: "Failed to fetch"**
- Verifique se as credenciais do Supabase estão corretas no `.env`
- Confirme que o projeto Supabase está ativo

### **Gráficos não aparecem**
- Certifique-se de que há dados importados
- Verifique os filtros aplicados

### **Importação falha**
- Verifique formato da planilha (deve seguir o padrão)
- Confirme que a secretaria existe no banco
- Veja logs de erro no console

---

## 📞 Suporte

**Desenvolvido para:**
Secretaria Especial de Planejamento e Parceria Estratégicas (SEPPE)
Prefeitura Municipal de Campo Grande - MS

**Contato:**
- Email: seppe@campogrande.ms.gov.br
- Telefone: (67) XXXX-XXXX

---

## 📄 Licença

© 2025 Prefeitura de Campo Grande - Todos os direitos reservados

---

## 🔄 Atualizações Futuras

### Roadmap
- [ ] Autenticação com níveis de permissão
- [ ] Notificações por e-mail de entregas atrasadas
- [ ] Dashboard mobile nativo
- [ ] Integração com sistemas legados
- [ ] Relatórios em PDF
- [ ] API REST para integrações
- [ ] Machine Learning para previsões

---

## 🎓 Tecnologias Utilizadas

- React 18.2
- Supabase 2.39
- Recharts 2.10
- Tailwind CSS 3.4
- Lucide React 0.294
- Pandas 2.0
- Python 3.10+

---

**Sistema desenvolvido com ❤️ para gestão estratégica municipal**
