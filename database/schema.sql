-- RepairAtlas MVP schema for CockroachDB.
-- Run against a dedicated application database with a least-privilege role.

CREATE TABLE IF NOT EXISTS organizations (id STRING PRIMARY KEY, name STRING NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS assets (id STRING PRIMARY KEY, organization_id STRING NOT NULL REFERENCES organizations(id), name STRING NOT NULL, model STRING, site STRING, status STRING NOT NULL DEFAULT 'active', metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS assets_org_idx ON assets (organization_id);
CREATE TABLE IF NOT EXISTS work_orders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id STRING NOT NULL REFERENCES organizations(id), asset_id STRING NOT NULL REFERENCES assets(id), title STRING NOT NULL, status STRING NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS work_orders_asset_idx ON work_orders (organization_id, asset_id, created_at DESC);
CREATE TABLE IF NOT EXISTS repair_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id STRING NOT NULL REFERENCES organizations(id), asset_id STRING NOT NULL REFERENCES assets(id), work_order_id UUID REFERENCES work_orders(id), action STRING NOT NULL, observation STRING, outcome STRING, parts JSONB NOT NULL DEFAULT '[]', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS repair_memories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id STRING NOT NULL REFERENCES organizations(id), asset_id STRING REFERENCES assets(id), title STRING NOT NULL, summary STRING NOT NULL, outcome STRING NOT NULL CHECK (outcome IN ('resolved','failed')), embedding VECTOR(1024), source_event_id UUID REFERENCES repair_events(id), created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS repair_memories_scope_idx ON repair_memories (organization_id, asset_id, created_at DESC);
-- CockroachDB vector indexing is used as the semantic memory layer. Prefix columns scope the ANN search by tenant and asset.
CREATE VECTOR INDEX IF NOT EXISTS repair_memories_embedding_idx ON repair_memories (organization_id, asset_id, embedding) USING COSINE;
CREATE TABLE IF NOT EXISTS agent_sessions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id STRING NOT NULL REFERENCES organizations(id), asset_id STRING REFERENCES assets(id), status STRING NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS agent_actions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), session_id UUID NOT NULL REFERENCES agent_sessions(id), action STRING NOT NULL, approval_required BOOL NOT NULL DEFAULT false, approved BOOL NOT NULL DEFAULT false, status STRING NOT NULL, result JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS audit_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id STRING NOT NULL REFERENCES organizations(id), actor_type STRING NOT NULL, actor_id STRING, action STRING NOT NULL, resource_type STRING, resource_id STRING, metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now());

INSERT INTO organizations (id,name) VALUES ('demo-org','RepairAtlas Demo') ON CONFLICT (id) DO NOTHING;
INSERT INTO assets (id,organization_id,name,model,site,status) VALUES ('PRESS-204','demo-org','PRESS-204','Hydraulic Press','Site 07 · Line B','attention') ON CONFLICT (id) DO NOTHING;
