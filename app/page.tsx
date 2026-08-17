'use client';

import { useMemo, useState } from 'react';

type Memory = { id:string; title:string; summary?:string; copy?:string; outcome:string; rank?:number; distance?:number };

const demoMemories: Memory[] = [
  {id:'mem-01',title:'Airflow restriction after extended runtime',summary:'Similar PRESS-204 incident. Intake obstruction was cleared and filter replaced; motor replacement was unnecessary.',outcome:'resolved',rank:1},
  {id:'mem-02',title:'Fan replacement did not resolve overheating',summary:'A prior attempt replaced the fan assembly without resolving the thermal symptom.',outcome:'failed',rank:2},
  {id:'mem-03',title:'Dust-loaded intake filter',summary:'Cleaning the intake path and replacing a saturated filter restored stable operating temperature.',outcome:'resolved',rank:3},
];

const logs = [
  ['retrieve','Retrieved relevant repair experiences scoped to PRESS-204'],
  ['compare','Compared successful and failed interventions'],
  ['reason','Recommendation favors airflow inspection before motor replacement'],
  ['policy','Write action requires technician approval'],
];

export default function Home(){
  const [query,setQuery]=useState('PRESS-204 overheating after extended operation');
  const [approved,setApproved]=useState(false);
  const [outcome,setOutcome]=useState(false);
  const [workOrderId,setWorkOrderId]=useState('');
  const [tab,setTab]=useState('overview');
  const [diagnosis,setDiagnosis]=useState('Inspect intake airflow and filter condition before replacing the motor.');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [memories,setMemories]=useState<Memory[]>(demoMemories);
  const [retrievalMode,setRetrievalMode]=useState<'demo'|'cockroachdb-recent'|'cockroachdb-vector'>('demo');
  const [evidenceOpen,setEvidenceOpen]=useState(false);

  const filtered=useMemo(()=>memories.filter(m=>`${m.title} ${m.summary||m.copy||''}`.toLowerCase().includes(query.toLowerCase().split(' ')[0]||'x')||query.toLowerCase().includes('press-204')),[query,memories]);

  async function runDiagnosis(){
    setBusy(true); setMessage(''); setApproved(false); setOutcome(false); setWorkOrderId(''); setEvidenceOpen(false);
    try{
      const response=await fetch('/api/diagnose',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({assetId:'PRESS-204',symptom:query})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||'Diagnosis unavailable');
      setDiagnosis(data.recommendation||diagnosis);
      setMemories(Array.isArray(data.memories)?data.memories:[]);
      setRetrievalMode(data.retrievalMode||'demo');
      setMessage(data.mode==='bedrock' ? 'Bedrock reasoning completed.' : data.retrievalMode==='cockroachdb-vector' ? 'CockroachDB vector memory retrieved.' : data.retrievalMode==='cockroachdb-recent' ? 'CockroachDB memory retrieved without semantic ranking.' : 'Bounded demo reasoning active.');
    }catch(error){setMessage(error instanceof Error?error.message:'Diagnosis unavailable');}
    finally{setBusy(false);}
  }

  async function approveAction(){
    setBusy(true); setMessage('');
    try{
      const response=await fetch('/api/work-orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({approved:true,assetId:'PRESS-204'})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||'Unable to create work order');
      setApproved(true); setWorkOrderId(String(data.id||'')); setMessage(`${data.mode==='cockroachdb'?'CockroachDB':'Demo'} work order ${data.id} staged${data.reused?' (existing open order reused)':''}.`);
    }catch(error){setMessage(error instanceof Error?error.message:'Unable to create work order');}
    finally{setBusy(false);}
  }

  async function recordOutcome(){
    setBusy(true); setMessage('');
    try{
      const response=await fetch('/api/outcomes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({assetId:'PRESS-204',outcome:'resolved',summary:'Intake obstruction confirmed. Airflow path cleared and filter replaced; overheating resolved without motor replacement.'})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||'Unable to persist outcome');
      setOutcome(true); setMessage(`${data.mode==='cockroachdb'?'CockroachDB':'Demo'} repair memory persisted${data.eventId?' and linked to the repair event':''}. Work order completed.`);
    }catch(error){setMessage(error instanceof Error?error.message:'Unable to persist repair outcome');}
    finally{setBusy(false);}
  }

  return <div className="app">
    <header className="topbar"><div className="brand"><div className="mark">R</div><span>RepairAtlas</span></div><div className="status"><span className="dot"/>Memory system ready <span className="pill">{retrievalMode==='cockroachdb-vector'?'CockroachDB vector':'Bounded demo'}</span></div></header>
    <div className="shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="nav-title">Operations</div>
        {['overview','work orders','memory','assets'].map(x=><button key={x} className={`nav-btn ${tab===x?'active':''}`} onClick={()=>setTab(x)} aria-current={tab===x?'page':undefined}><span aria-hidden="true">{x==='overview'?'◈':x==='work orders'?'□':x==='memory'?'◌':'◇'}</span><span>{x}</span></button>)}
        <div className="nav-title">System</div><button className={`nav-btn ${tab==='health'?'active':''}`} onClick={()=>setTab('health')}><span aria-hidden="true">●</span><span>Health</span></button>
      </aside>
      <main className="main">
        <section className="hero"><div><div className="eyebrow">Agentic field intelligence</div><h1>Every repair teaches the next one.</h1><p>RepairAtlas turns field experience into durable operational memory. The agent retrieves what worked before, explains why, and proposes the next safe action.</p></div><div className="hero-actions"><button className="btn" onClick={()=>document.getElementById('memory')?.scrollIntoView({behavior:'smooth'})}>View memory</button><button className="btn primary" onClick={runDiagnosis} disabled={busy}>{busy?'Reasoning…':'Run diagnosis'}</button></div></section>
        {message&&<div role="status" aria-live="polite" className="pill" style={{marginBottom:14,padding:'9px 12px'}}>{message}</div>}
        <section className="grid">
          <div className="card">
            <div className="card-head"><div><div className="card-title">Active incident</div><div className="muted" style={{fontSize:12,marginTop:4}}>Work order {workOrderId||'WO-2048'} · {outcome?'Completed':approved?'Open':'Awaiting approval'}</div></div><span className="pill good">Human-in-the-loop</span></div>
            <div className="asset"><div className="asset-top"><div><div className="eyebrow">Asset</div><h2>PRESS-204</h2><div className="muted" style={{fontSize:13,marginTop:5}}>Hydraulic press · Site 07 · Line B</div></div><span className="pill">Overheating</span></div>
              <div className="metrics"><div className="metric"><span className="muted" style={{fontSize:11}}>Current temp</span><strong>92°C</strong></div><div className="metric"><span className="muted" style={{fontSize:11}}>Runtime</span><strong>6h 18m</strong></div><div className="metric"><span className="muted" style={{fontSize:11}}>Memory hits</span><strong>{filtered.length}</strong></div></div>
            </div>
            <div className="card-head"><div className="card-title">Diagnostic workflow</div><span className="pill">Agent supervised</span></div>
            <div className="timeline">{logs.map(([a,b],i)=><div className="timeline-item" key={a}><div className="rail"><div className="node"/></div><div><div className="event-title">{i+1}. {a}</div><div className="event-copy">{b}</div></div></div>)}</div>
            <div className="agent"><div className="agent-state"><span className="dot"/><div><strong style={{fontSize:13}}>{outcome?'Repair outcome recorded':'Recommendation ready'}</strong><div className="muted" style={{fontSize:12,marginTop:3}}>{diagnosis}</div></div></div>
              {!outcome&&<div className="approval"><h3>Approval required · Create diagnostic work order</h3><p>This action changes operational state. RepairAtlas keeps consequential writes behind a human approval boundary.</p><div className="actions"><button className="btn primary" onClick={approveAction} disabled={busy||approved}>{approved?'Approved':'Approve action'}</button><button className="btn" onClick={()=>setEvidenceOpen(true)} disabled={busy}>Review evidence</button></div></div>}
              {approved&&!outcome&&<div className="approval" style={{marginTop:10,borderColor:'rgba(116,215,176,.25)',background:'rgba(116,215,176,.05)'}}><h3>Diagnostic work order created</h3><p>{workOrderId?'Work order '+workOrderId+' is open. ':''}Record the technician outcome to turn this experience into durable memory.</p><div className="actions"><button className="btn primary" onClick={recordOutcome} disabled={busy}>{'Record successful repair'}</button></div></div>}
              {outcome&&<div className="approval" style={{marginTop:10,borderColor:'rgba(116,215,176,.25)',background:'rgba(116,215,176,.05)'}}><h3>Repair completed · memory persisted</h3><p>{workOrderId?'Work order '+workOrderId+' is completed. ':''}The repair event and successful outcome are now durable operational memory.</p></div>}
            </div>
          </div>
          <aside className="card" id="memory">
            <div className="card-head"><div><div className="card-title">Repair memory</div><div className="muted" style={{fontSize:12,marginTop:4}}>{retrievalMode==='cockroachdb-vector'?'Semantic + transactional retrieval':'Evidence retrieval'}</div></div><span className={`pill ${retrievalMode==='cockroachdb-vector'?'good':''}`}>{retrievalMode==='cockroachdb-vector'?'Vector search':retrievalMode==='cockroachdb-recent'?'DB recent':'Demo memory'}</span></div>
            <div className="memory-query">
              <div className="query-title">Search repair memory</div>
              <label htmlFor="memory-search">Type the current symptom or describe the new incident</label>
              <input id="memory-search" className="search" value={query} onChange={e=>setQuery(e.target.value)} aria-describedby="search-help" placeholder="Example: PRESS-204 thermal rise during a long production cycle" />
              <div id="search-help" className="query-help">Edit this field, then tap <strong>Run diagnosis</strong> to retrieve semantically similar repairs.</div>
            </div>
            <div className="memory-list">{filtered.length?filtered.map(m=><div className="memory" key={m.id}><strong>{m.title}</strong><p>{m.summary||m.copy}</p><div className="score">{m.outcome==='resolved'?'✓ Successful outcome':'× Failed intervention'}{m.rank?` · Rank ${m.rank}`:''}{typeof m.distance==='number'?` · Cosine distance ${m.distance.toFixed(3)}`:''}</div></div>):<div className="empty">No matching memories. Try a broader symptom.</div>}</div>
            <div className="footer-note">CockroachDB stores the operational record and vector memory together. No second vector database is required.</div>
          </aside>
        </section>
        <section className="card feature-panel"><div className="eyebrow">Why this is different</div><div className="feature-grid"><div><strong>Remember outcomes</strong><p className="muted">The agent learns from successful and failed interventions, not just conversation history.</p></div><div><strong>Act safely</strong><p className="muted">Reads can be automated; consequential writes stay behind explicit approval.</p></div><div><strong>Keep memory close to truth</strong><p className="muted">Transactional state and semantic experiences live in the same CockroachDB system of record.</p></div></div></section>
      </main>
    </div>
    <nav className="mobile-nav" aria-label="Mobile navigation">{['overview','work orders','memory','assets'].map(x=><button key={x} className={tab===x?'active':''} onClick={()=>setTab(x)} aria-current={tab===x?'page':undefined}>{x}</button>)}</nav>
    {evidenceOpen&&<div role="dialog" aria-modal="true" aria-label="Diagnostic evidence" style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(3,8,12,.78)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setEvidenceOpen(false)}>
      <div className="card" style={{width:'min(760px,100%)',maxHeight:'85vh',overflow:'auto',boxShadow:'0 24px 80px rgba(0,0,0,.45)'}} onClick={e=>e.stopPropagation()}>
        <div className="card-head"><div><div className="eyebrow">Evidence review</div><div className="card-title" style={{fontSize:20,marginTop:5}}>Why RepairAtlas recommends this action</div></div><button className="btn" onClick={()=>setEvidenceOpen(false)}>Close</button></div>
        <div style={{display:'grid',gap:12,marginTop:16}}>
          <div className="memory" style={{borderColor:'rgba(116,215,176,.25)'}}><strong>1 · Retrieved evidence</strong><p>Vector-ranked memories from CockroachDB, scoped to PRESS-204.</p><div style={{display:'grid',gap:8,marginTop:10}}>{memories.slice(0,3).map((memory,index)=><div key={memory.id} style={{padding:'9px 10px',borderRadius:10,background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)'}}><strong style={{fontSize:12}}>{index+1}. {memory.title}</strong><div className="muted" style={{fontSize:11,marginTop:3}}>{memory.outcome==='resolved'?'Successful intervention':'Failed intervention'}{typeof memory.distance==='number'?` · Cosine distance ${memory.distance.toFixed(3)}`:''}</div></div>)}</div></div>
          <div className="memory"><strong>2 · Compared outcomes</strong><p>Successful airflow/filter interventions are preferred over the prior failed fan replacement. Failed interventions are treated as negative evidence, not instructions to repeat the same action.</p><div className="score">Success + failure evidence considered</div></div>
          <div className="memory"><strong>3 · Agent reasoning</strong><p>{diagnosis}</p><div className="score">Bedrock reasoning + retrieved operational memory</div></div>
          <div className="memory"><strong>4 · Safety policy</strong><p>No consequential write is executed automatically. Creating the diagnostic work order requires explicit human approval.</p><div className="score">Human-in-the-loop boundary enforced</div></div>
        </div>
        <div className="footer-note" style={{marginTop:16}}>This evidence view is read-only. Closing it returns you to the approval boundary.</div>
      </div>
    </div>}
  </div>
}
