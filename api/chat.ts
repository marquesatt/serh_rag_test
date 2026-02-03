import { GoogleGenAI } from "@google/genai";
import { KNOWLEDGE_BASE_CHUNKS, generateEmbedding, semanticSearch } from "../services/knowledgeBase";

const SYSTEM_INSTRUCTION = `Você é o "Assistente Virtual SERH", um atendente especializado em Recursos Humanos.
Sua única fonte de verdade é a BASE DE CONHECIMENTO fornecida no contexto abaixo.

INSTRUÇÕES DE COMPORTAMENTO:
1. Responda dúvidas de magistrados e servidores com PRECISÃO TÉCNICA baseada nas informações fornecidas.
2. Seja educado, profissional e direto.
3. Se o usuário perguntar algo que NÃO está na base de conhecimento, responda: "Lamento, mas não possuo informações específicas sobre este tema na minha base de regras atual. Recomendo entrar em contato diretamente com o seu ponto focal de RH ou enviar um e-mail para suporte.rh@exemplo.gov.br."
4. Use Markdown para estruturar as respostas (listas para passos, **negrito** para prazos críticos).
5. Sempre que citar uma regra de "Onde Fazer", use o caminho de menus indicado (ex: Portal SERH > Férias).
6. Identifique se a dúvida é para Magistrado ou Servidor se houver distinção nas regras.
7. Cite a fonte da informação quando possível: "[Fonte: Módulo X]".

CONTEXTO DO CONHECIMENTO SERÁ INSERIDO AQUI
`;

// Cache de embeddings gerados
const embeddingCache = new Map<string, number[]>();

/**
 * Gera embedding usando a API do Gemini
 */
async function getEmbedding(text: string, apiKey: string): Promise<number[]> {
  const cacheKey = `embed:${text.substring(0, 100)}`;
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!;
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'models/embedding-001',
        content: {
          parts: [{ text: text.substring(0, 2000) }],
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding error: ${response.status}`);
    }

    const data = await response.json();
    const embedding = data.embedding.values;
    embeddingCache.set(cacheKey, embedding);
    return embedding;
  } catch (error) {
    console.error('Erro ao gerar embedding:', error);
    throw error;
  }
}

/**
 * Cosine similarity entre vetores
 */
function cosineSimilarity(vec1: number[], vec2: number[]): number {
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
}

/**
 * Busca semântica na knowledge base
 */
async function retrieveRelevantChunks(query: string, apiKey: string, topK: number = 3) {
  try {
    // Gera embedding da query
    const queryEmbedding = await getEmbedding(query, apiKey);

    // Gera embeddings para todos os chunks e calcula similaridade
    const scored = await Promise.all(
      KNOWLEDGE_BASE_CHUNKS.map(async (chunk) => {
        const text = `${chunk.title}. ${chunk.content}`;
        const chunkEmbedding = await getEmbedding(text, apiKey);
        const score = cosineSimilarity(queryEmbedding, chunkEmbedding);
        return { chunk, score };
      })
    );

    // Retorna top-k com maior similaridade
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.chunk);
  } catch (error) {
    console.error('Erro na busca semântica:', error);
    // Fallback: retorna chunks aleatórios
    return KNOWLEDGE_BASE_CHUNKS.slice(0, topK);
  }
}

/**
 * Formata chunks para o prompt
 */
function formatContextForPrompt(chunks: typeof KNOWLEDGE_BASE_CHUNKS): string {
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

export default async function handler(req: any, res: any): Promise<void> {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const apiKey = process.env.VITE_API_KEY;
    
    if (!apiKey) {
      console.error("VITE_API_KEY não configurada");
      res.status(500).json({ error: "API key não configurada", code: "NO_API_KEY" });
      return;
    }

    console.log("Iniciando RAG com busca semântica...");
    
    // RAG: Busca semântica por chunks relevantes
    const relevantChunks = await retrieveRelevantChunks(message, apiKey, 3);
    const context = formatContextForPrompt(relevantChunks);
    
    // Cria o prompt final com contexto
    const finalSystemInstruction = SYSTEM_INSTRUCTION.replace(
      'CONTEXTO DO CONHECIMENTO SERÁ INSERIDO AQUI',
      `BASE DE CONHECIMENTO RELEVANTE:\n${context}`
    );

    console.log("Enviando para Gemini com contexto RAG...");
    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: finalSystemInstruction,
        temperature: 0.2,
      },
      history: history || [],
    });

    const response = await chat.sendMessage({ message });
    const text = response.text || "";

    console.log("Resposta obtida com sucesso");
    res.status(200).json({ text });
  } catch (error: any) {
    console.error("Erro na API:", {
      message: error?.message,
      code: error?.code,
      status: error?.status,
    });
    res.status(500).json({
      error: "Erro ao processar requisição",
      details: error?.message || String(error),
      code: error?.code,
    });
  }
}
