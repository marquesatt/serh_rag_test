/**
 * Índice Vetorial - RAG Profissional
 * 
 * Estratégia:
 * 1. Gera embeddings para cada documento UMA ÚNICA VEZ
 * 2. Armazena em um índice em memória
 * 3. Busca é pura embedding (similarity search)
 * 4. Zero overhead em cada query
 */

import knowledgeBase from "../knowledge_base.json";

const EMBEDDING_API = 'https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent';

interface KBItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

interface IndexEntry {
  item: KBItem;
  embedding: number[];
}

let vectorIndex: IndexEntry[] = [];
let isInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Gera embedding via API Gemini
 */
export async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  try {
    const response = await fetch(`${EMBEDDING_API}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/embedding-001',
        content: {
          parts: [{ text: text.substring(0, 3000) }],
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Embedding API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.embedding.values || [];
  } catch (error) {
    console.error('Erro ao gerar embedding:', error);
    throw error;
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
 * Inicializa o índice vetorial
 * Gera embeddings para TODOS os documentos uma única vez
 */
export async function initializeVectorIndex(apiKey: string): Promise<void> {
  if (isInitialized) {
    return;
  }

  // Evita múltiplas inicializações simultâneas
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      console.log('Inicializando índice vetorial...');
      const kb = knowledgeBase as KBItem[];
      const entries: IndexEntry[] = [];

      // Processa em lotes para não sobrecarregar API
      const BATCH_SIZE = 5;
      for (let i = 0; i < kb.length; i += BATCH_SIZE) {
        const batch = kb.slice(i, Math.min(i + BATCH_SIZE, kb.length));

        const batchEntries = await Promise.all(
          batch.map(async (item) => {
            try {
              const text = `${item.title}\n${item.content}`;
              const embedding = await generateEmbedding(text, apiKey);

              return {
                item,
                embedding,
              };
            } catch (error) {
              console.error(`Erro ao processar documento ${item.id}:`, error);
              return null;
            }
          })
        );

        entries.push(...batchEntries.filter((e): e is IndexEntry => e !== null));

        const progress = Math.min(i + BATCH_SIZE, kb.length);
        console.log(`Índice: ${progress}/${kb.length} documentos processados`);
      }

      vectorIndex = entries;
      isInitialized = true;
      console.log(`Índice vetorial pronto! ${entries.length} documentos indexados.`);
    } catch (error) {
      console.error('Erro ao inicializar índice vetorial:', error);
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Busca semântica pura: retorna top-K documentos mais similares
 */
export async function semanticSearch(
  query: string,
  apiKey: string,
  topK: number = 3
): Promise<KBItem[]> {
  // Garante que o índice foi inicializado
  if (!isInitialized) {
    await initializeVectorIndex(apiKey);
  }

  if (vectorIndex.length === 0) {
    console.warn('Índice vetorial vazio');
    return [];
  }

  try {
    // Gera embedding da query
    const queryEmbedding = await generateEmbedding(query, apiKey);

    if (queryEmbedding.length === 0) {
      console.warn('Query embedding vazio');
      return vectorIndex.slice(0, topK).map((e) => e.item);
    }

    // Calcula similaridade com todos os documentos
    const scores = vectorIndex.map((entry) => ({
      item: entry.item,
      score: cosineSimilarity(queryEmbedding, entry.embedding),
    }));

    // Retorna top-K
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((s) => s.item);
  } catch (error) {
    console.error('Erro na busca semântica:', error);
    return vectorIndex.slice(0, topK).map((e) => e.item);
  }
}

/**
 * Status do índice
 */
export function getIndexStatus() {
  return {
    initialized: isInitialized,
    documentsIndexed: vectorIndex.length,
  };
}
