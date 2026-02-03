o sistema adota o padrão retrieval-first / generation-second, onde a etapa de generation depende obrigatoriamente do resultado da etapa de retrieval.

fluxo lógico:

user query
→ query embedding
→ vector similarity search
→ top-k document retrieval
→ context augmentation
→ constrained text generation

────────────────────────────────────────

3. SEPARAÇÃO DE RESPONSABILIDADES

frontend
- orchestration layer
- conversation state management
- token streaming
- incremental rendering

retrieval layer
- semantic similarity computation
- relevance scoring
- ranking and top-k selection

vector index
- external semantic memory
- immutable dense embeddings
- read-only data structure

generation layer
- context-conditioned language generation
- rule-constrained inference
- streaming output

────────────────────────────────────────

4. VECTOR EMBEDDINGS

definição formal:

embedding function:
e(text) → ℝ^d

onde:
- d representa a dimensionalidade fixa do embedding space
- textos semanticamente similares são mapeados para vetores próximos

propriedades do embedding space:
- semantic proximity ≈ geometric proximity
- lexical invariance
- robustness to paraphrases
- suitability for linear algebra operations

────────────────────────────────────────

5. VECTOR INDEX (EXTERNAL SEMANTIC MEMORY)

o vector index é um artefato pré-computado contendo:
- raw document content
- structured metadata
- dense embedding vectors

características:
- generated at build time
- immutable at runtime
- loaded once into memory
- cached client-side
- distributed via cdn

o índice atua como uma read-only semantic memory layer.

────────────────────────────────────────

6. SIMILARITY METRIC

a métrica utilizada é cosine similarity:

sim(a, b) = (a · b) / (||a|| × ||b||)

propriedades:
- normalized range [-1, 1]
- magnitude invariant
- angle-based semantic comparison

────────────────────────────────────────

7. RETRIEVAL ALGORITHM

execution flow:
1. generate query embedding
2. iterate over all document embeddings
3. compute cosine similarity scores
4. sort results by descending score
5. select top-k most relevant documents

computational complexity:
- time: O(n · d)
- space: O(n · d)

onde:
n = number of documents
d = embedding dimensionality

para small-to-medium corpora, exact linear search é eficiente e previsível.

────────────────────────────────────────

8. RETRIEVAL-AUGMENTED GENERATION (RAG)

functional decomposition:
- retrieval phase: determines what information is relevant
- generation phase: determines how the answer is formulated

o modelo não executa factual inference fora do contexto explicitamente fornecido.

────────────────────────────────────────

9. CONTEXT AUGMENTATION

os documentos recuperados são concatenados em um explicit context block no prompt, garantindo:
- response traceability
- closed-domain reasoning
- strict knowledge boundaries

────────────────────────────────────────

10. GENERATION CONSTRAINTS

a etapa de generation é controlada via:
- system-level instructions
- low-entropy decoding parameters
- prohibition of external knowledge inference

o modelo atua como um contextual reasoning engine, não como um knowledge oracle.

────────────────────────────────────────

11. STREAMING ARCHITECTURE

a resposta é produzida via token streaming:
- tokens emitted incrementally
- ui consumes an iterator of chunks
- reduced perceived latency

generation e rendering são fully decoupled.

────────────────────────────────────────

12. CACHING STRATEGY

cache layers:
- in-memory vector index cache
- runtime query embedding cache
- cdn-level static asset cache

benefícios:
- reduced latency
- minimized recomputation
- predictable operational cost

────────────────────────────────────────

13. SCALABILITY CONSTRAINTS

exact linear similarity search é adequado até alguns milhares de documentos.

para escalas maiores, torna-se necessário:
- approximate nearest neighbor (ann)
- graph-based indexing (hnsw)
- inverted file systems (ivf)
- distributed vector databases

────────────────────────────────────────

14. CORE DESIGN PRINCIPLE

language models do not retrieve knowledge.
they reason over retrieved context.

todo o sistema é construído para reforçar essa separação conceitual.
