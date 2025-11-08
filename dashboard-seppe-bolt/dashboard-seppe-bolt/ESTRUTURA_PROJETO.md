# 📁 Estrutura Recomendada do Projeto

## Visão Geral

```
dashboard-seppe/
│
├── 📄 README.md                    # Documentação principal
├── 📄 QUICK_START.md               # Guia rápido de início
├── 📄 package.json                 # Dependências Node.js
├── 📄 tailwind.config.js           # Config Tailwind CSS
├── 📄 .env                         # Variáveis de ambiente (criar)
├── 📄 .env.example                 # Exemplo de variáveis
├── 📄 .gitignore                   # Arquivos ignorados no Git
│
├── 📂 public/                      # Arquivos públicos
│   ├── index.html
│   └── favicon.ico
│
├── 📂 src/                         # Código fonte React
│   ├── 📄 index.js                 # Entrada da aplicação
│   ├── 📄 index.css                # Estilos globais + Tailwind
│   ├── 📄 App.js                   # Componente principal
│   ├── 📄 App.css                  # Estilos do App
│   │
│   ├── 📂 components/              # Componentes React
│   │   ├── 📄 DashboardSEPPE.jsx           # Dashboard principal
│   │   ├── 📄 TabelaEntregas.jsx           # Tabela detalhada
│   │   ├── 📄 UploadPlanilha.jsx           # Upload de arquivos
│   │   └── 📄 RelatorioComparativo.jsx     # Relatórios
│   │
│   ├── 📂 utils/                   # Utilitários (opcional)
│   │   ├── 📄 supabaseClient.js    # Cliente Supabase
│   │   └── 📄 helpers.js           # Funções auxiliares
│   │
│   └── 📂 assets/                  # Imagens, ícones (opcional)
│       └── logo.png
│
├── 📂 python/                      # Scripts Python
│   ├── 📄 importador_planilhas.py  # Script de importação
│   ├── 📄 requirements.txt         # Dependências Python
│   ├── 📄 .env                     # Variáveis ambiente Python
│   │
│   └── 📂 venv/                    # Ambiente virtual (criar)
│       ├── bin/                    # (Linux/Mac)
│       ├── Scripts/                # (Windows)
│       └── lib/
│
├── 📂 planilhas/                   # Planilhas para importar
│   ├── .gitkeep                    # Manter pasta no Git
│   ├── SESAU_AGOSTO_2025.xlsx
│   └── SEMED_AGOSTO_2025.xlsx
│
├── 📂 database/                    # Scripts de banco
│   └── 📄 supabase-schema.sql      # Schema do banco
│
└── 📂 docs/                        # Documentação adicional
    ├── screenshots/                # Capturas de tela
    └── manual-usuario.pdf          # Manual do usuário
```

## 🎯 Arquivos Essenciais para Começar

### Obrigatórios (para funcionar)
1. ✅ `supabase-schema.sql` - Executar no Supabase
2. ✅ `.env` - Configurar com suas credenciais
3. ✅ `package.json` - Instalar dependências
4. ✅ `src/components/*` - Componentes React
5. ✅ `src/App.js` - Componente raiz
6. ✅ `src/index.css` - Estilos Tailwind

### Recomendados (para melhor experiência)
1. ⭐ `README.md` - Documentação completa
2. ⭐ `QUICK_START.md` - Guia rápido
3. ⭐ `.gitignore` - Proteger arquivos sensíveis
4. ⭐ `requirements.txt` - Dependências Python
5. ⭐ `importador_planilhas.py` - Importação automática

## 📋 Checklist de Instalação

### Frontend (React)
- [ ] Criar projeto: `npx create-react-app dashboard-seppe`
- [ ] Copiar arquivos para `src/` e `src/components/`
- [ ] Copiar `package.json`, `tailwind.config.js`, `.env.example`
- [ ] Criar `.env` com credenciais Supabase
- [ ] Instalar dependências: `npm install`
- [ ] Configurar Tailwind: `npx tailwindcss init -p`
- [ ] Iniciar: `npm start`

### Backend (Supabase)
- [ ] Criar conta em https://supabase.com
- [ ] Criar novo projeto
- [ ] Copiar URL e anon key
- [ ] Executar `supabase-schema.sql` no SQL Editor
- [ ] Verificar tabelas criadas em Table Editor

### Importação (Python)
- [ ] Criar pasta `python/`
- [ ] Copiar `importador_planilhas.py` e `requirements.txt`
- [ ] Criar ambiente virtual: `python -m venv venv`
- [ ] Ativar ambiente
- [ ] Instalar deps: `pip install -r requirements.txt`
- [ ] Criar `.env` com credenciais
- [ ] Testar importação

## 🚀 Comandos para Cada Parte

### Setup Inicial
```bash
# 1. Criar estrutura de pastas
mkdir -p dashboard-seppe/{src/components,python,planilhas,database,docs}
cd dashboard-seppe

# 2. Criar projeto React
npx create-react-app .

# 3. Instalar dependências
npm install @supabase/supabase-js recharts lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Ambiente Python
```bash
# 4. Setup Python
cd python
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cd ..
```

### Desenvolvimento
```bash
# Frontend
npm start                 # http://localhost:3000

# Python (em outra aba)
cd python
source venv/bin/activate
python importador_planilhas.py
```

## 📦 Organização de Planilhas

### Convenção de Nomes
```
[SIGLA_SECRETARIA]_[MES]_[ANO].xlsx

Exemplos:
✅ SESAU_AGOSTO_2025.xlsx
✅ SEMED_SETEMBRO_2025.xlsx
✅ SAS_OUTUBRO_2025.xlsx

❌ planilha.xlsx
❌ dados_secretaria.xlsx
```

### Organização por Período
```
planilhas/
├── 2024/
│   ├── janeiro/
│   ├── fevereiro/
│   └── ...
└── 2025/
    ├── janeiro/
    │   ├── SESAU_JANEIRO_2025.xlsx
    │   ├── SEMED_JANEIRO_2025.xlsx
    │   └── ...
    └── agosto/
        └── SESAU_AGOSTO_2025.xlsx
```

## 🔐 Arquivos Sensíveis (NÃO COMMITAR)

Sempre adicionar no `.gitignore`:
- `.env`
- `venv/`
- `node_modules/`
- Planilhas com dados reais
- Backups de banco

## 💡 Dicas de Organização

1. **Backup Regular**: Mantenha backups das planilhas originais
2. **Versionamento**: Use Git para controle de versão
3. **Documentação**: Atualize docs conforme mudanças
4. **Testes**: Teste importações em ambiente de desenvolvimento
5. **Logs**: Mantenha logs de importações para auditoria

## 📚 Próximos Passos

1. Copiar todos os arquivos do download para as pastas corretas
2. Seguir checklist de instalação
3. Executar script de instalação: `bash install.sh`
4. Ler documentação completa: `README.md`
5. Testar sistema com dados de exemplo
6. Configurar para produção

---

**Estrutura desenvolvida para SEPPE - Campo Grande/MS**
