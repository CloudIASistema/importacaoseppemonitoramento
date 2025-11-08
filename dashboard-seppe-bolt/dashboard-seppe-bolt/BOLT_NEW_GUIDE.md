# 🚀 Guia de Importação para Bolt.new

## Dashboard SEPPE - Campo Grande/MS

---

## 📋 Passo a Passo Completo

### **1. Preparar o Repositório GitHub**

```bash
# 1. Criar novo repositório no GitHub
# Acesse: https://github.com/new
# Nome sugerido: dashboard-seppe

# 2. Fazer upload deste ZIP
# - Descompacte o arquivo localmente
# - Faça push para o GitHub
```

**OU use o GitHub CLI:**

```bash
# Descompactar ZIP
unzip dashboard-seppe-bolt.zip
cd dashboard-seppe-bolt

# Inicializar Git
git init
git add .
git commit -m "Initial commit - Dashboard SEPPE"

# Criar repositório e fazer push
gh repo create dashboard-seppe --public --source=. --remote=origin --push
```

---

### **2. Importar no Bolt.new**

1. **Acesse:** https://bolt.new
2. **Clique em:** "Import from GitHub"
3. **Cole a URL:** `https://github.com/seu-usuario/dashboard-seppe`
4. **Aguarde:** Bolt.new vai clonar e configurar automaticamente

---

### **3. Configurar Variáveis de Ambiente no Bolt.new**

Após importar, configure as variáveis:

1. No Bolt.new, vá em **Settings** ou **Environment Variables**
2. Adicione:

```
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**Para obter as credenciais:**
- Acesse: https://supabase.com/dashboard
- Selecione seu projeto
- Vá em: Settings > API
- Copie: Project URL e anon/public key

---

### **4. Configurar Supabase (ANTES de rodar)**

⚠️ **IMPORTANTE:** Execute isso primeiro!

1. **Criar projeto Supabase:**
   - Acesse: https://supabase.com
   - Crie novo projeto
   - Anote: URL e anon key

2. **Executar Schema SQL:**
   - No Supabase Dashboard
   - Vá em: SQL Editor
   - Cole todo o conteúdo de: `supabase-schema.sql`
   - Clique em: "RUN"
   - Aguarde conclusão (cria 5 tabelas + 21 secretarias)

3. **Verificar:**
   - Vá em: Table Editor
   - Confirme que tabelas foram criadas:
     - ✅ secretarias (21 registros)
     - ✅ importacoes
     - ✅ metas
     - ✅ entregas
     - ✅ historico_entregas

---

### **5. Instalar Dependências no Bolt.new**

O Bolt.new deve instalar automaticamente, mas se precisar:

```bash
npm install
```

Dependências principais:
- `@supabase/supabase-js` - Cliente Supabase
- `recharts` - Gráficos
- `lucide-react` - Ícones
- `tailwindcss` - Estilos

---

### **6. Executar o Projeto**

No Bolt.new, clique em **"Run"** ou execute:

```bash
npm start
```

O dashboard abrirá em: `http://localhost:3000`

---

## 🎯 O Que Você Verá

### **Dashboard Vazio (Normal!)**
Na primeira execução, o dashboard estará vazio porque não há dados ainda.

### **Para Popular com Dados:**

**Opção 1: Upload via Interface (Recomendado)**
1. No dashboard, clique em **"Importar Planilhas"** no menu lateral
2. Arraste ou selecione arquivo Excel (SESAU_AGOSTO_SC.xlsx está no projeto original)
3. Selecione: Secretaria, Mês, Ano
4. Clique em: "Iniciar Importação"

**Opção 2: Script Python (Local)**
```bash
cd python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configurar .env
echo "SUPABASE_URL=sua-url" > .env
echo "SUPABASE_KEY=sua-key" >> .env

# Importar
python importador_planilhas.py
```

---

## 🔧 Troubleshooting no Bolt.new

### Erro: "Module not found"
```bash
# No terminal do Bolt.new
npm install
npm start
```

### Erro: "Failed to fetch"
- Verifique se variáveis de ambiente estão configuradas
- Confirme que Supabase está acessível
- Teste conexão: https://seu-projeto.supabase.co/rest/v1/

### Erro: Tailwind não funciona
```bash
# Recriar config
npx tailwindcss init -p
npm start
```

### Dashboard em branco
- Confirme que `supabase-schema.sql` foi executado
- Verifique se há dados na tabela `entregas`
- Console do navegador (F12) para ver erros

---

## 📱 Funcionalidades Disponíveis

Após importar dados, você terá acesso a:

1. **📊 Dashboard Principal**
   - KPIs em tempo real
   - Gráficos interativos
   - Filtros avançados

2. **📋 Tabela Detalhada**
   - Busca e ordenação
   - Paginação
   - Exportação CSV

3. **📈 Relatório Comparativo**
   - Ranking de secretarias
   - Evolução temporal
   - Análises comparativas

4. **📤 Upload de Planilhas**
   - Drag & drop
   - Detecção automática
   - Validação de dados

---

## 🎨 Personalização no Bolt.new

### Alterar Cores
Edite `tailwind.config.js`:
```javascript
colors: {
  'primary': '#3B82F6',  // Azul principal
  'secondary': '#8B5CF6', // Roxo secundário
}
```

### Modificar Componentes
Todos os componentes estão em: `src/components/`
- `DashboardSEPPE.jsx` - Dashboard principal
- `TabelaEntregas.jsx` - Tabela
- `UploadPlanilha.jsx` - Upload
- `RelatorioComparativo.jsx` - Relatórios

---

## 🚀 Deploy do Bolt.new

O Bolt.new permite deploy direto! Clique em **"Deploy"** e escolha:

1. **Vercel** (Recomendado)
   - Grátis
   - SSL automático
   - CI/CD integrado

2. **Netlify**
   - Também grátis
   - Simples e rápido

3. **Custom**
   - Seu próprio servidor

⚠️ **Lembre-se:** Configure as variáveis de ambiente no serviço de deploy!

---

## 📚 Estrutura do Projeto

```
dashboard-seppe-bolt/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── DashboardSEPPE.jsx
│   │   ├── TabelaEntregas.jsx
│   │   ├── UploadPlanilha.jsx
│   │   └── RelatorioComparativo.jsx
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── python/
│   ├── importador_planilhas.py
│   └── requirements.txt
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── supabase-schema.sql
├── .env.example
├── .gitignore
└── README.md
```

---

## ✅ Checklist Rápido

- [ ] Descompactar ZIP
- [ ] Push para GitHub
- [ ] Importar no Bolt.new
- [ ] Criar projeto Supabase
- [ ] Executar supabase-schema.sql
- [ ] Configurar variáveis de ambiente
- [ ] Rodar projeto (npm start)
- [ ] Importar planilha de exemplo
- [ ] Testar funcionalidades
- [ ] Deploy (opcional)

---

## 🆘 Links Úteis

- **Bolt.new:** https://bolt.new
- **Supabase:** https://supabase.com
- **GitHub:** https://github.com
- **Documentação Completa:** Ver README.md

---

## 💡 Dicas Pro

1. **Use o Console do Navegador (F12)** para debugar
2. **Verifique a aba Network** para ver requisições
3. **No Supabase, use Table Editor** para ver dados em tempo real
4. **Bolt.new tem terminal integrado** - use para comandos npm
5. **Salve o projeto** antes de fazer mudanças grandes

---

## 📞 Suporte

**Email:** seppe@campogrande.ms.gov.br
**Documentação:** README.md na raiz do projeto

---

**Dashboard SEPPE pronto para Bolt.new! 🚀**

*Sistema desenvolvido para Prefeitura de Campo Grande - MS*
