"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VisualCreator from "@/components/VisualCreator";

const tools = [
  {id:"youtube", icon:"▶", name:"YouTube Content", desc:"Titles, descriptions, tags & scripts"},
  {id:"shorts", icon:"⚡", name:"Shorts & Reels", desc:"Hooks and short-form scripts"},
  {id:"social", icon:"✦", name:"Social Posts", desc:"Facebook, Instagram & TikTok"},
  {id:"product", icon:"◇", name:"Product Copy", desc:"SEO-ready product descriptions"},
  {id:"visual", icon:"◈", name:"Visual Creator", desc:"Thumbnails, banners & social art"},
];
const languages = ["English","বাংলা","Hindi","Spanish","Portuguese","French","German","Arabic","Indonesian","Turkish"];

export default function Dashboard() {
  const [tool,setTool] = useState(tools[0].id);
  const [language,setLanguage] = useState("English");
  const [topic,setTopic] = useState("");
  const [tone,setTone] = useState("Engaging");
  const [result,setResult] = useState("");
  const [loading,setLoading] = useState(false);
  const [action,setAction] = useState("");
  const router = useRouter();
  const [credits,setCredits] = useState<number | null>(null);
  async function loadCredits(){ try { const r=await fetch("/api/profile"); const d=await r.json(); if(typeof d.credits === "number") setCredits(d.credits); } catch {} }
  useEffect(() => { loadCredits(); }, []);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true); setResult(""); setAction("");
    try {
      const r = await fetch("/api/generate", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({tool,language,topic,tone})});
      const data = await r.json();
      setResult(data.output || data.error || "Something went wrong.");
      if (typeof data.credits === "number") setCredits(data.credits);
    } catch { setResult("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }
  async function copyResult(){ if(!result)return; try{await navigator.clipboard?.writeText(result);setAction("Copied");setTimeout(()=>setAction(""),1600)}catch{setAction("Copy failed")} }
  async function saveResult(){
    if(!result)return; setAction("Saving...");
    try{const r=await fetch("/api/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:topic.slice(0,60),type:tool,content:result})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Save failed");setAction("Saved");setTimeout(()=>setAction(""),1600)}
    catch(e){setAction(e instanceof Error?e.message:"Save failed");setTimeout(()=>setAction(""),2200)}
  }

  return <main className="cf-dashboard" style={{maxWidth:1380,margin:"0 auto",padding:"18px 20px 40px"}}>
    <header className="cf-topbar">
      <button className="cf-brand" onClick={()=>router.push("/")}><span>Creator</span><strong>Flow</strong><em>AI</em></button>
      <div className="cf-top-actions">
        <div className="cf-credit"><span>Credits</span><b>{credits ?? "—"}</b></div>
        <button className="cf-icon-btn" onClick={()=>router.push("/history")}>History</button>
        <button className="cf-icon-btn" onClick={()=>router.push("/")}>Home</button>
      </div>
    </header>

    <section className="cf-welcome cf-glow">
      <div>
        <div className="cf-eyebrow">CREATOR WORKSPACE</div>
        <h1>Create faster. Publish smarter.</h1>
        <p>Turn one idea into ready-to-use content, copy and visuals with CreatorFlow AI.</p>
      </div>
      <div className="cf-stat"><span>Available credits</span><strong>{credits ?? "—"}</strong><small>Use them to generate content</small></div>
    </section>

    <div className="cf-workspace">
      <aside className="cf-sidebar cf-card">
        <div className="cf-sidebar-title">TOOLS</div>
        {tools.map(t=><button key={t.id} className={"cf-tool "+(tool===t.id?"active":"")} onClick={()=>{setTool(t.id);setAction("")}}>
          <span className="cf-tool-icon">{t.icon}</span><span><b>{t.name}</b><small>{t.desc}</small></span><i>›</i>
        </button>)}
        <div className="cf-sidebar-foot"><span>✦</span><div><b>CreatorFlow AI</b><small>Your all-in-one creator workspace</small></div></div>
      </aside>

      <section className="cf-main">
        {tool==="visual" ? <VisualCreator/> : <>
          <div className="cf-card cf-generator">
            <div className="cf-section-head"><div><div className="cf-eyebrow">AI GENERATOR</div><h2>What are you creating?</h2><p>Describe your idea and let CreatorFlow build the first draft.</p></div><span className="cf-live">● Ready</span></div>
            <div className="cf-form-grid">
              <label>Language<select className="cf-input" value={language} onChange={e=>setLanguage(e.target.value)}>{languages.map(x=><option key={x}>{x}</option>)}</select></label>
              <label>Tone<select className="cf-input" value={tone} onChange={e=>setTone(e.target.value)}><option>Engaging</option><option>Professional</option><option>Funny</option><option>Inspirational</option><option>Direct</option></select></label>
            </div>
            <label className="cf-topic-label">Your idea<textarea className="cf-input cf-topic" placeholder="Example: A YouTube video about 5 AI tools for small businesses..." value={topic} onChange={e=>setTopic(e.target.value)}/></label>
            <div className="cf-generate-row"><span className="cf-muted">Be specific for better results.</span><button className="cf-btn cf-generate" onClick={generate} disabled={loading}>{loading?"Generating…":"✦ Generate content"}</button></div>
          </div>
          <div className="cf-card cf-result">
            <div className="cf-result-head"><div><div className="cf-eyebrow">OUTPUT</div><h2>Your result</h2></div><div className="cf-result-actions"><span>{action}</span><button className="cf-icon-btn" onClick={copyResult} disabled={!result}>Copy</button><button className="cf-icon-btn" onClick={saveResult} disabled={!result||action==="Saving..."}>Save</button></div></div>
            <pre>{result || "Your generated content will appear here."}</pre>
          </div>
        </>}
      </section>
    </div>

    <style jsx>{`
      .cf-topbar{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:8px 0 24px}.cf-brand{background:none;border:0;color:white;font-size:22px;font-weight:900;cursor:pointer;letter-spacing:-.6px}.cf-brand strong{color:#8b7cff}.cf-brand em{font-size:11px;font-style:normal;color:#a7b2c6;margin-left:5px}.cf-top-actions,.cf-result-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.cf-credit{display:flex;gap:8px;align-items:center;padding:8px 12px;border:1px solid var(--border);border-radius:12px;background:rgba(255,255,255,.04)}.cf-credit span{font-size:12px;color:var(--muted)}.cf-credit b{font-size:14px}.cf-icon-btn{min-height:40px;padding:9px 13px;border:1px solid var(--border);border-radius:11px;background:rgba(255,255,255,.045);color:white;font-weight:750;cursor:pointer}.cf-icon-btn:hover{background:rgba(255,255,255,.08)}.cf-icon-btn:disabled{opacity:.45;cursor:not-allowed}
      .cf-welcome{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:30px;border:1px solid var(--border);border-radius:24px;background:linear-gradient(135deg,rgba(124,92,255,.16),rgba(17,25,46,.78));margin-bottom:20px}.cf-eyebrow{font-size:11px;letter-spacing:1.4px;font-weight:900;color:#a99cff}.cf-welcome h1{font-size:clamp(28px,4vw,42px);line-height:1.05;margin:8px 0 10px;letter-spacing:-1.3px}.cf-welcome p{margin:0;color:var(--muted);max-width:650px}.cf-stat{min-width:180px;padding:18px;border-radius:18px;background:rgba(0,0,0,.2);border:1px solid var(--border)}.cf-stat span,.cf-stat small{display:block;color:var(--muted);font-size:11px}.cf-stat strong{display:block;font-size:30px;margin:4px 0}.cf-workspace{display:grid;grid-template-columns:285px minmax(0,1fr);gap:20px}.cf-sidebar{padding:14px;height:fit-content;position:sticky;top:15px}.cf-sidebar-title{font-size:11px;font-weight:900;letter-spacing:1.3px;color:var(--muted);padding:6px 10px 10px}.cf-tool{width:100%;display:grid;grid-template-columns:38px 1fr 16px;gap:10px;align-items:center;text-align:left;border:1px solid transparent;border-radius:15px;background:transparent;color:white;padding:12px 10px;margin-bottom:5px;cursor:pointer}.cf-tool:hover{background:rgba(255,255,255,.045)}.cf-tool.active{background:linear-gradient(135deg,rgba(124,92,255,.18),rgba(124,92,255,.06));border-color:rgba(124,92,255,.38)}.cf-tool-icon{width:36px;height:36px;display:grid;place-items:center;border-radius:11px;background:rgba(255,255,255,.07);font-weight:900}.cf-tool b,.cf-tool small{display:block}.cf-tool b{font-size:13px}.cf-tool small{font-size:10px;color:var(--muted);margin-top:3px}.cf-tool i{font-style:normal;color:var(--muted);font-size:20px}.cf-sidebar-foot{display:flex;gap:10px;margin-top:12px;padding:13px 10px;border-top:1px solid var(--border);color:var(--muted)}.cf-sidebar-foot>span{color:#9b8cff}.cf-sidebar-foot b,.cf-sidebar-foot small{display:block}.cf-sidebar-foot b{font-size:11px;color:white}.cf-sidebar-foot small{font-size:9px;margin-top:3px}.cf-generator,.cf-result{padding:26px}.cf-result{margin-top:20px;min-height:300px}.cf-section-head,.cf-result-head{display:flex;justify-content:space-between;align-items:flex-start;gap:15px}.cf-section-head h2,.cf-result-head h2{font-size:22px;margin:5px 0}.cf-section-head p{margin:0;color:var(--muted);font-size:13px}.cf-live{font-size:11px;color:#a7b2c6;padding:7px 10px;border:1px solid var(--border);border-radius:20px}.cf-live:first-letter{color:#6ee7b7}.cf-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:22px 0 14px}.cf-form-grid label,.cf-topic-label{font-size:12px;color:var(--muted);font-weight:700}.cf-form-grid .cf-input{margin-top:7px}.cf-topic{min-height:150px;margin-top:7px;resize:vertical}.cf-generate-row{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:14px}.cf-muted{color:var(--muted);font-size:11px}.cf-generate{padding-left:20px;padding-right:20px}.cf-result-head{padding-bottom:15px;border-bottom:1px solid var(--border)}.cf-result-actions span{font-size:11px;color:#a7b2c6;min-width:42px}.cf-result pre{white-space:pre-wrap;font-family:inherit;line-height:1.7;margin:18px 0 0;color:#eef2ff;overflow-wrap:anywhere}.cf-main :global(.cf-card){box-shadow:0 20px 70px rgba(0,0,0,.2)}
      @media(max-width:850px){.cf-workspace{grid-template-columns:1fr}.cf-sidebar{position:static}.cf-tool{display:flex;min-height:58px}.cf-tool i{margin-left:auto}.cf-welcome{align-items:flex-start;flex-direction:column}.cf-stat{width:100%}}
      @media(max-width:560px){.cf-dashboard{padding:12px 12px 30px!important}.cf-topbar{padding-bottom:16px}.cf-top-actions{width:100%}.cf-credit{flex:1}.cf-icon-btn{min-height:42px}.cf-welcome{padding:22px;border-radius:19px}.cf-generator,.cf-result{padding:18px}.cf-form-grid{grid-template-columns:1fr}.cf-generate-row{align-items:stretch;flex-direction:column}.cf-generate{width:100%}.cf-section-head{flex-direction:column}.cf-result-head{flex-direction:column}.cf-result-actions{width:100%}.cf-result-actions .cf-icon-btn{flex:1}}
    `}</style>
  </main>
