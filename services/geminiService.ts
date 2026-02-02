
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://serh-rag-test.vercel.app";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // Mantém para fallback caso precise (não vai usar mais)
    if (import.meta.env.VITE_API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
    }
  }

  async *streamChat(message: string, history: any[]) {
    try {
      // Chamada para o backend (API intermediária)
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, history }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      yield data.text || "";
    } catch (error) {
      console.error("Erro ao chamar API de chat:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
