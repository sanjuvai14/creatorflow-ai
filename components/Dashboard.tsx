"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VisualCreator from "@/components/VisualCreator";

const tools = [
  {id:"youtube", icon:"🎬", name:"YouTube Content", desc:"Titles, description, tags & script"},
  {id:"shorts", icon:"⚡", name:"Shorts / Reels", desc:"Hooks and short-form scripts"},
  {id:"social", icon:"📱", name:"Social Post", desc:"Facebook, Instagram & TikTok"},
  {id:"product", icon:"🛍️", name:"Product Description", desc:"SEO-friendly product copy"},
  {id:"visual", icon:"🖼️", name:"Visual Creator", desc:"Thumbnail, banner & social images"},
];

const languages = ["English","বাংলা","Hindi","Spanish","Portuguese","French","German","Arabic","Indonesian","Turkish"];

export default function Dashboard() {
  const [tool,setTool] = useState(tools[0].id);
  const [language,setLanguage] = useState("English");
  const [topic,setTopic] = useState("");
  const [tone,setTone] = useState("Engaging");
  const [result,setResult] = useState("");
  const [loading,setLoading] = useState(false);
  const router = useRouter();
  const [credits,setCredits] = useState<number | null>(null);
  async function loadCredits(){ const r=await fetch("/api/profile"); const d=await r.json(); if(typeof d.credits === "number") setCredits(d.credits); }
  useEffect(() => { loadCredits(); }, []);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true); setResult("");
    try {
      const r = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({tool,language,topic,tone})
      });
      const data = await r.json();
      setResult(data.output || data.error || "Something went wrong.");
      if (typeof data.credits === "number") setCredits(data.credits);
    } catch {
      setResult("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return <main style={{maxWidth:1280, margin:"0 auto", padding:"20px"}}>
    <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0 28px"}}>
      <div style={{fontWeight:900,fontSize:22}}>Creator<span style={{color:"#8b7cff"}}>Flow</span> AI</div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}><span className="cf-muted">Credits: <b style={{color:"white"}}>{credits ?? "—"}</b></span><button className="cf-btn" onClick={()=>router.push("/history")} style={{background:"rgba(255,255,255,.08)"}}>History</button><button className="cf-btn" onClick={()=>router.push("/")} style={{background:"rgba(255,255,255,.08)"}}>Home</button></div>
    </header>

    <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:20}}>
      <aside className="cf-card" style={{padding:16,height:"fit-content"}}>
        <div className="cf-muted" style={{fontSize:12,fontWeight:800,marginBottom:12}}>AI TOOLS</div>
        {tools.map(t=><button key={t.id} onClick={()=>setTool(t.id)} style={{display:"block",width:"100%",textAlign:"left",padding:13,marginBottom:8,borderRadius:12,border:"1px solid "+(tool===t.id?"rgba(124,92,255,.7)":"transparent"),background:tool===t.id?"rgba(124,92,255,.16)":"transparent",color:"white",cursor:"pointer"}}>
          <b>{t.icon} {t.name}</b><div className="cf-muted" style={{fontSize:12,marginTop:4}}>{t.desc}</div>
        </button>)}
      </aside>

      <section>
        {tool==="visual" ? <VisualCreator/> : <>
          <div className="cf-card" style={{padding:24}}>
            <h1 style={{marginTop:0}}>What are we creating?</h1>
            <p className="cf-muted">Tell CreatorFlow what you need and choose your output language.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,margin:"20px 0"}}>
              <label className="cf-muted">Language<select className="cf-input" value={language} onChange={e=>setLanguage(e.target.value)}>{languages.map(x=><option key={x}>{x}</option>)}</select></label>
              <label className="cf-muted">Tone<select className="cf-input" value={tone} onChange={e=>setTone(e.target.value)}><option>Engaging</option><option>Professional</option><option>Funny</option><option>Inspirational</option><option>Direct</option></select></label>
            </div>
            <textarea className="cf-input" style={{minHeight:150,resize:"vertical"}} placeholder="Example: A YouTube video about 5 AI tools for small businesses..." value={topic} onChange={e=>setTopic(e.target.value)}/>
            <button className="cf-btn" style={{marginTop:14}} onClick={generate} disabled={loading}>{loading?"Generating...":"✨ Generate"}</button>
          </div>

          <div className="cf-card" style={{padding:24,marginTop:20,minHeight:260}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:10}}>
              <h2 style={{marginTop:0}}>Result</h2>
              <div style={{display:"flex",gap:8}}><button className="cf-btn" style={{background:"rgba(255,255,255,.08)"}} onClick={()=>navigator.clipboard?.writeText(result)} disabled={!result}>Copy</button><button className="cf-btn" style={{background:"rgba(255,255,255,.08)"}} onClick={async()=>{if(!result)return; await fetch("/api/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:topic.slice(0,60),type:tool,content:result})}); alert("Saved to My Content.")}} disabled={!result}>Save</button></div>
            </div>
            <pre style={{whiteSpace:"pre-wrap",fontFamily:"inherit",lineHeight:1.65}}>{result || "Your generated content will appear here."}</pre>
          </div>
        </>}
      </section>
    </div>

    <style jsx>{`@media(max-width:800px){main>div{grid-template-columns:1fr!important}.cf-card{overflow:hidden}section>div:first-child div{grid-template-columns:1fr!important}}`}</style>
  </main>
}