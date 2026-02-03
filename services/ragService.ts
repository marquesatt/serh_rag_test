/**
 * RAG Service - Retrieval Augmented Generation com Embeddings Semânticos
 * 
 * Esta é uma RAG REAL que:
 * 1. Gera embeddings para cada chunk (representação vetorial)
 * 2. Compara similaridade semântica (não keywords!)
 * 3. Retorna os chunks mais relevantes para contexto
 */

import { KNOWLEDGE_BASE_CHUNKS, generateEmbedding, semanticSearch, ChunkWithEmbedding } from './knowledgeBase';

class RAGService {
  private chunksWithEmbeddings: ChunkWithEmbedding[] = [];
  private initialized = false;
  private apiKey: string = '';

  /**
   * Inicializa o RAG: gera embeddings para todos os chunks
   */
  async initialize(apiKey: string): Promise<void> {
    if (this.initialized && this.apiKey === apiKey) {
      return;
    }

    this.apiKey = apiKey;
    console.log('Inicializando RAG com embeddings semânticos...');

    // Gera embeddings para cada chunk em paralelo (mas com limite)
    const chunks = JSON.parse(JSON.stringify(KNOWLEDGE_BASE_CHUNKS)) as ChunkWithEmbedding[];
    
    // Processa em lotes para não sobrecarregar API
    const batchSize = 5;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (chunk) => {
          try {
            const text = `${chunk.title}. ${chunk.content}`;
            chunk.embedding = await generateEmbedding(text, apiKey);
          } catch (error) {
            console.error(`Erro ao gerar embedding para ${chunk.id}:`, error);
          }
        })
      );
      
      console.log(`Embeddings gerados: ${Math.min(i + batchSize, chunks.length)}/${chunks.length}`);
    }

    this.chunksWithEmbeddings = chunks;
    this.initialized = true;
    console.log('RAG inicializado com sucesso!');
  }

  /**
   * Busca semântica: encontra chunks relevantes para a query
   */
  async retrieve(query: string, topK: number = 3): Promise<ChunkWithEmbedding[]> {
    if (!this.initialized) {
      throw new Error('RAG não inicializado. Chame initialize() primeiro.');
    }

    try {
      const results = await semanticSearch(query, this.chunksWithEmbeddings, this.apiKey, topK);
      return results.filter(r => r.embedding); // Filtra apenas chunks com embeddings
    } catch (error) {
      console.error('Erro na busca semântica:', error);
      // Fallback: retorna chunks aleatoriamente
      return this.chunksWithEmbeddings.slice(0, topK);
    }
  }

  /**
   * Formata os chunks recuperados em contexto para passar ao Gemini
   */
  formatContextForPrompt(chunks: ChunkWithEmbedding[]): string {
    if (chunks.length === 0) {
      return 'Nenhuma informação encontrada na base de conhecimento.';
    }

    return chunks
      .map((chunk, idx) => {
        return `[Fonte ${idx + 1}: ${chunk.module}]
Título: ${chunk.title}
Público: ${chunk.audience}
Conteúdo:
${chunk.content}
---`;
      })
      .join('\n\n');
  }

  /**
   * RAG completo: busca + formata contexto
   */
  async getContext(query: string, topK: number = 3): Promise<string> {
    const chunks = await this.retrieve(query, topK);
    return this.formatContextForPrompt(chunks);
  }

  /**
   * Status do RAG
   */
  getStatus(): {
    initialized: boolean;
    chunkCount: number;
    embeddedChunks: number;
  } {
    return {
      initialized: this.initialized,
      chunkCount: this.chunksWithEmbeddings.length,
      embeddedChunks: this.chunksWithEmbeddings.filter(c => !!c.embedding).length,
    };
  }
}

export const ragService = new RAGService();
