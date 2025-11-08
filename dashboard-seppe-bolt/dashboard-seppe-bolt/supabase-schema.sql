-- ============================================
-- SISTEMA DE DASHBOARD SEPPE
-- Estrutura do Banco de Dados Supabase
-- ============================================

-- TABELA: Secretarias
CREATE TABLE IF NOT EXISTS secretarias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sigla VARCHAR(20) UNIQUE NOT NULL,
    nome_completo TEXT NOT NULL,
    cor_primaria VARCHAR(7) DEFAULT '#3B82F6',
    cor_secundaria VARCHAR(7) DEFAULT '#60A5FA',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: Importações (controle de uploads mensais)
CREATE TABLE IF NOT EXISTS importacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    secretaria_id UUID REFERENCES secretarias(id) ON DELETE CASCADE,
    mes INTEGER CHECK (mes >= 1 AND mes <= 12),
    ano INTEGER CHECK (ano >= 2024),
    arquivo_nome TEXT NOT NULL,
    data_importacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_entregas INTEGER DEFAULT 0,
    importado_por TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(secretaria_id, mes, ano)
);

-- TABELA: Metas
CREATE TABLE IF NOT EXISTS metas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    importacao_id UUID REFERENCES importacoes(id) ON DELETE CASCADE,
    secretaria_id UUID REFERENCES secretarias(id) ON DELETE CASCADE,
    codigo_meta VARCHAR(10) NOT NULL,
    nome_meta TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: Entregas (dados principais)
CREATE TABLE IF NOT EXISTS entregas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    importacao_id UUID REFERENCES importacoes(id) ON DELETE CASCADE,
    secretaria_id UUID REFERENCES secretarias(id) ON DELETE CASCADE,
    meta_id UUID REFERENCES metas(id) ON DELETE SET NULL,
    
    -- Identificação
    codigo_meta VARCHAR(10),
    codigo_entrega VARCHAR(20) NOT NULL,
    
    -- Descrição
    descricao_entrega TEXT NOT NULL,
    indicador TEXT,
    
    -- Datas
    data_inicio DATE,
    data_termino DATE,
    
    -- Status e Progresso
    status VARCHAR(20) CHECK (status IN ('NÃO INICIADA', 'EM ANDAMENTO', 'ATRASADA', 'CONCLUÍDA', 'PAUSADA')),
    percentual_execucao DECIMAL(5,2) DEFAULT 0 CHECK (percentual_execucao >= 0 AND percentual_execucao <= 100),
    
    -- Responsáveis
    superintendencia TEXT,
    setor TEXT,
    interlocutor TEXT,
    responsavel_atualizacao TEXT,
    
    -- Período de Referência
    mes_referencia INTEGER CHECK (mes_referencia >= 1 AND mes_referencia <= 12),
    ano_referencia INTEGER CHECK (ano_referencia >= 2024),
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para melhor performance
    CONSTRAINT unique_entrega_periodo UNIQUE(secretaria_id, codigo_entrega, mes_referencia, ano_referencia)
);

-- TABELA: Histórico de Alterações
CREATE TABLE IF NOT EXISTS historico_entregas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entrega_id UUID REFERENCES entregas(id) ON DELETE CASCADE,
    campo_alterado VARCHAR(50),
    valor_anterior TEXT,
    valor_novo TEXT,
    usuario TEXT,
    data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VIEWS PARA ANÁLISES
-- ============================================

-- VIEW: Resumo por Secretaria
CREATE OR REPLACE VIEW vw_resumo_secretarias AS
SELECT 
    s.id,
    s.sigla,
    s.nome_completo,
    COUNT(DISTINCT e.id) as total_entregas,
    COUNT(DISTINCT CASE WHEN e.status = 'CONCLUÍDA' THEN e.id END) as entregas_concluidas,
    COUNT(DISTINCT CASE WHEN e.status = 'EM ANDAMENTO' THEN e.id END) as entregas_em_andamento,
    COUNT(DISTINCT CASE WHEN e.status = 'ATRASADA' THEN e.id END) as entregas_atrasadas,
    COUNT(DISTINCT CASE WHEN e.status = 'NÃO INICIADA' THEN e.id END) as entregas_nao_iniciadas,
    ROUND(AVG(e.percentual_execucao), 2) as percentual_medio,
    MAX(i.data_importacao) as ultima_atualizacao
FROM secretarias s
LEFT JOIN entregas e ON s.id = e.secretaria_id
LEFT JOIN importacoes i ON s.id = i.secretaria_id
WHERE s.ativo = true
GROUP BY s.id, s.sigla, s.nome_completo;

-- VIEW: Evolução Mensal
CREATE OR REPLACE VIEW vw_evolucao_mensal AS
SELECT 
    e.secretaria_id,
    s.sigla as secretaria,
    e.ano_referencia,
    e.mes_referencia,
    COUNT(*) as total_entregas,
    COUNT(CASE WHEN e.status = 'CONCLUÍDA' THEN 1 END) as concluidas,
    ROUND(AVG(e.percentual_execucao), 2) as percentual_medio,
    COUNT(CASE WHEN e.status = 'ATRASADA' THEN 1 END) as atrasadas
FROM entregas e
JOIN secretarias s ON e.secretaria_id = s.id
GROUP BY e.secretaria_id, s.sigla, e.ano_referencia, e.mes_referencia
ORDER BY e.ano_referencia DESC, e.mes_referencia DESC;

-- VIEW: Top Entregas Atrasadas
CREATE OR REPLACE VIEW vw_entregas_criticas AS
SELECT 
    e.id,
    s.sigla as secretaria,
    e.codigo_entrega,
    e.descricao_entrega,
    e.data_termino,
    e.percentual_execucao,
    e.status,
    e.interlocutor,
    CURRENT_DATE - e.data_termino as dias_atraso
FROM entregas e
JOIN secretarias s ON e.secretaria_id = s.id
WHERE e.status = 'ATRASADA'
  AND e.data_termino IS NOT NULL
ORDER BY (CURRENT_DATE - e.data_termino) DESC;

-- VIEW: Performance por Superintendência
CREATE OR REPLACE VIEW vw_performance_superintendencias AS
SELECT 
    s.sigla as secretaria,
    e.superintendencia,
    COUNT(*) as total_entregas,
    COUNT(CASE WHEN e.status = 'CONCLUÍDA' THEN 1 END) as concluidas,
    ROUND(AVG(e.percentual_execucao), 2) as percentual_medio,
    COUNT(CASE WHEN e.status = 'ATRASADA' THEN 1 END) as atrasadas,
    ROUND(
        (COUNT(CASE WHEN e.status = 'CONCLUÍDA' THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(*), 0)) * 100, 
        2
    ) as taxa_conclusao
FROM entregas e
JOIN secretarias s ON e.secretaria_id = s.id
WHERE e.superintendencia IS NOT NULL
GROUP BY s.sigla, e.superintendencia
ORDER BY percentual_medio DESC;

-- ============================================
-- FUNÇÕES ÚTEIS
-- ============================================

-- Função: Calcular taxa de conclusão
CREATE OR REPLACE FUNCTION calcular_taxa_conclusao(
    p_secretaria_id UUID DEFAULT NULL,
    p_ano INTEGER DEFAULT NULL,
    p_mes INTEGER DEFAULT NULL
)
RETURNS DECIMAL AS $$
DECLARE
    v_taxa DECIMAL;
BEGIN
    SELECT 
        ROUND(
            (COUNT(CASE WHEN status = 'CONCLUÍDA' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(*), 0)) * 100, 
            2
        )
    INTO v_taxa
    FROM entregas
    WHERE 
        (p_secretaria_id IS NULL OR secretaria_id = p_secretaria_id) AND
        (p_ano IS NULL OR ano_referencia = p_ano) AND
        (p_mes IS NULL OR mes_referencia = p_mes);
    
    RETURN COALESCE(v_taxa, 0);
END;
$$ LANGUAGE plpgsql;

-- Função: Obter estatísticas gerais
CREATE OR REPLACE FUNCTION obter_estatisticas_gerais(
    p_ano INTEGER DEFAULT NULL,
    p_mes INTEGER DEFAULT NULL
)
RETURNS TABLE(
    total_entregas BIGINT,
    concluidas BIGINT,
    em_andamento BIGINT,
    atrasadas BIGINT,
    nao_iniciadas BIGINT,
    percentual_medio DECIMAL,
    taxa_conclusao DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT,
        COUNT(CASE WHEN e.status = 'CONCLUÍDA' THEN 1 END)::BIGINT,
        COUNT(CASE WHEN e.status = 'EM ANDAMENTO' THEN 1 END)::BIGINT,
        COUNT(CASE WHEN e.status = 'ATRASADA' THEN 1 END)::BIGINT,
        COUNT(CASE WHEN e.status = 'NÃO INICIADA' THEN 1 END)::BIGINT,
        ROUND(AVG(e.percentual_execucao), 2),
        ROUND(
            (COUNT(CASE WHEN e.status = 'CONCLUÍDA' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(*), 0)) * 100, 
            2
        )
    FROM entregas e
    WHERE 
        (p_ano IS NULL OR e.ano_referencia = p_ano) AND
        (p_mes IS NULL OR e.mes_referencia = p_mes);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_secretarias_updated_at
    BEFORE UPDATE ON secretarias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entregas_updated_at
    BEFORE UPDATE ON entregas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_entregas_secretaria ON entregas(secretaria_id);
CREATE INDEX IF NOT EXISTS idx_entregas_status ON entregas(status);
CREATE INDEX IF NOT EXISTS idx_entregas_periodo ON entregas(ano_referencia, mes_referencia);
CREATE INDEX IF NOT EXISTS idx_entregas_meta ON entregas(meta_id);
CREATE INDEX IF NOT EXISTS idx_importacoes_secretaria ON importacoes(secretaria_id);
CREATE INDEX IF NOT EXISTS idx_importacoes_periodo ON importacoes(ano, mes);

-- ============================================
-- DADOS INICIAIS - SECRETARIAS
-- ============================================

INSERT INTO secretarias (sigla, nome_completo, cor_primaria, cor_secundaria) VALUES
('CGM', 'Controladoria Geral do Município', '#EF4444', '#FCA5A5'),
('SEFAZ', 'Secretaria Municipal da Fazenda', '#10B981', '#6EE7B7'),
('SEMADES', 'Secretaria Municipal do Meio Ambiente, Gestão Urbana e Desenvolvimento Econômico, Turístico e Sustentável', '#06B6D4', '#67E8F9'),
('SESAU', 'Secretaria Municipal de Saúde', '#3B82F6', '#93C5FD'),
('SAS', 'Secretaria de Assistência Social e Cidadania', '#8B5CF6', '#C4B5FD'),
('SECULT', 'Secretaria Executiva da Cultura', '#EC4899', '#F9A8D4'),
('SEMADI', 'Secretaria Municipal de Administração e Inovação', '#F59E0B', '#FCD34D'),
('SEJUV', 'Secretaria Executiva da Juventude', '#14B8A6', '#5EEAD4'),
('SEMED', 'Secretaria Municipal de Educação', '#6366F1', '#A5B4FC'),
('SESDES', 'Secretaria Especial de Segurança e Defesa Social', '#DC2626', '#FCA5A5'),
('SISEP', 'Secretaria Municipal de Infraestrutura e Serviços Públicos', '#F97316', '#FDBA74'),
('IMPCG', 'Instituto Municipal de Previdência de Campo Grande', '#0891B2', '#67E8F9'),
('PLANURB', 'Agência Municipal de Meio Ambiente e Planejamento Urbano', '#059669', '#6EE7B7'),
('AGETEC', 'Agência Municipal de Tecnologia da Informação e Inovação', '#7C3AED', '#C4B5FD'),
('AGETRAN', 'Agência Municipal de Transporte e Trânsito', '#EA580C', '#FDBA74'),
('EMHA', 'Agência Municipal de Habitação e Assuntos Fundiários', '#0284C7', '#7DD3FC'),
('FUNESP', 'Fundação Municipal de Esportes', '#16A34A', '#86EFAC'),
('FUNSAT', 'Fundação Social do Trabalho de Campo Grande', '#CA8A04', '#FDE047'),
('FAC', 'Fundo de Apoio à Comunidade', '#9333EA', '#D8B4FE'),
('SEMU', 'Secretaria Executiva da Mulher', '#DB2777', '#F9A8D4'),
('SEAR', 'Secretaria Especial de Articulação Regional', '#0D9488', '#5EEAD4')
ON CONFLICT (sigla) DO NOTHING;

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE secretarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE importacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler
CREATE POLICY "Permitir leitura para todos"
    ON secretarias FOR SELECT
    USING (true);

CREATE POLICY "Permitir leitura para todos"
    ON importacoes FOR SELECT
    USING (true);

CREATE POLICY "Permitir leitura para todos"
    ON metas FOR SELECT
    USING (true);

CREATE POLICY "Permitir leitura para todos"
    ON entregas FOR SELECT
    USING (true);

-- Política: Apenas autenticados podem inserir/atualizar
CREATE POLICY "Permitir inserção para autenticados"
    ON importacoes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para autenticados"
    ON entregas FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para autenticados"
    ON entregas FOR UPDATE
    USING (auth.role() = 'authenticated');
