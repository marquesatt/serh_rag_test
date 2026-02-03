#!/bin/bash
# Script para gerar índice vetorial para desenvolvimento

echo "🚀 Gerando índice vetorial..."
node --loader ts-node/esm scripts/generateVectorIndex.ts

if [ $? -eq 0 ]; then
    echo "✅ Índice gerado com sucesso!"
    echo "🎯 Agora execute: npm run dev"
else
    echo "❌ Erro ao gerar índice"
    exit 1
fi
