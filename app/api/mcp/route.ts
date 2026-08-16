import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.COCKROACH_MCP_URL || 'https://cockroachlabs.cloud/mcp';
  const token = process.env.COCKROACH_MCP_API_KEY;
  if (!token) return NextResponse.json({configured:false, url, message:'Managed MCP credentials are not configured.'});
  try {
    const response = await fetch(url, {method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','Accept':'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list',params:{}}),cache:'no-store',signal:AbortSignal.timeout(8000)});
    if (!response.ok) return NextResponse.json({configured:true, reachable:false, status:response.status},{status:502});
    const data = await response.json().catch(()=>null);
    return NextResponse.json({configured:true,reachable:true,toolCount:Array.isArray(data?.result?.tools)?data.result.tools.length:null});
  } catch (error) {
    console.error('managed MCP connectivity check failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({configured:true,reachable:false},{status:503});
  }
}