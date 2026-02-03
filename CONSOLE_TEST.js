/**
 * Script de Teste Rápido da RAG
 * Execute no console (DevTools) do navegador
 */

// Copie e cole no console do navegador:

// ============================================
// TESTE 1: Verificar se RAG está carregado
// ============================================
async function test1_CheckRAG() {
  console.log('=== TESTE 1: Verificar RAG ===');
  
  try {
    const { ragRetriever } = await import('./services/ragRetriever.ts');
    const { KNOWLEDGE_BASE_CHUNKS } = await import('./services/knowledgeBase.ts');
    console.log('✅ RAG carregado com sucesso!');
    console.log(`📊 Total de chunks: ${KNOWLEDGE_BASE_CHUNKS.length}`);
    return true;
  } catch (e) {
    console.error('❌ Erro ao carregar RAG:', e);
    return false;
  }
}

// ============================================
// TESTE 2: Teste básico de retrieval
// ============================================
async function test2_BasicRetrieval() {
  console.log('\n=== TESTE 2: Retrieval Básico ===');
  
  const { ragRetriever } = await import('./services/ragRetriever.ts');
  
  const query = "Como vendo dias de férias?";
  const result = ragRetriever.retrieve(query, 3);
  
  console.log(`Query: "${query}"`);
  console.log(`Chunks encontrados: ${result.chunks.length}`);
  console.log(`Relevância: ${(result.totalRelevance * 100).toFixed(1)}%`);
  console.log('\nChunks:');
  result.chunks.forEach((chunk, idx) => {
    console.log(`  ${idx + 1}. ${chunk.title} (${chunk.module})`);
  });
  
  return result;
}

// ============================================
// TESTE 3: Teste com diferentes queries
// ============================================
async function test3_MultipleQueries() {
  console.log('\n=== TESTE 3: Múltiplas Queries ===');
  
  const { ragRetriever } = await import('./services/ragRetriever.ts');
  
  const queries = [
    "Como vendo dias de férias?",
    "Quais são os requisitos para teletrabalho?",
    "Qual é o prazo para ressarcimento de saúde?",
    "Posso marcar folga no recesso?",
  ];
  
  const results = [];
  
  for (const query of queries) {
    const result = ragRetriever.retrieve(query, 2);
    const relevance = (result.totalRelevance * 100).toFixed(1);
    const chunks = result.chunks.length;
    
    console.log(`"${query}"`);
    console.log(`  → ${chunks} chunks, ${relevance}% relevância`);
    results.push(result);
  }
  
  return results;
}

// ============================================
// TESTE 4: Ver contexto formatado
// ============================================
async function test4_FormattedContext() {
  console.log('\n=== TESTE 4: Contexto Formatado ===');
  
  const { geminiServiceRAG } = await import('./services/geminiServiceRAG.ts');
  
  const query = "teletrabalho requisitos";
  const context = geminiServiceRAG.getRetrievalContext(query, 2);
  
  console.log('Contexto a ser enviado para o Gemini:');
  console.log('─'.repeat(50));
  console.log(context);
  console.log('─'.repeat(50));
}

// ============================================
// TESTE 5: Busca por categoria
// ============================================
async function test5_CategorySearch() {
  console.log('\n=== TESTE 5: Busca por Categoria ===');
  
  const { ragRetriever } = await import('./services/ragRetriever.ts');
  
  const categories = ['Férias', 'Teletrabalho', 'Auxílio Saúde'];
  
  for (const category of categories) {
    const chunks = ragRetriever.retrieveByCategory(category, 3);
    console.log(`\n${category} (${chunks.length} chunks):`);
    chunks.forEach(chunk => {
      console.log(`  • ${chunk.title}`);
    });
  }
}

// ============================================
// TESTE 6: Performance
// ============================================
async function test6_Performance() {
  console.log('\n=== TESTE 6: Performance ===');
  
  const { ragRetriever } = await import('./services/ragRetriever.ts');
  
  const query = "Como funciona o teletrabalho?";
  
  console.time('RAG Retrieval');
  const result = ragRetriever.retrieve(query, 3);
  console.timeEnd('RAG Retrieval');
  
  console.log(`Chunks: ${result.chunks.length}, Relevância: ${(result.totalRelevance * 100).toFixed(1)}%`);
}

// ============================================
// EXECUTAR TODOS OS TESTES
// ============================================
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║       TESTE COMPLETO DA RAG DO SERH               ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  
  try {
    const check = await test1_CheckRAG();
    if (!check) return;
    
    await test2_BasicRetrieval();
    await test3_MultipleQueries();
    await test4_FormattedContext();
    await test5_CategorySearch();
    await test6_Performance();
    
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║              ✅ TODOS OS TESTES PASSARAM!          ║');
    console.log('╚════════════════════════════════════════════════════╝');
  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error);
  }
}

// ============================================
// EXECUTAR TESTES INDIVIDUAIS:
// ============================================
// test1_CheckRAG()
// test2_BasicRetrieval()
// test3_MultipleQueries()
// test4_FormattedContext()
// test5_CategorySearch()
// test6_Performance()

// ============================================
// OU EXECUTAR TUDO:
// ============================================
// runAllTests()

console.log('📝 Scripts de teste prontos! Execute um destes:');
console.log('  runAllTests()              - Rodar todos os testes');
console.log('  test1_CheckRAG()           - Verificar se RAG está carregado');
console.log('  test2_BasicRetrieval()     - Testar retrieval básico');
console.log('  test3_MultipleQueries()    - Testar com várias queries');
console.log('  test4_FormattedContext()   - Ver contexto formatado');
console.log('  test5_CategorySearch()     - Busca por categoria');
console.log('  test6_Performance()        - Medir performance');
