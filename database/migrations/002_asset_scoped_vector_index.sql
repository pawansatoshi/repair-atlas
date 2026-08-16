-- Scope the ANN index by tenant and asset so vector retrieval cannot cross asset boundaries.
-- Run only after the base schema has been applied.
DROP INDEX IF EXISTS repair_memories_embedding_idx;
CREATE VECTOR INDEX IF NOT EXISTS repair_memories_embedding_idx
ON repair_memories (organization_id, asset_id, embedding)
USING COSINE;
