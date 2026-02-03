/**
 * RAG Service - Carrega índice vetorial pré-computado
 * 
 * Workflow:
 * 1. Script de build gera vectorIndex.json
 * 2. App carrega em runtime
 * 3. Busca é instantânea (O(n) sem overhead)
 */

interface VectorIndexEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  embedding: number[];
}

interface VectorIndexFile {
  version: string;
  generatedAt: string;
  documentCount: number;
  embeddingDimension: number;
  entries: VectorIndexEntry[];
}

let vectorIndex: VectorIndexFile | null = null;

/**
 * Carrega índice vetorial do endpoint
 */
export async function loadVectorIndex(): Promise<VectorIndexFile> {
  if (vectorIndex) {
    return vectorIndex;
  }

  try {
    // Usa a URL de produção ou fallback para relativo
    const vectorIndexUrl = 'https://serh-rag-test.vercel.app/vectorIndex.json';
    
    console.log(`📚 Carregando índice de: ${vectorIndexUrl}`);
    
    const response = await fetch(vectorIndexUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    vectorIndex = await response.json();
    console.log(`✅ Índice carregado: ${vectorIndex.documentCount} documentos`);
    return vectorIndex;
  } catch (error) {
    console.error('Erro ao carregar índice:', error);
    throw new Error('Não foi possível carregar o índice vetorial.');
  }
}

/**
 * Cosine similarity entre dois vetores
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Gera embedding da query em runtime
 */
async function generateQueryEmbedding(query: string, apiKey: string): Promise<number[]> {
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/embedding-001',
          content: {
            parts: [{ text: query.substring(0, 3000) }],
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding.values || [];
  } catch (error) {
    console.error('Erro ao gerar embedding:', error);
    return [];
  }
}

/**
 * Busca semântica pura: similarity search no índice pré-computado
 */
export async function semanticSearch(
  query: string,
  apiKey: string,
  topK: number = 5
): Promise<VectorIndexEntry[]> {
  // Carrega índice
  const index = await loadVectorIndex();

  if (index.entries.length === 0) {
    console.warn('Índice vazio');
    return [];
  }

  try {
    // Gera embedding da query
    const queryEmbedding = await generateQueryEmbedding(query, apiKey);

    if (queryEmbedding.length === 0) {
      console.warn('Query embedding vazio');
      return index.entries.slice(0, topK);
    }

    // Calcula similaridade com todos os documentos
    const scored = index.entries.map((entry) => ({
      entry,
      score: cosineSimilarity(queryEmbedding, entry.embedding),
    }));

    // Retorna top-K ordenado
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((s) => s.entry);
  } catch (error) {
    console.error('Erro na busca:', error);
    return index.entries.slice(0, topK);
  }
}

/**
 * Status do índice
 */
export async function getIndexStatus() {
  const index = await loadVectorIndex();
  return {
    loaded: true,
    documentCount: index.documentCount,
    embeddingDimension: index.embeddingDimension,
    generatedAt: index.generatedAt,
  };
}
