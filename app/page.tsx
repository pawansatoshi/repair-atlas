'use client';

import { useEffect, useMemo, useState } from 'react';

type Memory = { id:string; title:string; summary?:string; copy?:string; outcome:string; rank?:number; distance?:number };

const logs = [
  ['retrieve','Retrieved relevant repair experiences scoped to PRESS-204'],
  ['compare','Compared successful and failed interventions'],
  ['reason','Recommendation favors airflow inspection before motor replacement'],
  ['policy','Write action requires technician approval'],
];

const DEFAULT_QUERY='PRESS-204 thermal rise during a long production cycle';
const EXAMPLES = [
  'PRESS-204 overheating after 6 hours of production',
  'Hydraulic pressure dropping after 4 hours',
  'Motor vibration increased during operation',
];

export default function Home(){
  const [query,setQuery]=useState(DEFAULT_QUERY);
  const [approved,setApproved]=useState(false);
  const [outcome,setOutcome]=useState(false);
  const [workOrderId,setWorkOrderId]=useState('');
  const [tab,setTab]=useState('overview');
  const [diagnosis,setDiagnosis]=useState('Inspect intake airflow and filter condition before replacing the motor.');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [memories,setMemories]=useState<Memory[]>([]);
  const [retrievalMode,setRetrievalMode]=useState<'demo'|'cockroachdb-recent'|'cockroachdb-vector'>('demo');
  const [evidenceOpen,setEvidenceOpen]=useState(false);
  const [hydrated,setHydrated]=useState(false);

  const filtered=useMemo(()=>memories,[memories]);

  useEffect(()=>{
    try{
      const savedQuery=window.localStorage.getItem('repair-atlas.query');
      if(savedQuery) setQuery(savedQuery);
    }catch(error){
      void error;
    }
    setHydrated(true);
  },[]);

  useEffect(()=>{
    if(!hydrated) return;
    try{
      window.localStorage.setItem('repair-atlas.query',query);
    }catch(error){
      void error;
    }
  },[query,hydrated]);

  useEffect(()=>{
    if(!hydrated) return;
    void runDiagnosis(true);
  },[hydrated]);

  async function runDiagnosis(silent=false){
    setBusy(true); if(!silent) setMessage(''); setEvidenceOpen(false);
    try{
      const response=await fetch('/api/diagnose',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({assetId:'PRESS-204',symptom:query}),cache:'no-store'});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||'Diagnosis unavailable');
      if(!Array.isArray(data.memories)) throw new Error('Diagnosis returned no memory set');
      setDiagnosis(data.recommendation||diagnosis);
      setMemories(data.memories);
      setRetrievalMode(data.retrievalMode||'demo');
      if(data.retrievalMode==='cockroachdb-vector') setMessage('CockroachDB vector memory retrieved.');
      else if(data.retrievalMode==='cockroachdb-recent') setMessage('CockroachDB memory retrieved without semantic ranking.');
      else setMessage('Bounded demo reasoning active.');
    }catch(error){
      setMemories([]);
      setRetrievalMode('demo');
      setMessage(`Live diagnosis unavailable: ${error instanceof Error?error.message:'unknown error'}`);
    }finally{setBusy(false);}
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

  function showMemory(){
    setTab('memory');
    document.getElementById('memory')?.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function useExample(example:string){
    setQuery(example);
    setTimeout(()=>void runDiagnosis(),0);
  }

  return <div className="app">
    <header className="topbar"><div className="brand"><div className="mark">R</div><span>RepairAtlas</span></div><div className="status"><span className="dot"/>Memory system ready <span className="pill">{retrievalMode==='cockroachdb-vector'?'CockroachDB vector':'Bounded demo'}</span></div></header>
    <div className="shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="nav-title">Operations</div>
        {['overview','work orders','memory','assets'].map(x=><button key={x} className={`nav-btn ${tab===x?'active':''}`} onClick={()=>x==='memory'?showMemory():setTab(x)} aria-current={tab===x?'page':undefined}><span aria-hidden="true">{x==='overview'?'◈':x==='work orders'?'□':x==='memory'?'◌':'◇'}</span><span>{x}</span></button>)}
        <div className="nav-title">System</div><button className={`nav-btn ${tab==='health'?'active':''}`} onClick={()=>setTab('health')}><span aria-hidden="true">●</span><span>Health</span></button>
      </aside>
      <main className="main">
        <section className="hero"><div><div className="eyebrow">Agentic field intelligence</div><h1>Every repair teaches the next one.</h1><p>RepairAtlas turns field experience into durable operational memory. The agent retrieves what worked before, explains why, and proposes the next safe action.</p></div><div className="hero-actions"><button className="btn" onClick={showMemory}>View memory</button><button className="btn primary" onClick={()=>runDiagnosis()} disabled={busy}>{busy?'Reasoning…':'Run diagnosis'}</button></div></section>
        {message&&<div role="status" aria-live="polite" className="pill" style={{marginBottom:14,padding:'9px 12px'}}>{message}</div>}
        <section className="grid">
          <div className="card">
            <div className="card-head"><div><div className="card-title">Active incident</div><div className="muted" style={{fontSize:12,marginTop:4}}>Work order {workOrderId||'WO-2048'} · {outcome?'Completed':approved?'Open':'Awaiting approval'}</div></div><span className="pill good">Human-in-the-loop</span></div>
            <div className="asset"><div className="asset-top"><div><div className="eyebrow">Asset</div><h2>PRESS-204</h2><div className="muted" style={{fontSize:13,marginTop:5}}>Hydraulic press · Site 07 · Line B</div></div><span className="pill">Overheating</span></div>
              <div className="metrics"><div className="metric"><span className="muted" style={{fontSize:11}}>Current temp</span><strong>92°C</strong></div><div className="metric"><span className="muted" style={{fontSize:11}}>Runtime</span><strong>6h 18m</strong></div><div className="metric"><span className="muted" style={{fontSize:11}}>Similar repairs found</span><strong>{filtered.length}</strong></div></div>
            </div>
            <div className="card-head"><div className="card-title">Diagnostic workflow</div><span className="pill">Agent supervised</span></div>
            <div className="timeline">{logs.map(([a,b],i)=><div className="timeline-item" key={a}><div className="rail"><div className="node"/></div><div><div className="event-title">{i+1}. {a}</div><div className="event-copy">{b}</div></div></div>)}</div>
            <div className="agent"><div className="agent-state"><span className="dot"/><div><strong style={{fontSize:13}}>{outcome?'Repair outcome recorded':'Recommendation ready'}</strong><div className="muted" style={{fontSize:12,marginTop:3}}>{diagnosis}</div></div></div>
              {!outcome&&<div className="approval"><h3>Approval required · Create diagnostic work order</h3><p>This action changes operational state. RepairAtlas keeps consequential writes behind a human approval boundary.</p><div className="actions"><button className="btn primary" onClick={approveAction} disabled={busy||approved}>{approved?'Approved':'Approve action'}</button><button className="btn" onClick={()=>setEvidenceOpen(true)} disabled={busy}>Review evidence</button></div></div>}
              {approved&&!outcome&&<div className="approval" style={{marginTop:10,borderColor:'rgba(116,215,176,.25)',background:'rgba(116,215,176,.05)'}}><h3>Diagnostic work order created</h3><p>{workOrderId?'Work order '+workOrderId+' is open. ':''}Record the technician outcome to turn this experience into durable memory.</p><div className="actions"><button className="btn primary" onClick={recordOutcome} disabled={busy}>Record successful repair</button></div></div>}
              {outcome&&<div className="approval" style={{marginTop:10,borderColor:'rgba(116,215,176,.25)',background:'rgba(116,215,176,.05)'}}><h3>Repair completed · memory persisted</h3><p>{workOrderId?'Work order '+workOrderId+' is completed. ':''}The repair event and successful outcome are now durable operational memory.</p></div>}
            </div>
          </div>
          <aside className="card" id="memory">
            <div className="card-head"><div><div className="card-title">Repair memory</div><div className="muted" style={{fontSize:12,marginTop:4}}>{retrievalMode==='cockroachdb-vector'?'Semantic + transactional retrieval':'Evidence retrieval'}</div></div><span className={`pill ${retrievalMode==='cockroachdb-vector'?'good':''}`}>{retrievalMode==='cockroachdb-vector'?'Vector search':retrievalMode==='cockroachdb-recent'?'DB recent':'Live unavailable'}</span></div>
            <div className="memory-query">
              <div className="query-title">Search repair memory</div>
              <label htmlFor="memory-search">Type the current symptom or describe the new incident</label>
              <input id="memory-search" className="search" value={query} onChange={e=>setQuery(e.target.value)} aria-describedby="search-help" placeholder="Example: PRESS-204 thermal rise during a long production cycle" />
              <div id="search-help" className="query-help">Edit this field, then tap <strong>Run diagnosis</strong> to retrieve semantically similar repairs.</div>
            </div>
            <div className="memory-list">{filtered.length?filtered.map(m=><div className="memory" key={m.id}><strong>{m.title}</strong><p>{m.summary||m.copy}</p><div className="score">{m.outcome==='resolved'?'✓ Successful outcome':'× Failed intervention'}{m.rank?` · Rank ${m.rank}`:''}{typeof m.distance==='number'?` · Semantic similarity ${m.distance.toFixed(3)}`:''}</div></div>):<div className="empty">Live memory unavailable. Run diagnosis again after connectivity is restored.</div>}</div>
            <div className="footer-note">CockroachDB stores the operational record and vector memory together. No second vector database is required.</div>
          </aside>
        </section>

        <section className="card feature-panel" aria-labelledby="how-it-works">
          <div className="eyebrow">Start here</div>
          <div className="card-title" id="how-it-works" style={{fontSize:20,marginTop:6}}>How to use RepairAtlas</div>
          <p className="muted" style={{fontSize:13,lineHeight:1.6,maxWidth:760,margin:'8px 0 0'}}>You do not need to know AI or databases. Describe the field problem in normal language, review the evidence, and let the technician decide the consequential action.</p>
          <div className="feature-grid">
            <div><strong>1 · Describe</strong><p className="muted">Enter the asset and symptom, for example “PRESS-204 overheating after 6 hours.”</p></div>
            <div><strong>2 · Retrieve & reason</strong><p className="muted">Run diagnosis. RepairAtlas finds similar successful and failed repairs and explains the recommendation.</p></div>
            <div><strong>3 · Approve & learn</strong><p className="muted">Review evidence, approve the work order, then record the outcome so the next repair can benefit.</p></div>
          </div>
          <div style={{marginTop:16}}>
            <div className="muted" style={{fontSize:11,fontWeight:750,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Try an example</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {EXAMPLES.map(example=><button key={example} className="pill" style={{cursor:'pointer',background:'var(--surface-2)',color:'var(--text)',padding:'9px 11px'}} onClick={()=>useExample(example)}>{example}</button>)}
            </div>
          </div>
        </section>

        <section className="card feature-panel" aria-labelledby="factory-value">
          <div className="eyebrow">For factory operations</div>
          <div className="card-title" id="factory-value" style={{fontSize:20,marginTop:6}}>Turn repair experience into operational leverage.</div>
          <div className="feature-grid">
            <div><strong>Preserve expertise</strong><p className="muted">A technician’s successful fix becomes searchable knowledge instead of disappearing with the shift.</p></div>
            <div><strong>Reduce repeat mistakes</strong><p className="muted">Failed interventions remain visible as negative evidence, helping teams avoid repeating expensive dead ends.</p></div>
            <div><strong>Control risk</strong><p className="muted">The agent can recommend and explain, but consequential operational changes stay behind explicit human approval.</p></div>
          </div>
          <div style={{marginTop:14,padding:'13px 14px',borderRadius:14,border:'1px solid rgba(116,215,176,.18)',background:'rgba(116,215,176,.045)',fontSize:13,lineHeight:1.6}}><strong>Business outcome:</strong> faster diagnosis, less unnecessary replacement, and institutional memory that improves with every completed repair.</div>
        </section>

        <section className="card feature-panel" aria-labelledby="faq">
          <div className="eyebrow">Quick answers</div>
          <div className="card-title" id="faq" style={{fontSize:20,marginTop:6}}>RepairAtlas FAQ</div>
          <div style={{display:'grid',gap:8,marginTop:14}}>
            <details style={{border:'1px solid var(--border)',borderRadius:12,padding:'12px 14px',background:'rgba(14,19,26,.5)'}}><summary style={{cursor:'pointer',fontWeight:700}}>What is RepairAtlas?</summary><p className="muted" style={{fontSize:12,lineHeight:1.6,margin:'9px 0 0'}}>An agentic maintenance assistant that retrieves previous repair experiences, compares outcomes, reasons over the evidence, and proposes the next safe diagnostic action.</p></details>
            <details style={{border:'1px solid var(--border)',borderRadius:12,padding:'12px 14px',background:'rgba(14,19,26,.5)'}}><summary style={{cursor:'pointer',fontWeight:700}}>What should I type?</summary><p className="muted" style={{fontSize:12,lineHeight:1.6,margin:'9px 0 0'}}>Describe the asset and symptom in normal language. Include useful context such as when the problem appears, how long the machine has been running, or what changed recently.</p></details>
            <details style={{border:'1px solid var(--border)',borderRadius:12,padding:'12px 14px',background:'rgba(14,19,26,.5)'}}><summary style={{cursor:'pointer',fontWeight:700}}>How does it learn from repairs?</summary><p className="muted" style={{fontSize:12,lineHeight:1.6,margin:'9px 0 0'}}>A completed repair and its outcome are persisted as operational memory. Future incidents can retrieve that experience semantically, so the system gets more useful as the repair history grows.</p></details>
            <details style={{border:'1px solid var(--border)',borderRadius:12,padding:'12px 14px',background:'rgba(14,19,26,.5)'}}><summary style={{cursor:'pointer',fontWeight:700}}>Can the AI directly control factory equipment?</summary><p className="muted" style={{fontSize:12,lineHeight:1.6,margin:'9px 0 0'}}>Not in this workflow. Diagnosis and retrieval can be automated, while consequential operational writes remain behind an explicit human approval boundary.</p></details>
            <details style={{border:'1px solid var(--border)',borderRadius:12,padding:'12px 14px',background:'rgba(14,19,26,.5)'}}><summary style={{cursor:'pointer',fontWeight:700}}>Why keep failed repairs?</summary><p className="muted" style={{fontSize:12,lineHeight:1.6,margin:'9px 0 0'}}>A failed intervention is valuable evidence. RepairAtlas treats it as a reason not to repeat an ineffective path, rather than as an instruction.</p></details>
            <details style={{border:'1px solid var(--border)',borderRadius:12,padding:'12px 14px',background:'rgba(14,19,26,.5)'}}><summary style={{cursor:'pointer',fontWeight:700}}>Why CockroachDB?</summary><p className="muted" style={{fontSize:12,lineHeight:1.6,margin:'9px 0 0'}}>RepairAtlas keeps transactional repair state and vector-based memory in the same system of record. That makes the operational event and its semantic history easier to keep consistent.</p></details>
          </div>
        </section>

        <section className="card feature-panel"><div className="eyebrow">Why this is different</div><div className="feature-grid"><div><strong>Remember outcomes</strong><p className="muted">The agent learns from successful and failed interventions, not just conversation history.</p></div><div><strong>Act safely</strong><p className="muted">Reads can be automated; consequential writes stay behind explicit approval.</p></div><div><strong>Keep memory close to truth</strong><p className="muted">Transactional state and semantic experiences live in the same CockroachDB system of record.</p></div></div></section>
      </main>
    </div>
    <nav className="mobile-nav" aria-label="Mobile navigation">{['overview','work orders','memory','assets'].map(x=><button key={x} className={tab===x?'active':''} onClick={()=>x==='memory'?showMemory():setTab(x)} aria-current={tab===x?'page':undefined}>{x}</button>)}</nav>
    {evidenceOpen&&<div role="dialog" aria-modal="true" aria-label="Diagnostic evidence" style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(3,8,12,.78)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setEvidenceOpen(false)}>
      <div className="card" style={{width:'min(760px,100%)',maxHeight:'85vh',overflow:'auto',boxShadow:'0 24px 80px rgba(0,0,0,.45)'}} onClick={e=>e.stopPropagation()}>
        <div className="card-head"><div><div className="eyebrow">Evidence review</div><div className="card-title" style={{fontSize:20,marginTop:5}}>Why RepairAtlas recommends this action</div></div><button className="btn" onClick={()=>setEvidenceOpen(false)}>Close</button></div>
        <div style={{display:'grid',gap:12,marginTop:16}}>
          <div className="memory" style={{borderColor:'rgba(116,215,176,.25)'}}><strong>1 · Retrieved evidence</strong><p>Vector-ranked memories from CockroachDB, scoped to PRESS-204.</p><div style={{display:'grid',gap:8,marginTop:10}}>{memories.slice(0,3).map((memory,index)=><div key={memory.id} style={{padding:'9px 10px',borderRadius:10,background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)'}}><strong style={{fontSize:12}}>{index+1}. {memory.title}</strong><div className="muted" style={{fontSize:11,marginTop:3}}>{memory.outcome==='resolved'?'Successful intervention':'Failed intervention'}{typeof memory.distance==='number'?` · Semantic similarity ${memory.distance.toFixed(3)}`:''}</div></div>)}</div></div>
          <div className="memory"><strong>2 · Compared outcomes</strong><p>Successful airflow/filter interventions are preferred over the prior failed fan replacement. Failed interventions are treated as negative evidence, not instructions to repeat the same action.</p><div className="score">Success + failure evidence considered</div></div>
          <div className="memory"><strong>3 · Agent reasoning</strong><p>{diagnosis}</p><div className="score">Bedrock reasoning + retrieved operational memory</div></div>
          <div className="memory"><strong>4 · Safety policy</strong><p>No consequential write is executed automatically. Creating the diagnostic work order requires explicit human approval.</p><div className="score">Human-in-the-loop boundary enforced</div></div>
        </div>
        <div className="footer-note" style={{marginTop:16}}>This evidence view is read-only. Closing it returns you to the approval boundary.</div>
      </div>
    </div>}
  </div>
}
