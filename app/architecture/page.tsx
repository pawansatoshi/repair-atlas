'use client';

import { useState } from 'react';

const nodes = [
  { id: 'ui', label: 'RepairAtlas UI', tech: 'Next.js + React + AWS Amplify', detail: 'The technician describes a field problem, reviews evidence, approves consequential actions, and records the outcome.' },
  { id: 'agent', label: 'Agent execution', tech: 'Amazon Bedrock AgentCore Runtime', detail: 'Runs the bounded agent workflow. The model can reason and recommend, but the application keeps consequential writes behind approval.' },
  { id: 'bedrock', label: 'Reasoning + embeddings', tech: 'Amazon Bedrock', detail: 'Bedrock provides model inference and Titan Text Embeddings V2. The tested embedding contract is 1,024 dimensions.' },
  { id: 'db', label: 'Operational memory', tech: 'CockroachDB Cloud', detail: 'One system of record holds assets, work orders, repair events, audit state, and VECTOR(1024) repair memories.' },
  { id: 'mcp', label: 'Governed database access', tech: 'CockroachDB Managed MCP', detail: 'The target architecture gives the agent a governed interface to scoped database operations. End-to-end MCP verification remains a release item.' },
];

const bugs = [
  ['Environment', 'CloudShell initially pointed psql at a local PostgreSQL socket instead of CockroachDB Cloud.', 'Recovered the configured remote database URL and validated against the real database.'],
  ['Tooling', 'TypeScript validation failed because tsc was not available in the initial dependency set.', 'Installed development dependencies and reran typecheck successfully.'],
  ['Infrastructure', 'CloudShell hit ENOSPC during dependency installation.', 'Removed temporary npm cache/node_modules pressure and reinstalled cleanly.'],
  ['AWS Amplify', 'The deployed Next.js server could not see selected app-level environment variables at runtime.', 'Added the documented SSR environment bridge and then re-verified the live application path.'],
  ['AgentCore', 'A live runtime invocation exposed a JSON serialization boundary: an object containing a UUID could not be serialized.', 'The failure was isolated as an invocation/payload boundary rather than treated as an AI reasoning failure; runtime verification remained an explicit release gate.'],
  ['Search/debugging', 'Some grep/find commands were aimed at temporary extraction paths rather than the repository root.', 'Stopped treating shell-path mistakes as application defects and returned analysis to the actual repository source.'],
];

const faqs = [
  ['What problem does this solve?', 'Factories often lose repair expertise between shifts. RepairAtlas turns completed interventions into searchable operational memory so the next technician can see what worked and what failed.'],
  ['What does the technician type?', 'Normal language: asset + symptom + useful context. Example: “PRESS-204 overheating after six hours of production.”'],
  ['Does the AI control the machine?', 'Not in this workflow. It retrieves evidence and proposes a bounded next action. Consequential work-order creation requires explicit human approval.'],
  ['Why store failed repairs?', 'A failed intervention is useful negative evidence. It can stop the team from repeating an expensive dead end.'],
  ['Why CockroachDB?', 'Transactional repair state and semantic memory stay together, so the evidence remains attached to the operational record instead of living in a disconnected vector store.'],
  ['What did AWS contribute?', 'Amplify provides production hosting; Bedrock provides reasoning and embeddings; AgentCore provides the target managed runtime for bounded agent execution. AWS is used where it solves a concrete product problem, not just to increase service count.'],
];

export default function ArchitecturePage() {
  const [selected, setSelected] = useState('ui');
  const [section, setSection] = useState<'architecture' | 'journey' | 'faq'>('architecture');
  const node = nodes.find((item) => item.id === selected) ?? nodes[0];

  return (
    <main style={{ minHeight: '100vh', padding: '28px 18px 70px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          <div>
            <div className="eyebrow">System guide · RepairAtlas</div>
            <h1 style={{ fontSize: 'clamp(30px,5vw,52px)', margin: '8px 0 8px', letterSpacing: '-.045em' }}>See how the whole system fits together.</h1>
            <p className="muted" style={{ maxWidth: 760, lineHeight: 1.65, margin: 0 }}>A simple interactive view of the product, the technology, the bugs we actually encountered, and why the architecture matters to a factory.</p>
          </div>
          <a className="btn" href="/">← Back to product</a>
        </header>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          {([['architecture', 'Architecture'], ['journey', '4-day engineering journey'], ['faq', 'FAQ']] as const).map(([key, label]) => (
            <button key={key} className={`btn ${section === key ? 'primary' : ''}`} onClick={() => setSection(key)}>{label}</button>
          ))}
        </div>

        {section === 'architecture' && (
          <>
            <section className="card" style={{ padding: 20 }}>
              <div className="eyebrow">Interactive architecture</div>
              <h2 style={{ margin: '7px 0 6px', fontSize: 24 }}>Click a box to understand its job.</h2>
              <p className="muted" style={{ lineHeight: 1.6, maxWidth: 820 }}>Think of it like a factory team: the UI is the technician, AgentCore is the coordinator, Bedrock is the reasoning engine, and CockroachDB is the long-term memory + source of truth.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(130px,1fr))', gap: 10, marginTop: 22 }}>
                {nodes.map((item, index) => (
                  <button key={item.id} onClick={() => setSelected(item.id)} style={{ border: selected === item.id ? '1px solid var(--accent)' : '1px solid var(--border)', background: selected === item.id ? 'rgba(116,215,176,.09)' : 'var(--surface-2)', color: 'var(--text)', borderRadius: 16, padding: 15, textAlign: 'left', minHeight: 125 }}>
                    <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 800 }}>0{index + 1}</div>
                    <strong style={{ display: 'block', marginTop: 8, lineHeight: 1.25 }}>{item.label}</strong>
                    <span className="muted" style={{ display: 'block', marginTop: 7, fontSize: 11, lineHeight: 1.45 }}>{item.tech}</span>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '16px 0', color: 'var(--muted)', fontSize: 18 }} aria-hidden="true">→ → → →</div>
              <div style={{ border: '1px solid rgba(116,215,176,.22)', background: 'rgba(116,215,176,.045)', borderRadius: 16, padding: 18 }}>
                <div className="eyebrow">Selected component</div>
                <h3 style={{ margin: '6px 0 4px', fontSize: 19 }}>{node.label}</h3>
                <div className="muted" style={{ fontSize: 12, marginBottom: 9 }}>{node.tech}</div>
                <p style={{ margin: 0, lineHeight: 1.65, fontSize: 13 }}>{node.detail}</p>
              </div>
              <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12 }}>
                <div className="memory"><strong>Read</strong><p>Retrieve relevant successful and failed repair experiences.</p></div>
                <div className="memory"><strong>Reason</strong><p>Use current incident + retrieved evidence to propose a bounded next action.</p></div>
                <div className="memory"><strong>Write safely</strong><p>Require human approval before consequential work-order changes, then persist the outcome.</p></div>
              </div>
            </section>

            <section className="card feature-panel" style={{ marginTop: 18 }}>
              <div className="eyebrow">The memory loop</div>
              <h2 style={{ margin: '7px 0 14px', fontSize: 22 }}>Failure → memory → better next decision</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(80px,1fr))', gap: 8, alignItems: 'stretch' }}>
                {['Incident', 'Embed', 'Vector search', 'Compare', 'Recommend', 'Approve', 'Outcome → memory'].map((step, i) => (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 12, padding: '12px 8px', textAlign: 'center', background: 'var(--surface-2)', fontSize: 11, fontWeight: 750 }}>{step}</div>
                    {i < 6 && <span className="muted" aria-hidden="true">→</span>}
                  </div>
                ))}
              </div>
              <p className="muted" style={{ margin: '14px 0 0', fontSize: 12, lineHeight: 1.6 }}>That final outcome becomes evidence for the next incident. This is the product thesis—not a chatbot that forgets yesterday.</p>
            </section>
          </>
        )}

        {section === 'journey' && (
          <section className="card" style={{ padding: 20 }}>
            <div className="eyebrow">What actually happened</div>
            <h2 style={{ margin: '7px 0 8px', fontSize: 24 }}>Four days of building, breaking, isolating, and verifying.</h2>
            <p className="muted" style={{ lineHeight: 1.6 }}>These are engineering findings, not a polished success story. Environment mistakes are separated from application defects, and unverified capabilities stay labeled that way.</p>
            <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
              {bugs.map(([area, finding, resolution], index) => (
                <details key={area} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '13px 15px', background: 'rgba(14,19,26,.5)' }} open={index === 0}>
                  <summary style={{ cursor: 'pointer', fontWeight: 750 }}><span className="pill" style={{ marginRight: 9 }}>{area}</span>{finding}</summary>
                  <div style={{ marginTop: 10, padding: '11px 12px', borderRadius: 10, background: 'rgba(116,215,176,.045)', color: 'var(--muted)', fontSize: 12, lineHeight: 1.6 }}><strong style={{ color: 'var(--text)' }}>What we did:</strong> {resolution}</div>
                </details>
              ))}
            </div>
            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10 }}>
              {[
                ['Day 1', 'Foundation', 'Product contract, CockroachDB memory, embeddings, tests.'],
                ['Day 2', 'Cloud integration', 'AWS paths, Amplify, environment/runtime boundaries.'],
                ['Day 3', 'Agent + UX', 'AgentCore path, evidence review, approval boundary, persistent workflow.'],
                ['Day 4', 'Proof', 'Live retrieval, Bedrock reasoning, work order, outcome, durable memory, system explanation.'],
              ].map(([day, title, copy]) => <div key={day} className="memory" style={{ border: '1px solid var(--border)' }}><div className="eyebrow">{day}</div><strong style={{ display: 'block', marginTop: 5 }}>{title}</strong><p>{copy}</p></div>)}
            </div>
          </section>
        )}

        {section === 'faq' && (
          <section className="card" style={{ padding: 20 }}>
            <div className="eyebrow">Common questions</div>
            <h2 style={{ margin: '7px 0 8px', fontSize: 24 }}>Questions worth asking about the system.</h2>
            <div style={{ display: 'grid', gap: 8, marginTop: 18 }}>
              {faqs.map(([q, a]) => <details key={q} style={{ border: '1px solid var(--border)', borderRadius: 13, padding: '13px 15px', background: 'rgba(14,19,26,.5)' }}><summary style={{ cursor: 'pointer', fontWeight: 750 }}>{q}</summary><p className="muted" style={{ margin: '9px 0 0', lineHeight: 1.65, fontSize: 13 }}>{a}</p></details>)}
            </div>
          </section>
        )}

        <footer style={{ marginTop: 22, color: 'var(--muted)', fontSize: 11, lineHeight: 1.7 }}>
          Evidence rule: configured is not the same as verified. The repository release documents preserve that distinction. See <a href="/">the live product</a> for the working golden scenario.
        </footer>
      </div>
    </main>
  );
}
