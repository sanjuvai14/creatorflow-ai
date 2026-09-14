"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";

const faqs=[
  ["Generation failed", "Check your available credits and AI service status. If a live provider is unavailable, no credit should be charged."],
  ["Login or signup problem", "Make sure your email is correct and try again after a short wait. Email delivery can be rate-limited during testing."],
  ["My result is missing", "Use History or Saved to check your previous work. If a generation returned no usable output, CreatorFlow should refund the reserved credit automatically."],
  ["Platform connection problem", "Open Platform Hub or Settings → Platform Connections and reconnect the affected platform when its authorization has expired."],
];
export default function Support(){
 const router=useRouter(); const [topic,setTopic]=useState(""); const [details,setDetails]=useState(""); const [sent,setSent]=useState(false);
 function submit(e:React.FormEvent){e.preventDefault(); if(!topic.trim()||!details.trim())return; setSent(true);}
 return <main style={{maxWidth:980,margin:"0 auto",padding:"24px 16px 60px"}}>
  <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap",marginBottom:24}}><div><div style={{fontWeight:900,fontSize:22}}>Creator<span style={{color:"#8b7cff"}}>Flow</span> AI</div><div className="cf-muted" style={{marginTop:6}}>Help whenever you need it</div></div><button className="cf-btn" onClick={()=>router.push("/dashboard")}>← Dashboard</button></header>
  <section className="cf-card cf-glow" style={{padding:24,marginBottom:16}}><div className="cf-eyebrow">24/7 SUPPORT CENTER</div><h1 style={{fontSize:"clamp(30px,6vw,46px)",margin:"8px 0"}}>We’re here when something goes wrong.</h1><p className="cf-muted" style={{maxWidth:720}}>Tell us what happened. This support center is available around the clock so users can report account, generation, credit, or platform problems.</p><div style={{display:"flex",gap:9,flexWrap:"wrap",marginTop:18}}><span className="cf-live">● Support Center Online</span><span className="cf-icon-btn">Account • AI • Credits • Platforms</span></div></section>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
   <section className="cf-card" style={{padding:22}}><h2>Contact support</h2><p className="cf-muted">Describe the issue clearly. Never send your password, OTP, API key, or other secret information.</p>{sent?<div role="status" style={{padding:16,borderRadius:12,border:"1px solid rgba(120,220,160,.35)",marginTop:14}}><b>Support request recorded.</b><p className="cf-muted" style={{marginBottom:0}}>Your report is ready for the support workflow. If a human support channel is connected later, it can use this information to follow up.</p><button className="cf-btn" style={{marginTop:12}} onClick={()=>{setSent(false);setTopic("");setDetails("")}}>Send another</button></div>:<form onSubmit={submit} style={{display:"grid",gap:10,marginTop:14}}><label className="cf-muted">Issue type<select className="cf-input" value={topic} onChange={e=>setTopic(e.target.value)} required><option value="">Select an issue</option><option>Login / signup</option><option>AI generation</option><option>Credits</option><option>Image / thumbnail</option><option>Platform connection</option><option>Billing</option><option>Other</option></select></label><label className="cf-muted">What happened?<textarea className="cf-input" style={{minHeight:150,marginTop:6}} value={details} onChange={e=>setDetails(e.target.value)} placeholder="Explain the problem and what you expected to happen…" required/></label><button className="cf-btn cf-generate" type="submit">Submit support request</button></form>}</section>
   <section className="cf-card" style={{padding:22}}><h2>Quick help</h2><div style={{display:"grid",gap:10,marginTop:14}}>{faqs.map(([q,a])=><details key={q} style={{padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}><summary style={{cursor:"pointer",fontWeight:700}}>{q}</summary><p className="cf-muted" style={{lineHeight:1.6}}>{a}</p></details>)}</div></section>
  </div>
  <section className="cf-card" style={{padding:18,marginTop:16}}><b>Security reminder</b><span className="cf-muted"> Support will never need your password, one-time code, or secret API key.</span></section>
 </main>;
}
