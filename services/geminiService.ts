import { GoogleGenAI } from "@google/genai";
import { semanticSearch } from "./vectorIndexService";

export class GeminiService {
  async *streamChat(message: string, history: any[]) {
    try {
      const apiKey = (import.meta.env as any).VITE_API_KEY;
      if (!apiKey) throw new Error('API key não configurada');

      // RAG: Busca semântica no índice vetorial pré-computado
      const results = await semanticSearch(message, apiKey, 5);

      if (results.length === 0) {
        yield 'Desculpe, não consegui ajudar com essa dúvida no momento.';
        return;
      }

      const context = results
        .map((doc) => `${doc.title}\n${doc.content}`)
        .join('\n\n---\n\n');

      const systemPrompt = `Você é o "Assistente Virtual SERH. Um chatbot.".
Sua função é responder as mensagens do usuário com base ESTRITAMENTE no contexto recuperado abaixo.

DIRETRIZES:
1. Responda apenas com base nas FONTES RECUPERADAS abaixo.
2. Se o contexto estiver vazio ou insuficiente, esclareça com o usuário e tente sempre buscar mais informações.
3. Não invente informações ou dados que não estão na base.
4. Seja cordial, profissional e direto.
5. Estruture respostas em Markdown quando apropriado (listas, tabelas, seções).
6. Se o usuário perguntar algo fora do escopo SERH, indique que está especializado em SERH.

CONTEXTO RECUPERADO:
${context}`;

      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
        },
        history,
      });

      const response = await chat.sendMessage({ message });
      yield response.text || '';
    } catch (error) {
      console.error("Erro Gemini:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
