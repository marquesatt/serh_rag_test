# 🚀 Como Testar a RAG

## Pré-requisitos

- Node.js instalado
- API key do Gemini configurada em `.env.local` como `VITE_API_KEY`
- Projeto em funcionamento (`npm run dev`)

## Teste Rápido da RAG (No Console)

### 1. Abra o DevTools (F12)

### 2. Importe os módulos no console

```javascript
import { ragRetriever } from './services/ragRetriever.js'
import { geminiServiceRAG } from './services/geminiServiceRAG.js'
```

### 3. Teste o Retriever

```javascript
// Teste 1: Query simples
const result = ragRetriever.retrieve("Como vendo dias de férias?", 3);
console.log(result);

// Teste 2: Verificar relevância
result.chunks.forEach(chunk => {
  console.log(`${chunk.title} (${chunk.module})`);
});

// Teste 3: Buscar por categoria
const feriasChunks = ragRetriever.retrieveByCategory('Férias', 5);
console.log(feriasChunks);

// Teste 4: Buscar por público
const servidorChunks = ragRetriever.retrieveByAudience('Servidor', 10);
console.log(servidorChunks);
```

### 4. Teste o Context Formatting

```javascript
const metadata = geminiServiceRAG.getRetrievalMetadata("teletrabalho");
console.log("Chunks encontrados:", metadata.chunks.length);
console.log("Relevância:", (metadata.totalRelevance * 100).toFixed(1) + "%");

const context = geminiServiceRAG.getRetrievalContext("teletrabalho");
console.log(context);
```

## Teste Completo na UI

### Teste 1: Pergunta sobre Férias

1. Abra o chat do SERH
2. Digite: **"Como vendo dias de férias?"**
3. Verifique no console:
   ```
   [RAG] Query: Como vendo dias de férias?
   [RAG] Chunks encontrados: 3
   [RAG] Relevância: 0.85
   ```
4. A resposta deve mencionar:
   - "até 10 dias por período aquisitivo"
   - "Portal SERH > Férias > Abono Pecuniário"
   - Bloqueios (recesso judiciário)

### Teste 2: Pergunta sobre Teletrabalho

1. Digite: **"Quais são os requisitos para fazer teletrabalho?"**
2. A resposta deve incluir:
   - Estrutura adequada
   - Concordância do indicado
   - Relatório gerencial
   - Nenhuma penalidade nos últimos 2 anos

### Teste 3: Pergunta sobre Saúde

1. Digite: **"Qual é o prazo para pedir ressarcimento de saúde?"**
2. A resposta deve mencionar:
   - "até o último dia do mês seguinte"
   - "Prescrição médica obrigatória"
   - "Apenas 1 pedido por mês"

### Teste 4: Pergunta Fora da Base (Low Relevance)

1. Digite: **"Qual é a melhor programação do streaming?"**
2. A resposta deve ser:
   - "Lamento, mas não possuo informações específicas sobre este tema"
   - OU "Recomendo entrar em contato com suporte"

### Teste 5: Pergunta Ambígua

1. Digite: **"Férias"**
2. Verifique se retorna os chunks de férias mesmo com query curta

## Verificar Logs da RAG

### No Console (DevTools)

Procure por linhas como:
```
[RAG] Query: Como vendo dias de férias?
[RAG] Chunks encontrados: 3
[RAG] Relevância: 0.85
[GeminiServiceRAG] Enviando request...
```

### Analisar Resposta com Metadados

```javascript
// Após fazer uma pergunta, execute:
const result = ragRetriever.retrieve("sua pergunta aqui", 3);
console.table({
  'Chunks': result.chunks.length,
  'Relevância': (result.totalRelevance * 100).toFixed(1) + '%',
  'Chunks Usados': result.chunks.map(c => c.title).join(', ')
});
```

## Teste de Performance

```javascript
// Medir tempo de retrieval
console.time('RAG Retrieval');
const result = ragRetriever.retrieve("teletrabalho", 3);
console.timeEnd('RAG Retrieval');

// Resultado esperado: < 5ms
```

## Checklist de Validação

- [ ] Retrieval funciona com queries simples
- [ ] Chunks corretos são retornados
- [ ] Relevância score é sensato (0-1)
- [ ] Contexto é formatado corretamente
- [ ] Chat integrado funciona
- [ ] Respostas combinam contexto + knowledge
- [ ] Logs de RAG aparecem no console
- [ ] Performance < 100ms total
- [ ] Trata queries fora da base corretamente
- [ ] Funciona em produção (sem localhost)

## Troubleshooting

### Problema: Chunks vazios

```javascript
// Verificar se a base está carregada
import { KNOWLEDGE_BASE_CHUNKS } from './services/knowledgeBase.js';
console.log('Total chunks:', KNOWLEDGE_BASE_CHUNKS.length); // Deve ser 20+
```

### Problema: Relevância muito baixa

```javascript
// Verificar o algoritmo de scoring
const query = "sua query";
const scored = ragRetriever['scoreChunks'](query); // Private, mas há alternativas
console.log(scored.slice(0, 3));
```

### Problema: API retorna erro

```javascript
// Verificar metadados enviados
// Abra a aba Network no DevTools
// Procure pela request POST /api/chat
// Verifique o payload (body)
```

## Métricas para Monitorar

### Taxa de Sucesso
```javascript
// Contar quantas vezes a RAG encontra chunks relevantes
let totalQueries = 0;
let successfulRetrieval = 0; // relevance > 0.3

// Depois de várias perguntas:
const rate = (successfulRetrieval / totalQueries * 100).toFixed(1);
console.log(`Taxa de sucesso da RAG: ${rate}%`); // Alvo: > 85%
```

### Tempo de Resposta
```javascript
// Medir latência total do chat
const startTime = performance.now();
// ... fazer chamada ...
const endTime = performance.now();
console.log(`Latência total: ${(endTime - startTime).toFixed(0)}ms`);
```

## Exemplos de Queries para Testar

### ✅ Alta Relevância Esperada

- "Como vendo dias de férias?"
- "Quais são as regras do teletrabalho?"
- "Qual é o prazo de auxílio saúde?"
- "Posso marcar folga no recesso?"
- "Como registrar frequência?"
- "Posso incluir nova linha no auxílio?"

### ⚠️ Média Relevância Esperada

- "Férias"
- "Teletrabalho limite"
- "Saúde recursos"
- "Folga fim de semana"

### ❌ Baixa Relevância Esperada

- "Qual é o melhor filme?"
- "Como aprender JavaScript?"
- "Receita de bolo"
- "Notícias de esportes"

## Customização da RAG

### Mudar número de chunks retornados

Em `App.tsx`:
```typescript
const stream = geminiServiceRAG.streamChat(messageToSend, apiHistory, {
  topKChunks: 5  // Aumentar de 3 para 5
});
```

### Mudar temperatura (criatividade)

```typescript
const stream = geminiServiceRAG.streamChat(messageToSend, apiHistory, {
  temperature: 0.1  // Mais preciso, menos criativo
});
```

### Desabilitar RAG (fallback)

```typescript
const stream = geminiServiceRAG.streamChat(messageToSend, apiHistory, {
  useRAG: false  // Usa só o system instruction
});
```

---

**Última atualização:** Fevereiro de 2026
