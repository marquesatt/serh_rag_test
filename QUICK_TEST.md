# ⚡ Teste Rápido da RAG

## 🚀 Quick Start

### 1. App está rodando
- Servidor: **http://localhost:3001**
- Simple Browser aberto acima

### 2. Testar no Chat (UI)

1. **Clique no botão azul** "Comentários" no canto inferior direito
2. Digite uma pergunta, por exemplo:
   - ✅ **"Como vendo dias de férias?"**
   - ✅ **"Quais são os requisitos para teletrabalho?"**
   - ✅ **"Qual é o prazo para ressarcimento de saúde?"**

3. **Verifique no Console (F12)**
   - Procure por logs `[RAG]`
   - Veja chunks sendo recuperados
   - Veja score de relevância

### 3. Testar no Console (Modo Dev)

1. Abra **DevTools (F12)**
2. Vá para a aba **Console**
3. Cole este código:

```javascript
// Teste rápido
import { ragRetriever } from './services/ragRetriever.ts';

const result = ragRetriever.retrieve("Como vendo dias de férias?", 3);
console.log('Chunks:', result.chunks.length);
console.log('Relevância:', (result.totalRelevance * 100).toFixed(1) + '%');
result.chunks.forEach(c => console.log(' -', c.title));
```

## ✅ O que Esperar

### Query: "Como vendo dias de férias?"

**Chunks esperados:**
1. ✅ Venda de Abono de Férias (até 10 dias)
2. ✅ Bloqueios para Venda (recesso judiciário)
3. ✅ Localização (Portal SERH > Férias)

**Relevância esperada:** 80%+

### Query: "Teletrabalho"

**Chunks esperados:**
1. ✅ Limite de Teletrabalho (30% da unidade)
2. ✅ Requisitos (estrutura, concordância, relatório)
3. ✅ Bloqueio (penalidades 2 anos)

**Relevância esperada:** 85%+

### Query: "Qual é o melhor filme?"

**Resposta esperada:** 
- ❌ Baixa relevância (< 30%)
- Gemini responde: "Lamento, mas não possuo informações..."

## 📊 Arquivos Criados

```
services/
├── knowledgeBase.ts      ← 20+ chunks estruturados
├── ragRetriever.ts       ← Lógica de busca & scoring
└── geminiServiceRAG.ts   ← Integração Gemini + RAG

App.tsx                    ← Atualizado para usar RAG

RAG_ARCHITECTURE.md        ← Documentação completa
TESTING_RAG.md             ← Guia de testes
CONSOLE_TEST.js            ← Scripts de teste
```

## 🔍 Como Verificar se Está Funcionando

### Nos Logs do Console

Procure por:
```
[RAG] Query: Como vendo dias de férias?
[RAG] Chunks encontrados: 3
[RAG] Relevância: 0.85
[GeminiServiceRAG] Enviando request...
```

### Na Resposta do Chat

- Deve mencionar informações da knowledge base
- Deve referenciar módulos (Férias, Teletrabalho, etc)
- Deve ser preciso e baseado nas regras

### Performance

- Retrieval: < 5ms
- Total: < 1s

## 💡 Próximos Passos

1. ✅ Testar perguntas variadas
2. ✅ Verificar logs no console
3. ✅ Confirmar respostas precisas
4. ✅ Testar em diferentes navegadores
5. ⚠️ Verificar comportamento em produção

## 🐛 Se Algo Não Funcionar

### Erro: "Cannot find module"
- Recarregue a página (Ctrl+R)
- Verifique se não há erros de TypeScript

### Resposta vazia
- Verifique se API key está configurada
- Veja logs: `console.log()`

### Chunks não encontrados
- Verifique relevância
- A query pode estar muito vaga
- Teste com palavras-chave específicas

---

**Comece testando agora! 🎉**
