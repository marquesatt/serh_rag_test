import { GoogleGenAI } from "@google/genai";
import { VercelRequest, VercelResponse } from "@vercel/node";

const KNOWLEDGE_BASE = `
# Regras SERH (Fonte da Verdade)

MÓDULO: Férias
PÚBLICO: Magistrado
REGRAS: 
- Venda de abono: até 10 dias por período aquisitivo.
- Bloqueio: Não pode se houver afastamento concomitante ou durante recesso judiciário (06/1 a 20/12).
- Localização: Portal SERH > Férias > Abono Pecuniário.

MÓDULO: Teletrabalho
PÚBLICO: Servidor
REGRAS: 
- Limite: 30% da unidade (pode chegar a 50%/60% com justificativa da chefia).
- Bloqueio: Penalidades nos últimos 2 anos impedem o teletrabalho.
- Requisitos: Estrutura adequada declarada pelo servidor, concordância do indicado e relatório gerencial da chefia.

MÓDULO: Auxílio Transporte
PÚBLICO: Servidor
REGRAS:
- Destinação: Uso de transporte coletivo.
- Situações: Solicitada Inclusão, Ativo, Cancelamento, Aguardando usuário, Inclusão de linha.
- Linha não relacionada: Exige comprovação (anexos) e muda para "Solicitada Inclusão de Linha".

MÓDULO: Ressarcimento Auxílio Saúde
PÚBLICO: Servidor
REGRAS:
- Prazo: Até o último dia do mês seguinte à competência.
- Notas: Obrigatório ter prescrição médica para TODAS as notas.
- Limite: Deve respeitar a margem disponível do titular.
- Frequência: Apenas 1 pedido por mês.

MÓDULO: Folga Compensatória
PÚBLICO: Magistrado
REGRAS:
- Prazo: Datas iguais ou anteriores à atual.
- Tipos: Fim de Semana (1-2 dias), Feriado (1 dia), Feriadão (3-5 dias).
- Bloqueio: Não pode marcar no recesso judiciário.

MÓDULO: Frequência
PÚBLICO: Servidor
REGRAS:
- Validação: Obrigatório ingresso, período, validador e unidade.
- Teletrabalho: Sistema ajusta automaticamente os dias declarados no período.

PROJETO E GOVERNANÇA:
- Times: Black (Arquitetura - Christian Simões), Yellow (Benefícios - Leonardo Seiji), Green (Integrações - Danilo Capobianco), Blue (Financeiro - Daniel), Red (Infra - Itamar).
- Coordenador Executivo: Frederico Augusto Costa de Oliveira (CJF).
`;

const SYSTEM_INSTRUCTION = `Você é o "Assistente Virtual SERH", um atendente especializado em Recursos Humanos.
Sua única fonte de verdade é a BASE DE CONHECIMENTO fornecida abaixo.

INSTRUÇÕES DE COMPORTAMENTO:
1. Responda dúvidas de magistrados e servidores com precisão técnica baseada no manual.
2. Seja educado, profissional e direto.
3. Se o usuário perguntar algo que NÃO está na base de conhecimento, responda: "Lamento, mas não possuo informações específicas sobre este tema na minha base de regras atual. Recomendo entrar em contato diretamente com o seu ponto focal de RH ou enviar um e-mail para suporte.rh@exemplo.gov.br."
4. Use Markdown para estruturar as respostas (listas para passos, negrito para prazos).
5. Sempre que citar uma regra de "Onde Fazer", use o caminho de menus indicado (ex: Portal SERH > Férias).
6. Identifique se a dúvida é para Magistrado ou Servidor se houver distinção nas regras.

BASE DE CONHECIMENTO:
${KNOWLEDGE_BASE}`;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message, history } = req.body;

  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  try {
    const apiKey = process.env.VITE_API_KEY;
    
    if (!apiKey) {
      console.error("VITE_API_KEY não configurada");
      res.status(500).json({ error: "API key não configurada" });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
      },
      history: history || [],
    });

    const response = await chat.sendMessage({ message });
    const text = response.text || "";

    res.status(200).json({ text });
  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    res.status(500).json({
      error: "Erro ao processar requisição",
      details: error?.message || String(error),
    });
  }
}
