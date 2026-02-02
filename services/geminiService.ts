
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export class GeminiService {
  async *streamChat(message: string, history: any[]) {
    try {
      // Em desenvolvimento usa localhost, em produção sempre usa a Vercel
      const isLocalhost = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      
      const apiUrl = isLocalhost 
        ? 'http://localhost:3000/api/chat'
        : 'https://serh-rag-test.vercel.app/api/chat';

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
