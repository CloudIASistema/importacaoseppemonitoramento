# 🚀 Guia Rápido - Dashboard SEPPE

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Configurar Supabase

```bash
# 1. Criar conta e projeto em: https://supabase.com
# 2. Copiar URL e anon key de: Settings > API
# 3. No SQL Editor, executar: supabase-schema.sql
```

### 2️⃣ Configurar Frontend

```bash
# Criar projeto
npx create-react-app dashboard-seppe
cd dashboard-seppe

# Instalar dependências
npm install @supabase/supabase-js recharts lucide-react
npm install -D tailwindcss postcss autoprefixer

# Configurar Tailwind
npx tailwindcss init -p

# Criar .env
echo "REACT_APP_SUPABASE_URL=sua-url" > .env
echo "REACT_APP_SUPABASE_ANON_KEY=sua-chave" >> .env

# Copiar componentes para src/components/
# Copiar App.js e App.css para src/

# Iniciar
npm start
```

### 3️⃣ Configurar Importador Python

```bash
# Criar ambiente
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar
pip install pandas openpyxl supabase

# Usar
python importador_planilhas.py
```

---

## 📁 Estrutura de Arquivos

```
dashboard-seppe/
├── public/
├── src/
│   ├── components/
│   │   ├── DashboardSEPPE.jsx       # Dashboard principal
│   │   ├── TabelaEntregas.jsx       # Tabela detalhada
│   │   ├── UploadPlanilha.jsx       # Upload de arquivos
│   │   └── RelatorioComparativo.jsx # Relatórios
│   ├── App.js                        # Componente raiz
│   ├── App.css                       # Estilos
│   └── index.css                     # Estilos globais
├── python/
│   ├── importador_planilhas.py       # Script importação
│   └── venv/                         # Ambiente virtual
├── planilhas/                        # Planilhas para importar
├── package.json
├── tailwind.config.js
├── supabase-schema.sql               # Schema do banco
├── requirements.txt                  # Deps Python
├── .env.example
└── README.md
```

---

## 🎨 Preview das Funcionalidades

### Dashboard Principal
```
┌─────────────────────────────────────────────┐
│ 📊 DASHBOARD SEPPE                          │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ 450  │ │ 320  │ │  45  │ │ 71% │      │
│  │Total │ │Em And│ │Atras │ │Taxa │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
│  ┌─────────────┐  ┌──────────────┐        │
│  │ Gráfico     │  │ Evolução     │        │
│  │ Pizza       │  │ Mensal       │        │
│  │ Status      │  │ (Linha)      │        │
│  └─────────────┘  └──────────────┘        │
│                                             │
│  ┌────────────────────────────────┐        │
│  │ Performance por Secretaria     │        │
│  │ (Barras Horizontais)           │        │
│  └────────────────────────────────┘        │
└─────────────────────────────────────────────┘
```

### Upload de Planilhas
```
┌─────────────────────────────────────────────┐
│ 📤 IMPORTAR PLANILHAS                       │
├─────────────────────────────────────────────┤
│                                             │
│  ┌────────────────────────────────────┐    │
│  │                                    │    │
│  │   📁 Arraste arquivos aqui        │    │
│  │      ou clique para selecionar    │    │
│  │                                    │    │
│  │   Suporta: .xlsx, .xls (10MB)    │    │
│  │                                    │    │
│  └────────────────────────────────────┘    │
│                                             │
│  Arquivos Selecionados:                     │
│  ✓ SESAU_AGOSTO_2025.xlsx                  │
│  ✓ SEMED_AGOSTO_2025.xlsx                  │
│                                             │
│  [ Iniciar Importação ]                     │
└─────────────────────────────────────────────┘
```

---

## 🔑 Variáveis de Ambiente

```env
# Obrigatórias
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJxxx...

# Opcionais
PORT=3000
NODE_ENV=development
```

---

## 📊 Modelo de Planilha Excel

### Colunas Esperadas:

| Coluna | Nome | Descrição |
|--------|------|-----------|
| A | IDM | Código da Meta (ex: M1) |
| B | IDE | Código da Entrega (ex: SAU.1.1A) |
| C | ENTREGA | Descrição da entrega |
| D | INDICADOR | Indicador de resultado |
| E | DATA DE INÍCIO | Data inicial |
| F | DATA DE TÉRMINO | Data final |
| G | STATUS | CONCLUÍDA/EM ANDAMENTO/ATRASADA |
| H | % EXEC | Percentual de execução (0-100) |
| I | SUPERINTENDÊNCIA | Superintendência responsável |
| J | SETOR | Setor responsável |
| K | INTERLOCUTOR | Pessoa responsável |

### Exemplo de Nome de Arquivo:
```
SESAU_AGOSTO_2025.xlsx
SEMED_SETEMBRO_2025.xlsx
```

O sistema detectará automaticamente:
- Secretaria (SESAU, SEMED, etc)
- Mês (AGOSTO, SETEMBRO, etc)
- Ano (2025)

---

## ⚙️ Comandos Úteis

### Frontend (React)
```bash
npm start              # Iniciar desenvolvimento
npm run build          # Build para produção
npm test               # Executar testes
npm install [pacote]   # Instalar nova dependência
```

### Backend (Python)
```bash
pip install -r requirements.txt  # Instalar deps
python importador_planilhas.py   # Importar planilhas
pip list                         # Listar pacotes
```

### Supabase
```bash
# Acessar dashboard
https://supabase.com/dashboard

# Executar SQL
Dashboard > SQL Editor > New query

# Ver logs
Dashboard > Logs
```

---

## 🐛 Solução de Problemas Comuns

### Erro: "Cannot find module"
```bash
# Deletar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro: Gráficos não aparecem
```bash
# Verificar se há dados no Supabase
# Ir em: Dashboard > Table Editor > entregas
# Deve ter registros
```

### Erro: Importação falha
```bash
# Verificar formato da planilha
# Colunas devem seguir o padrão
# Nome do arquivo deve conter secretaria e mês
```

### Erro: "Failed to fetch"
```bash
# Verificar .env
# Confirmar que URL e key estão corretas
# Testar conexão com Supabase
```

---

## 📱 Atalhos do Sistema

| Atalho | Ação |
|--------|------|
| `Ctrl + R` | Atualizar dados |
| `Ctrl + F` | Buscar na tabela |
| `Esc` | Fechar filtros |

---

## 🎯 Dicas Pro

### Performance
- Use filtros para reduzir dados carregados
- Exporte apenas dados necessários
- Limpe cache do navegador periodicamente

### Importação
- Agrupe planilhas por período
- Valide dados antes de importar
- Mantenha backup das planilhas originais

### Relatórios
- Use relatório comparativo para análises mensais
- Exporte dados para análises externas
- Configure filtros e salve como favorito

---

## 📞 Suporte Rápido

**Email:** seppe@campogrande.ms.gov.br  
**Documentação:** README.md  
**Issues:** Relate problemas no sistema

---

**Dashboard desenvolvido com ❤️ para gestão municipal estratégica**

*SEPPE - Secretaria Especial de Planejamento e Parcerias Estratégicas*  
*Prefeitura de Campo Grande - MS*
