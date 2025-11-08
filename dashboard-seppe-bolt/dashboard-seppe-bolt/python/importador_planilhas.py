"""
Sistema de Importação de Planilhas Excel - SEPPE Dashboard
Importa dados mensais das secretarias para o Supabase
"""

import pandas as pd
from datetime import datetime
from supabase import create_client, Client
import os
from typing import Dict, List, Tuple
import re

class ImportadorPlanilhasSEPPE:
    """Importador de planilhas Excel para o sistema SEPPE"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        """
        Inicializa o importador
        
        Args:
            supabase_url: URL do projeto Supabase
            supabase_key: Chave de API do Supabase
        """
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
    def extrair_dados_planilha(self, arquivo_path: str, nome_aba: str = None) -> pd.DataFrame:
        """
        Extrai dados da planilha Excel
        
        Args:
            arquivo_path: Caminho do arquivo Excel
            nome_aba: Nome da aba (opcional, usa primeira aba se não especificado)
            
        Returns:
            DataFrame com os dados limpos
        """
        # Ler arquivo Excel
        if nome_aba:
            df = pd.read_excel(arquivo_path, sheet_name=nome_aba, header=None)
        else:
            # Detectar primeira aba com dados
            xl_file = pd.ExcelFile(arquivo_path)
            nome_aba = xl_file.sheet_names[0]
            df = pd.read_excel(arquivo_path, sheet_name=nome_aba, header=None)
        
        # Encontrar linha de cabeçalho (procurar por "IDM" ou "ENTREGA")
        header_row = None
        for idx, row in df.iterrows():
            if 'IDM' in str(row.values) or 'ENTREGA' in str(row.values):
                header_row = idx
                break
        
        if header_row is None:
            # Usar cabeçalho padrão se não encontrar
            header_row = 1
        
        # Ler novamente com cabeçalho correto
        df = pd.read_excel(arquivo_path, sheet_name=nome_aba, header=header_row)
        
        # Limpar espaços nos nomes das colunas
        df.columns = df.columns.str.strip()
        
        # Remover linhas vazias
        df = df.dropna(how='all')
        
        return df
    
    def normalizar_dados(self, df: pd.DataFrame) -> List[Dict]:
        """
        Normaliza os dados do DataFrame para o formato do banco
        
        Args:
            df: DataFrame com dados brutos
            
        Returns:
            Lista de dicionários com dados normalizados
        """
        entregas = []
        
        # Mapear colunas (ajustar conforme necessário)
        coluna_map = {
            'IDM': 'codigo_meta',
            'IDE': 'codigo_entrega',
            'ENTREGA': 'descricao_entrega',
            'INDICADOR': 'indicador',
            'DATA DE INÍCIO': 'data_inicio',
            'DATA DE TÉRMINO': 'data_termino',
            'STATUS': 'status',
            'SUPERINTENDÊNCIA': 'superintendencia',
            'SETOR': 'setor',
            'INTERLOCUTOR': 'interlocutor',
            'RESPONSÁVEL PELA ATUALIZAÇÃO': 'responsavel_atualizacao'
        }
        
        # Encontrar coluna de percentual (pode ter variações no nome)
        col_percentual = None
        for col in df.columns:
            if '%' in str(col) and ('EXEC' in str(col).upper() or 'AGOSTO' in str(col).upper()):
                col_percentual = col
                break
        
        for idx, row in df.iterrows():
            # Pular linhas vazias ou cabeçalhos
            if pd.isna(row.get('IDE')) or str(row.get('IDE')).strip() == '':
                continue
            
            entrega = {}
            
            # Mapear campos básicos
            for col_original, col_destino in coluna_map.items():
                if col_original in df.columns:
                    valor = row.get(col_original)
                    if pd.notna(valor):
                        entrega[col_destino] = str(valor).strip()
            
            # Processar percentual de execução
            if col_percentual and col_percentual in df.columns:
                percentual = row.get(col_percentual)
                if pd.notna(percentual):
                    try:
                        # Converter para float (remover % se existir)
                        percentual_str = str(percentual).replace('%', '').strip()
                        percentual_float = float(percentual_str)
                        # Se valor maior que 1, já está em percentual (0-100)
                        if percentual_float > 1:
                            entrega['percentual_execucao'] = round(percentual_float, 2)
                        else:
                            # Se menor que 1, multiplicar por 100
                            entrega['percentual_execucao'] = round(percentual_float * 100, 2)
                    except:
                        entrega['percentual_execucao'] = 0
            
            # Processar datas
            for campo_data in ['data_inicio', 'data_termino']:
                if campo_data in entrega:
                    try:
                        data = pd.to_datetime(entrega[campo_data])
                        entrega[campo_data] = data.strftime('%Y-%m-%d')
                    except:
                        entrega[campo_data] = None
            
            # Normalizar status
            if 'status' in entrega:
                status_map = {
                    'ATRASADA': 'ATRASADA',
                    'EM ANDAMENTO': 'EM ANDAMENTO',
                    'CONCLUÍDA': 'CONCLUÍDA',
                    'CONCLUIDA': 'CONCLUÍDA',
                    'NÃO INICIADA': 'NÃO INICIADA',
                    'NAO INICIADA': 'NÃO INICIADA',
                    'PAUSADA': 'PAUSADA'
                }
                status_original = entrega['status'].upper()
                entrega['status'] = status_map.get(status_original, status_original)
            
            entregas.append(entrega)
        
        return entregas
    
    def extrair_periodo_nome_arquivo(self, nome_arquivo: str) -> Tuple[int, int]:
        """
        Extrai mês e ano do nome do arquivo
        
        Args:
            nome_arquivo: Nome do arquivo (ex: SESAU_AGOSTO_SC.xlsx)
            
        Returns:
            Tupla (mes, ano)
        """
        meses = {
            'JANEIRO': 1, 'FEVEREIRO': 2, 'MARÇO': 3, 'MARCO': 3,
            'ABRIL': 4, 'MAIO': 5, 'JUNHO': 6,
            'JULHO': 7, 'AGOSTO': 8, 'SETEMBRO': 9,
            'OUTUBRO': 10, 'NOVEMBRO': 11, 'DEZEMBRO': 12
        }
        
        nome_upper = nome_arquivo.upper()
        mes = None
        ano = datetime.now().year
        
        # Buscar mês no nome
        for nome_mes, numero_mes in meses.items():
            if nome_mes in nome_upper:
                mes = numero_mes
                break
        
        # Buscar ano (4 dígitos)
        ano_match = re.search(r'20\d{2}', nome_arquivo)
        if ano_match:
            ano = int(ano_match.group())
        
        if mes is None:
            # Se não encontrou, usar mês atual
            mes = datetime.now().month
        
        return mes, ano
    
    def extrair_sigla_secretaria(self, nome_arquivo: str) -> str:
        """
        Extrai sigla da secretaria do nome do arquivo
        
        Args:
            nome_arquivo: Nome do arquivo (ex: SESAU_AGOSTO_SC.xlsx)
            
        Returns:
            Sigla da secretaria
        """
        # Remover extensão
        nome_sem_ext = nome_arquivo.split('.')[0]
        
        # Pegar primeira parte (antes do primeiro _)
        partes = nome_sem_ext.split('_')
        if len(partes) > 0:
            return partes[0].upper()
        
        return 'DESCONHECIDO'
    
    def importar_arquivo(
        self, 
        arquivo_path: str, 
        sigla_secretaria: str = None,
        mes: int = None,
        ano: int = None,
        usuario: str = 'Sistema'
    ) -> Dict:
        """
        Importa um arquivo Excel completo
        
        Args:
            arquivo_path: Caminho do arquivo
            sigla_secretaria: Sigla da secretaria (opcional, extrai do nome)
            mes: Mês de referência (opcional, extrai do nome)
            ano: Ano de referência (opcional, extrai do nome)
            usuario: Usuário que está fazendo a importação
            
        Returns:
            Dicionário com resultado da importação
        """
        try:
            # Extrair informações do arquivo se não fornecidas
            nome_arquivo = os.path.basename(arquivo_path)
            
            if not sigla_secretaria:
                sigla_secretaria = self.extrair_sigla_secretaria(nome_arquivo)
            
            if not mes or not ano:
                mes_auto, ano_auto = self.extrair_periodo_nome_arquivo(nome_arquivo)
                mes = mes or mes_auto
                ano = ano or ano_auto
            
            # Buscar ID da secretaria
            secretaria = self.supabase.table('secretarias').select('id').eq('sigla', sigla_secretaria).execute()
            
            if not secretaria.data:
                return {
                    'sucesso': False,
                    'erro': f'Secretaria {sigla_secretaria} não encontrada'
                }
            
            secretaria_id = secretaria.data[0]['id']
            
            # Extrair dados da planilha
            df = self.extrair_dados_planilha(arquivo_path)
            entregas_normalizadas = self.normalizar_dados(df)
            
            if not entregas_normalizadas:
                return {
                    'sucesso': False,
                    'erro': 'Nenhum dado encontrado na planilha'
                }
            
            # Criar registro de importação
            importacao_data = {
                'secretaria_id': secretaria_id,
                'mes': mes,
                'ano': ano,
                'arquivo_nome': nome_arquivo,
                'total_entregas': len(entregas_normalizadas),
                'importado_por': usuario
            }
            
            # Verificar se já existe importação para este período
            importacao_existente = self.supabase.table('importacoes').select('id').eq(
                'secretaria_id', secretaria_id
            ).eq('mes', mes).eq('ano', ano).execute()
            
            if importacao_existente.data:
                # Atualizar importação existente
                importacao_id = importacao_existente.data[0]['id']
                self.supabase.table('importacoes').update(importacao_data).eq('id', importacao_id).execute()
                
                # Deletar entregas antigas deste período
                self.supabase.table('entregas').delete().eq('importacao_id', importacao_id).execute()
            else:
                # Criar nova importação
                importacao = self.supabase.table('importacoes').insert(importacao_data).execute()
                importacao_id = importacao.data[0]['id']
            
            # Inserir entregas
            entregas_inseridas = 0
            entregas_com_erro = 0
            
            for entrega in entregas_normalizadas:
                try:
                    # Adicionar campos obrigatórios
                    entrega['importacao_id'] = importacao_id
                    entrega['secretaria_id'] = secretaria_id
                    entrega['mes_referencia'] = mes
                    entrega['ano_referencia'] = ano
                    
                    # Inserir no banco
                    self.supabase.table('entregas').insert(entrega).execute()
                    entregas_inseridas += 1
                except Exception as e:
                    entregas_com_erro += 1
                    print(f"Erro ao inserir entrega: {e}")
            
            return {
                'sucesso': True,
                'importacao_id': importacao_id,
                'secretaria': sigla_secretaria,
                'periodo': f'{mes:02d}/{ano}',
                'total_entregas': len(entregas_normalizadas),
                'entregas_inseridas': entregas_inseridas,
                'entregas_com_erro': entregas_com_erro
            }
            
        except Exception as e:
            return {
                'sucesso': False,
                'erro': str(e)
            }
    
    def importar_multiplos_arquivos(
        self, 
        diretorio: str,
        usuario: str = 'Sistema'
    ) -> List[Dict]:
        """
        Importa múltiplos arquivos de um diretório
        
        Args:
            diretorio: Caminho do diretório com arquivos
            usuario: Usuário que está fazendo a importação
            
        Returns:
            Lista com resultados de cada importação
        """
        resultados = []
        
        # Listar arquivos Excel
        for arquivo in os.listdir(diretorio):
            if arquivo.endswith(('.xlsx', '.xls')):
                arquivo_path = os.path.join(diretorio, arquivo)
                print(f"Importando: {arquivo}")
                
                resultado = self.importar_arquivo(arquivo_path, usuario=usuario)
                resultados.append({
                    'arquivo': arquivo,
                    **resultado
                })
        
        return resultados


# ============================================
# EXEMPLO DE USO
# ============================================

if __name__ == '__main__':
    # Configurar credenciais do Supabase
    SUPABASE_URL = 'https://seu-projeto.supabase.co'
    SUPABASE_KEY = 'sua-chave-aqui'
    
    # Criar instância do importador
    importador = ImportadorPlanilhasSEPPE(SUPABASE_URL, SUPABASE_KEY)
    
    # Exemplo 1: Importar arquivo único
    resultado = importador.importar_arquivo(
        arquivo_path='/mnt/user-data/uploads/SESAU_AGOSTO_SC.xlsx',
        usuario='Admin SEPPE'
    )
    print("Resultado da importação:")
    print(resultado)
    
    # Exemplo 2: Importar múltiplos arquivos de um diretório
    # resultados = importador.importar_multiplos_arquivos(
    #     diretorio='/caminho/para/planilhas',
    #     usuario='Admin SEPPE'
    # )
    # 
    # for resultado in resultados:
    #     print(f"\n{resultado['arquivo']}:")
    #     if resultado['sucesso']:
    #         print(f"  ✓ {resultado['entregas_inseridas']} entregas importadas")
    #     else:
    #         print(f"  ✗ Erro: {resultado['erro']}")
