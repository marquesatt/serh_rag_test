/**
 * Script de Build: Gera índice vetorial pré-computado
 * Executa durante: npm run build
 * 
 * Lê knowledge_base.json → Gera embeddings → Salva vectorIndex.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carrega .env
config({ path: path.join(__dirname, '..', '.env') });

interface KBItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

interface VectorIndexEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  embedding: number[];
}

interface VectorIndexFile {
  version: string;
  generatedAt: string;
  documentCount: number;
  embeddingDimension: number;
  entries: VectorIndexEntry[];
}

/**
 * Gera embedding via Gemini API
 */
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: {
          parts: [{ text: text.substring(0, 3000) }],
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Embedding API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.embedding.values || [];
  } catch (error) {
    console.error('Erro ao gerar embedding:', error);
    throw error;
  }
}

/**
 * Main: Vetoriza a base de conhecimento
 */
async function buildVectorIndex() {
  console.log('🚀 Iniciando geração do índice vetorial...\n');

  // Lê API key
  const apiKey = process.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error('❌ VITE_API_KEY não definida no .env');
  }

  // Lê knowledge_base.json
  const kbPath = path.join(__dirname, '..', 'knowledge_base.json');
  if (!fs.existsSync(kbPath)) {
    throw new Error(`❌ knowledge_base.json não encontrado em ${kbPath}`);
  }

  const kb: KBItem[] = JSON.parse(fs.readFileSync(kbPath, 'utf-8'));
  console.log(`📚 Base carregada: ${kb.length} documentos\n`);

  const entries: VectorIndexEntry[] = [];
  let embeddingDimension = 0;

  // Processa em lotes para não sobrecarregar API
  const BATCH_SIZE = 5;
  const DELAY_MS = 1000; // Delay entre lotes

  for (let i = 0; i < kb.length; i += BATCH_SIZE) {
    const batch = kb.slice(i, Math.min(i + BATCH_SIZE, kb.length));
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(kb.length / BATCH_SIZE);

    console.log(`📦 Processando lote ${batchNumber}/${totalBatches} (${batch.length} docs)...`);

    const batchEntries = await Promise.all(
      batch.map(async (item) => {
        try {
          const text = `${item.title}\n${item.content}`;
          const embedding = await generateEmbedding(text, apiKey);

          if (embeddingDimension === 0) {
            embeddingDimension = embedding.length;
          }

          return {
            id: item.id,
            title: item.title,
            content: item.content,
            tags: item.tags,
            embedding,
          };
        } catch (error) {
          console.error(`  ⚠️  Erro no documento ${item.id}: ${error}`);
          return null;
        }
      })
    );

    const validEntries = batchEntries.filter((e): e is VectorIndexEntry => e !== null);
    entries.push(...validEntries);

    console.log(`  ✅ ${validEntries.length}/${batch.length} documentos indexados`);
    console.log(`  📊 Total até agora: ${entries.length}/${kb.length}\n`);

    // Delay entre lotes para não sobrecarregar API
    if (i + BATCH_SIZE < kb.length) {
      console.log(`⏳ Aguardando ${DELAY_MS}ms antes do próximo lote...\n`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  // Cria índice final
  const vectorIndex: VectorIndexFile = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    documentCount: entries.length,
    embeddingDimension,
    entries,
  };

  // Salva em public/vectorIndex.json
  const outputPath = path.join(__dirname, '..', 'public', 'vectorIndex.json');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(vectorIndex, null, 2));

  console.log('\n✅ Índice vetorial gerado com sucesso!\n');
  console.log(`📊 Estatísticas:`);
  console.log(`   - Documentos: ${vectorIndex.documentCount}`);
  console.log(`   - Dimensão: ${vectorIndex.embeddingDimension}`);
  console.log(`   - Arquivo: ${outputPath}`);
  console.log(`   - Tamanho: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   - Timestamp: ${vectorIndex.generatedAt}\n`);
}

// Executa
buildVectorIndex().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
