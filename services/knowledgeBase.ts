/**
 * Knowledge Base SERH estruturado para RAG
 * Organizado em chunks categorizados para melhor retrieval
 */

export interface KnowledgeChunk {
  id: string;
  module: string;
  audience: 'Magistrado' | 'Servidor' | 'Ambos';
  title: string;
  content: string;
  keywords: string[];
  category: 'Férias' | 'Teletrabalho' | 'Auxílio Transporte' | 'Auxílio Saúde' | 'Folga Compensatória' | 'Frequência' | 'Governança';
}

export const KNOWLEDGE_BASE_CHUNKS: KnowledgeChunk[] = [
  // === FÉRIAS ===
  {
    id: 'ferias-venda-abono',
    module: 'Férias',
    audience: 'Magistrado',
    title: 'Venda de Abono de Férias',
    content: `Magistrados podem vender até 10 dias por período aquisitivo.
Localização: Portal SERH > Férias > Abono Pecuniário.
Este é um direito opcional que pode ser exercido anualmente.`,
    keywords: ['venda', 'abono', 'férias', 'dias', 'período aquisitivo', 'pecuniário', 'como', 'solicitar', 'solicito', 'tirar férias', 'pedir férias'],
    category: 'Férias',
  },
  {
    id: 'ferias-bloqueio',
    module: 'Férias',
    audience: 'Magistrado',
    title: 'Bloqueios para Venda de Abono',
    content: `Não é permitida a venda de abono de férias se houver:
- Afastamento concomitante
- Período durante recesso judiciário (06/1 a 20/12)
Estas datas devem ser respeitadas obrigatoriamente.`,
    keywords: ['bloqueio', 'afastamento', 'recesso judiciário', 'concomitante', 'não permitido'],
    category: 'Férias',
  },

  // === TELETRABALHO ===
  {
    id: 'teletrabalho-limite-unidade',
    module: 'Teletrabalho',
    audience: 'Servidor',
    title: 'Limite de Teletrabalho por Unidade',
    content: `Servidores podem trabalhar remotamente, com limite de 30% do quadro da unidade.
Este limite pode ser aumentado para 50% ou 60% com justificativa formal da chefia.
A aprovação depende da análise gerencial.`,
    keywords: ['teletrabalho', 'limite', 'unidade', '30%', '50%', '60%', 'remoto'],
    category: 'Teletrabalho',
  },
  {
    id: 'teletrabalho-bloqueio',
    module: 'Teletrabalho',
    audience: 'Servidor',
    title: 'Bloqueios para Teletrabalho',
    content: `Servidores com penalidades nos últimos 2 anos NÃO podem ser elegíveis para teletrabalho.
As penalidades devem ser consultadas no sistema disciplinar.
Após 2 anos do término da penalidade, o servidor pode solicitar novamente.`,
    keywords: ['bloqueio', 'penalidades', 'inelegível', 'disciplina', '2 anos'],
    category: 'Teletrabalho',
  },
  {
    id: 'teletrabalho-requisitos',
    module: 'Teletrabalho',
    audience: 'Servidor',
    title: 'Requisitos para Teletrabalho',
    content: `Para solicitar teletrabalho, o servidor deve atender a:
1. Estrutura adequada declarada pelo servidor (internet, espaço)
2. Concordância explícita do indicado (responsável direto)
3. Relatório gerencial positivo da chefia
4. Nenhuma penalidade nos últimos 2 anos
Todos os requisitos devem ser comprovados na solicitação.`,
    keywords: ['requisitos', 'estrutura', 'concordância', 'relatório', 'chefia'],
    category: 'Teletrabalho',
  },

  // === AUXÍLIO TRANSPORTE ===
  {
    id: 'auxilio-transporte-destinacao',
    module: 'Auxílio Transporte',
    audience: 'Servidor',
    title: 'Destinação do Auxílio Transporte',
    content: `O auxílio transporte é destinado exclusivamente para custeio de transporte coletivo.
Este benefício visa subsidiar deslocamento do servidor até a unidade de trabalho.
Deve ser utilizado com os meios de transporte coletivo disponíveis na região.`,
    keywords: ['auxílio', 'transporte', 'coletivo', 'deslocamento', 'destinação'],
    category: 'Auxílio Transporte',
  },
  {
    id: 'auxilio-transporte-situacoes',
    module: 'Auxílio Transporte',
    audience: 'Servidor',
    title: 'Situações do Auxílio Transporte',
    content: `O auxílio transporte pode estar em diferentes situações:
- Solicitada Inclusão: Aguardando análise
- Ativo: Benefício liberado e em uso
- Cancelamento: Processando cancelamento
- Aguardando usuário: Ação necessária do servidor
- Inclusão de linha: Solicitação de nova linha de transporte`,
    keywords: ['situações', 'status', 'solicitada inclusão', 'ativo', 'cancelamento'],
    category: 'Auxílio Transporte',
  },
  {
    id: 'auxilio-transporte-linha-nao-relacionada',
    module: 'Auxílio Transporte',
    audience: 'Servidor',
    title: 'Inclusão de Linha Não Relacionada',
    content: `Quando a linha de transporte não está relacionada à unidade de trabalho:
- É necessário anexar comprovação (comprovante de residência, etc)
- O status muda para "Solicitada Inclusão de Linha"
- A análise leva em consideração a necessidade comprovada
- Documentação deve ser clara e legível`,
    keywords: ['linha não relacionada', 'comprovação', 'anexo', 'inclusão de linha'],
    category: 'Auxílio Transporte',
  },

  // === AUXÍLIO SAÚDE ===
  {
    id: 'auxilio-saude-prazo',
    module: 'Ressarcimento Auxílio Saúde',
    audience: 'Servidor',
    title: 'Prazo para Ressarcimento de Auxílio Saúde',
    content: `O ressarcimento de despesas com saúde deve ser solicitado até o último dia do mês seguinte à competência.
Exemplo: Despesa em janeiro deve ser solicitada até 28/29 de fevereiro.
Após este prazo, a solicitação é rejeitada automaticamente.`,
    keywords: ['prazo', 'último dia', 'mês seguinte', 'ressarcimento', 'saúde'],
    category: 'Auxílio Saúde',
  },
  {
    id: 'auxilio-saude-prescricao',
    module: 'Ressarcimento Auxílio Saúde',
    audience: 'Servidor',
    title: 'Prescrição Médica Obrigatória',
    content: `Todas as notas fiscais/recibos de saúde devem ter prescrição médica anexada.
Isso inclui:
- Medicamentos
- Procedimentos
- Consultas
- Exames
Sem a prescrição, a nota é rejeitada automaticamente.`,
    keywords: ['prescrição', 'médica', 'obrigatório', 'notas', 'comprovação'],
    category: 'Auxílio Saúde',
  },
  {
    id: 'auxilio-saude-margem',
    module: 'Ressarcimento Auxílio Saúde',
    audience: 'Servidor',
    title: 'Limite de Margem Disponível',
    content: `O ressarcimento deve respeitar a margem disponível do titular.
A margem é calculada conforme a legislação vigente baseada no salário.
Se a despesa exceder a margem disponível, apenas o valor dentro do limite é reembolsado.
Margens não utilizadas podem ser acumuladas conforme regra vigente.`,
    keywords: ['margem', 'limite', 'disponível', 'salário', 'acumulação'],
    category: 'Auxílio Saúde',
  },
  {
    id: 'auxilio-saude-frequencia',
    module: 'Ressarcimento Auxílio Saúde',
    audience: 'Servidor',
    title: 'Frequência de Pedidos de Ressarcimento',
    content: `É permitido apenas 1 pedido de ressarcimento por mês calendário.
Multiple despesas no mesmo mês devem ser agrupadas em um único pedido.
Pedidos adicionais no mesmo mês são automaticamente rejeitados.`,
    keywords: ['frequência', '1 pedido', 'mês', 'um pedido por mês'],
    category: 'Auxílio Saúde',
  },

  // === FOLGA COMPENSATÓRIA ===
  {
    id: 'folga-compensatoria-prazo',
    module: 'Folga Compensatória',
    audience: 'Magistrado',
    title: 'Prazo para Marcar Folga Compensatória',
    content: `A folga compensatória deve ser marcada em datas iguais ou anteriores à data atual.
Não é permitido marcar folga compensatória para datas futuras.
Deve ser agendada conforme a disponibilidade de calendário.`,
    keywords: ['folga', 'compensatória', 'prazo', 'data atual', 'data anterior'],
    category: 'Folga Compensatória',
  },
  {
    id: 'folga-compensatoria-tipos',
    module: 'Folga Compensatória',
    audience: 'Magistrado',
    title: 'Tipos de Folga Compensatória',
    content: `Existem três tipos de folga compensatória:
- Fim de Semana: 1 ou 2 dias
- Feriado: 1 dia
- Feriadão: 3 a 5 dias
Cada tipo tem duração específica e deve ser selecionado conforme a situação.`,
    keywords: ['tipos', 'fim de semana', 'feriado', 'feriadão', 'duração'],
    category: 'Folga Compensatória',
  },
  {
    id: 'folga-compensatoria-bloqueio',
    module: 'Folga Compensatória',
    audience: 'Magistrado',
    title: 'Bloqueio de Folga em Recesso Judiciário',
    content: `Não é permitido marcar folga compensatória durante o recesso judiciário.
O recesso judiciário ocorre de 06/1 a 20/12 (período já definido).
Tentativas de marcar neste período são automaticamente bloqueadas.`,
    keywords: ['bloqueio', 'recesso', 'judiciário', 'não permitido', 'período'],
    category: 'Folga Compensatória',
  },

  // === FREQUÊNCIA ===
  {
    id: 'frequencia-validacao',
    module: 'Frequência',
    audience: 'Servidor',
    title: 'Validação de Registro de Frequência',
    content: `Para validar um registro de frequência, é obrigatório ter:
1. Ingresso (data de entrada)
2. Período (data início e fim)
3. Validador (responsável que autoriza)
4. Unidade (onde o trabalho foi realizado)
Todos os 4 campos devem estar preenchidos e corretos.`,
    keywords: ['frequência', 'validação', 'obrigatório', 'ingresso', 'período', 'validador', 'unidade'],
    category: 'Frequência',
  },
  {
    id: 'frequencia-teletrabalho',
    module: 'Frequência',
    audience: 'Servidor',
    title: 'Frequência em Período de Teletrabalho',
    content: `Quando um servidor está em teletrabalho em parte do período:
- O sistema ajusta automaticamente os dias declarados
- Dias em teletrabalho são marcados diferentemente
- A validação leva em conta a composição de dias presentes e remotos
Não é necessário fazer ajustes manuais, o sistema faz automaticamente.`,
    keywords: ['frequência', 'teletrabalho', 'ajuste automático', 'dias', 'período'],
    category: 'Frequência',
  },

  // === GOVERNANÇA ===
  {
    id: 'governanca-times',
    module: 'PROJETO E GOVERNANÇA',
    audience: 'Ambos',
    title: 'Times do Projeto SERH',
    content: `O projeto SERH é estruturado em 5 times:
- Time Black: Arquitetura (Christian Simões)
- Time Yellow: Benefícios (Leonardo Seiji)
- Time Green: Integrações (Danilo Capobianco)
- Time Blue: Financeiro (Daniel)
- Time Red: Infra (Itamar)
Cada time é responsável por seu domínio específico.`,
    keywords: ['times', 'black', 'yellow', 'green', 'blue', 'red', 'projeto', 'arquitetura', 'benefícios'],
    category: 'Governança',
  },
  {
    id: 'governanca-coordenador',
    module: 'PROJETO E GOVERNANÇA',
    audience: 'Ambos',
    title: 'Coordenador Executivo do SERH',
    content: `Coordenador Executivo: Frederico Augusto Costa de Oliveira (CJF)
Este é o responsável geral pela condução estratégica do projeto SERH.
Contato para questões de governança: frederico.oliveira@cjf.jus.br`,
    keywords: ['coordenador', 'executivo', 'frederico', 'cjf', 'governança'],
    category: 'Governança',
  },
];

/**
 * Extracts all unique keywords from the knowledge base for faster matching
 */
export const getAllKeywords = (): Set<string> => {
  const keywords = new Set<string>();
  KNOWLEDGE_BASE_CHUNKS.forEach(chunk => {
    chunk.keywords.forEach(keyword => keywords.add(keyword.toLowerCase()));
  });
  return keywords;
};

/**
 * Cosine Similarity entre vetores de embedding
 */
export const cosineSimilarity = (vec1: number[], vec2: number[]): number => {
  if (vec1.length !== vec2.length) return 0;
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  return denominator === 0 ? 0 : dotProduct / denominator;
};

/**
 * Interface para chunk com embedding
 */
export interface ChunkWithEmbedding extends KnowledgeChunk {
  embedding?: number[];
}

/**
 * Cache de embeddings gerados
 */
const embeddingCache = new Map<string, number[]>();

/**
 * Gera embedding usando a API do Gemini
 */
export const generateEmbedding = async (text: string, apiKey: string): Promise<number[]> => {
  // Verifica cache
  const cacheKey = `embed:${text.substring(0, 100)}`;
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!;
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'models/embedding-001',
        content: {
          parts: [{ text: text.substring(0, 2000) }], // Limita tamanho
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`);
    }

    const data = await response.json();
    const embedding = data.embedding.values;
    
    // Armazena em cache
    embeddingCache.set(cacheKey, embedding);
    return embedding;
  } catch (error) {
    console.error('Erro ao gerar embedding:', error);
    throw error;
  }
};

/**
 * Busca semântica por similaridade de embeddings
 */
export const semanticSearch = async (
  query: string,
  chunks: ChunkWithEmbedding[],
  apiKey: string,
  topK: number = 5
): Promise<ChunkWithEmbedding[]> => {
  try {
    // Gera embedding da query
    const queryEmbedding = await generateEmbedding(query, apiKey);

    // Calcula similaridade com todos os chunks
    const scored = chunks.map(chunk => ({
      chunk,
      score: chunk.embedding 
        ? cosineSimilarity(queryEmbedding, chunk.embedding)
        : 0,
    }));

    // Ordena por score e retorna top-k
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.chunk);
  } catch (error) {
    console.error('Erro na busca semântica:', error);
    // Fallback: retorna chunks aleatoriamente
    return chunks.slice(0, topK);
  }
};
