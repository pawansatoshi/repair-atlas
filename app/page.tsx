'use client';

import { useMemo, useState } from 'react';

type Memory = { id:string; title:string; copy:string; outcome:string; score:number };

const memories: Memory[] = [
  {id:'mem-01',title:'Airflow restriction after extended runtime',copy:'Similar PRESS-204 incident. Intake obstruction was cleared and filter replaced; motor replacement was unnecessary.',outcome:'resolved',score:96},
  {id:'mem-02',title:'Fan replacement did not resolve overheating',copy:'A prior attempt replaced the fan assembly without resolving the thermal symptom.',outcome:'failed',score:88},
  {id:'mem-03',title:'Dust-loaded intake filter',copy:'Cleaning the intake path and replacing a saturated filter restored stable operating temperature.',outcome:'resolved',score:81},
];

const logs = [
  ['retrieve','Retrieved 3 repair experiences scoped to PRESS-204'],
  ['compare','Compared successful and failed interventions'],
  ['reason','Recommendation favors airflow inspection before motor replacement'],
  ['policy','Write action requires technician approval'],
];

export default function Home(){
  const [query,setQuery]=useState('PRESS-204 overheating after extended operation');
  const [approved,setApproved]=useState(false);
  const [outcome,setOutcome]=useState(false);
  const [tab,setTab]=useState('overview');
  const filtered=useMemo(()=>memories.filter(m=>`${m.title} ${m.copy}`.toLowerCase().includes(query.toLowerCase().split(' ')[0]||'x')||query.includes('PRESS-204')),[query]);
  const runDiagnosis=()=>{setApproved(false);setOutcome(false)};
  return <div className="app">
    <header className="topbar"><div className="brand"><div className="mark">R</div><span>RepairAtlas</span></div><div className="status"><span className="dot"/>Memory system ready <span className="pill">CockroachDB</span></div></header>
    <div className="shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="nav-title">Operations</div>
        {['overview','work orders','memory','assets'].map(x=><button key={x} className={`nav-btn ${tab===x?'active':''}`} onClick={()=>setTab(x)} aria-current={tab===x?'page':undefined}><span aria-hidden="true">{x==='overview'?'◈':x==='work orders'?'□':x==='memory'?'◌':'◇'}</span><span>{x}</span></button>)}
        <div className="nav-title">System</div><button className="nav-btn" onClick={()=>alert('System health: application ready. Live integrations are enabled when production credentials are configured.')}><span aria-hidden="true">●</span><span>Health</span></button>
      </aside>
      <main className="main">
        <section className="hero"><div><div className="eyebrow">Agentic field intelligence</div><h1>Every repair teaches the next one.</h1><p>RepairAtlas turns field experience into durable operational memory. The agent retrieves what worked before, explains why, and proposes the next safe action.</p></div><div className="hero-actions"><button className="btn" onClick={()=>document.getElementById('memory')?.scrollIntoView({behavior:'smooth'})}>View memory</button><button className="btn primary" onClick={runDiagnosis}>Run diagnosis</button></div></section>
        <section className="grid">
          <div className="card">
            <div className="card-head"><div><div className="card-title">Active incident</div><div className="muted" style={{fontSize:12,marginTop:4}}>Work order WO-2048 · Open</div></div><span className="pill good">Live workflow</span></div>
            <div className="asset"><div className="asset-top"><div><div className="eyebrow">Asset</div><h2>PRESS-204</h2><div className="muted" style={{fontSize:13,marginTop:5}}>Hydraulic press · Site 07 · Line B</div></div><span className="pill">Overheating</span></div>
              <div className="metrics"><div className="metric"><span className="muted" style={{fontSize:11}}>Current temp</span><strong>92°C</strong></div><div className="metric"><span className="muted" style={{fontSize:11}}>Runtime</span><strong>6h 18m</strong></div><div className="metric"><span className="muted" style={{fontSize:11}}>Memory hits</span><strong>3</strong></div></div>
            </div>
            <div className="card-head"><div className="card-title">Diagnostic workflow</div><span className="pill">Agent supervised</span></div>
            <div className="timeline">
              {logs.map(([a,b],i)=><div className="timeline-item" key={a}><div className="rail"><div className="node"/></div><div><div className="event-title">{i+1}. {a}</div><div className="event-copy">{b}</div></div></div>)}
            </div>
            <div className="agent"><div className="agent-state"><span className="dot"/><div><strong style={{fontSize:13}}>Recommendation ready</strong><div className="muted" style={{fontSize:12,marginTop:3}}>Inspect intake airflow and filter condition before replacing the motor.</div></div></div>
              <div className="approval"><h3>Approval required · Create diagnostic work order</h3><p>This action changes operational state. RepairAtlas keeps consequential writes behind a human approval boundary.</p><div className="actions"><button className="btn primary" onClick={()=>setApproved(true)} disabled={approved}>{approved?'Approved':'Approve action'}</button><button className="btn" onClick={()=>setApproved(false)}>Review</button></div></div>
              {approved&&<div className="approval" style={{marginTop:10,borderColor:'rgba(116,215,176,.25)',background:'rgba(116,215,176,.05)'}}><h3>Diagnostic work order created</h3><p>WO-2049 is staged. Record the technician outcome to turn this experience into durable memory.</p><div className="actions"><button className="btn primary" onClick={()=>setOutcome(true)}>{outcome?'Outcome recorded':'Record successful repair'}</button></div></div>}
            </div>
          </div>
          <aside className="card" id="memory">
            <div className="card-head"><div><div className="card-title">Repair memory</div><div className="muted" style={{fontSize:12,marginTop:4}}>Semantic + transactional retrieval</div></div><span className="pill good">Vector index</span></div>
            <div style={{padding:14}}><label htmlFor="memory-search" className="muted" style={{fontSize:11}}>Describe the current symptom</label><input id="memory-search" className="search" value={query} onChange={e=>setQuery(e.target.value)} aria-describedby="search-help"/><div id="search-help" className="muted" style={{fontSize:11}}>Retrieval is scoped to asset context before similarity ranking.</div></div>
            <div className="memory-list">{filtered.length?filtered.map(m=><div className="memory" key={m.id}><strong>{m.title}</strong><p>{m.copy}</p><div className="score">{m.outcome==='resolved'?'✓ Successful outcome':'× Failed intervention'} · {m.score}% relevance</div></div>):<div className="empty">No matching memories. Try a broader symptom.</div>}</div>
            <div className="footer-note">CockroachDB stores the operational record and vector memory together. No second vector database is required.</div>
          </aside>
        </section>
        <section className="card" style={{marginTop:18,padding:18}}><div className="eyebrow">Why this is different</div><div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:14,marginTop:12}}><div><strong>Remember outcomes</strong><p className="muted" style={{fontSize:12,lineHeight:1.55}}>The agent learns from successful and failed interventions, not just conversation history.</p></div><div><strong>Act safely</strong><p className="muted" style={{fontSize:12,lineHeight:1.55}}>Reads can be automated; consequential writes stay behind explicit approval.</p></div><div><strong>Keep memory close to truth</strong><p className="muted" style={{fontSize:12,lineHeight:1.55}}>Transactional state and semantic experiences live in the same CockroachDB system of record.</p></div></div></section>
      </main>
    </div>
    <nav className="mobile-nav" aria-label="Mobile navigation">{['overview','work orders','memory','assets'].map(x=><button key={x} className={tab===x?'active':''} onClick={()=>setTab(x)}>{x}</button>)}</nav>
  </div>
}