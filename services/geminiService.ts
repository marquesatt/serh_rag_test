
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export class GeminiService {
  async *streamChat(message: string, history: any[]) {
    try {
      // Detecta a URL base correta (desenvolvimento ou produção)
      const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
      const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      
      // Em desenvolvimento usa localhost, em produção usa a URL atual
      const apiUrl = isLocalhost ? `${protocol}//localhost:3000/api/chat` : `${protocol}//${host}/api/chat`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, history }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      
      // Se for streaming, yield cada chunk
      if (data.text) {
        yield data.text;
      }
    } catch (error) {
      console.error("Erro ao chamar API de chat:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
