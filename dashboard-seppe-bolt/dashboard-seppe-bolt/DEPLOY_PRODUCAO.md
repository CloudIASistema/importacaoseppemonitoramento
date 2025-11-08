# 🚀 Guia de Deploy em Produção

## Dashboard SEPPE - Campo Grande/MS

---

## 📋 Checklist Pré-Deploy

### Infraestrutura
- [ ] Servidor/VPS configurado (mínimo: 2GB RAM, 2 cores)
- [ ] Node.js 18+ instalado
- [ ] Python 3.10+ instalado
- [ ] Nginx ou Apache instalado
- [ ] Certificado SSL configurado (Let's Encrypt)
- [ ] Backup automático configurado

### Banco de Dados
- [ ] Projeto Supabase em produção criado
- [ ] Schema SQL executado
- [ ] Backup configurado
- [ ] Políticas RLS revisadas
- [ ] Índices otimizados

### Segurança
- [ ] Variáveis de ambiente configuradas
- [ ] Chaves de API em ambiente seguro
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativado
- [ ] Firewall configurado

---

## 🔧 Opções de Deploy

### Opção 1: Vercel (Recomendado para Frontend)

**Vantagens:** Grátis, rápido, CI/CD integrado, SSL automático

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Deploy
vercel

# 4. Configurar domínio customizado
vercel domains add dashboard.campogrande.ms.gov.br
```

**Variáveis de Ambiente na Vercel:**
```
Settings > Environment Variables
• REACT_APP_SUPABASE_URL
• REACT_APP_SUPABASE_ANON_KEY
```

### Opção 2: Netlify

```bash
# 1. Build local
npm run build

# 2. Deploy via Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod

# 3. Ou via interface web
# Arraste pasta build/ em: https://app.netlify.com/drop
```

### Opção 3: Servidor Próprio (VPS/Dedicado)

#### 3.1 Preparar Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Nginx
sudo apt install -y nginx

# Instalar Python 3
sudo apt install -y python3 python3-pip python3-venv

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2
```

#### 3.2 Deploy da Aplicação

```bash
# Clonar projeto
cd /var/www
sudo git clone [seu-repositorio] dashboard-seppe
cd dashboard-seppe

# Instalar dependências
npm install
npm run build

# Configurar variáveis de ambiente
sudo nano .env
# Adicionar:
# REACT_APP_SUPABASE_URL=...
# REACT_APP_SUPABASE_ANON_KEY=...

# Servir com nginx
sudo cp build/* /var/www/html/dashboard/
```

#### 3.3 Configurar Nginx

```nginx
# /etc/nginx/sites-available/dashboard-seppe

server {
    listen 80;
    server_name dashboard.campogrande.ms.gov.br;
    
    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dashboard.campogrande.ms.gov.br;
    
    # Certificado SSL
    ssl_certificate /etc/letsencrypt/live/dashboard.campogrande.ms.gov.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dashboard.campogrande.ms.gov.br/privkey.pem;
    
    # Root
    root /var/www/html/dashboard;
    index index.html;
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    
    # Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

```bash
# Ativar configuração
sudo ln -s /etc/nginx/sites-available/dashboard-seppe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 3.4 SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d dashboard.campogrande.ms.gov.br

# Renovação automática (já configurado)
sudo certbot renew --dry-run
```

---

## 🐍 Deploy do Sistema de Importação Python

### Opção 1: Servidor Próprio

```bash
# Criar diretório
sudo mkdir -p /opt/dashboard-seppe/python
cd /opt/dashboard-seppe/python

# Copiar arquivos
sudo cp importador_planilhas.py .
sudo cp requirements.txt .

# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar .env
nano .env
# Adicionar credenciais Supabase

# Testar
python importador_planilhas.py
```

### Opção 2: Cron Job para Importação Automática

```bash
# Criar script de importação
sudo nano /opt/dashboard-seppe/python/auto-import.sh
```

```bash
#!/bin/bash
cd /opt/dashboard-seppe/python
source venv/bin/activate
python importador_planilhas.py --diretorio /opt/planilhas/pendentes
```

```bash
# Dar permissão
sudo chmod +x /opt/dashboard-seppe/python/auto-import.sh

# Adicionar ao cron (executar todo dia às 2h)
sudo crontab -e
# Adicionar:
0 2 * * * /opt/dashboard-seppe/python/auto-import.sh >> /var/log/dashboard-import.log 2>&1
```

---

## 📊 Monitoramento

### 1. Logs do Nginx

```bash
# Acessar logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Logs da Aplicação

```bash
# PM2 (se usar)
pm2 logs dashboard-seppe

# Systemd
sudo journalctl -u dashboard-seppe -f
```

### 3. Monitoramento de Performance

```bash
# Instalar htop
sudo apt install htop

# Monitorar recursos
htop

# Disk usage
df -h

# Memória
free -h
```

---

## 🔒 Segurança em Produção

### Firewall (UFW)

```bash
# Instalar e configurar
sudo apt install ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Fail2Ban (Proteção contra ataques)

```bash
# Instalar
sudo apt install fail2ban

# Configurar
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Iniciar
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

---

## 💾 Backup Automático

### Script de Backup

```bash
#!/bin/bash
# /opt/scripts/backup-dashboard.sh

BACKUP_DIR="/backups/dashboard"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do código
tar -czf $BACKUP_DIR/code_$DATE.tar.gz /var/www/dashboard-seppe

# Backup de planilhas
tar -czf $BACKUP_DIR/planilhas_$DATE.tar.gz /opt/planilhas

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup concluído: $DATE"
```

```bash
# Agendar backup diário às 3h
sudo crontab -e
0 3 * * * /opt/scripts/backup-dashboard.sh >> /var/log/backup-dashboard.log 2>&1
```

---

## 🚦 CI/CD com GitHub Actions

### .github/workflows/deploy.yml

```yaml
name: Deploy Dashboard SEPPE

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        REACT_APP_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        REACT_APP_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📈 Otimizações de Performance

### 1. Compression

Já configurado no Nginx (gzip)

### 2. CDN (Opcional)

Usar Cloudflare para CDN gratuito:
1. Apontar DNS para Cloudflare
2. Ativar proxy (nuvem laranja)
3. Configurar cache rules

### 3. Image Optimization

```bash
# Instalar ferramentas
sudo apt install imagemagick optipng jpegoptim

# Otimizar imagens
find /var/www/dashboard/assets -name "*.png" -exec optipng {} \;
find /var/www/dashboard/assets -name "*.jpg" -exec jpegoptim {} \;
```

---

## ✅ Checklist Pós-Deploy

- [ ] Aplicação acessível via HTTPS
- [ ] Certificado SSL válido
- [ ] Todas as funcionalidades testadas
- [ ] Importação de planilhas funcionando
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] Logs sendo gerados
- [ ] Firewall configurado
- [ ] DNS configurado corretamente
- [ ] Documentação atualizada
- [ ] Equipe treinada

---

## 🆘 Troubleshooting em Produção

### Erro 502 Bad Gateway
```bash
# Verificar se aplicação está rodando
sudo systemctl status nginx
pm2 status

# Reiniciar serviços
sudo systemctl restart nginx
pm2 restart dashboard-seppe
```

### Erro de Certificado SSL
```bash
# Renovar certificado
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

### Alto uso de memória
```bash
# Verificar processos
htop

# Limpar cache
sudo sync; echo 3 > /proc/sys/vm/drop_caches

# Reiniciar aplicação
pm2 restart dashboard-seppe
```

---

## 📞 Contato e Suporte

**Desenvolvido para:**
SEPPE - Secretaria Especial de Planejamento
Prefeitura Municipal de Campo Grande - MS

**Suporte Técnico:**
- Email: ti@campogrande.ms.gov.br
- Telefone: (67) XXXX-XXXX

---

**Deploy checklist desenvolvido para garantir implantação segura e confiável**
