"use client";
import {useEffect,useMemo,useState} from "react";

type Connection={id:string;platform:string;status:string;external_account_id?:string|null;external_account_name?:string|null;scopes:string[];created_at:string;updated_at:string};
type AccessMode="ask"|"read"|"low-risk";
type Provider={id:string;name:string;icon:string;group:string;description:string;connectPath?:string;available:boolean};

const providers:Provider[]=[
{id:"youtube",name:"YouTube",icon:"▶",group:"Video",description:"Connect a channel for authorized YouTube workflows.",connectPath:"/api/integrations/youtube/connect",available:true},
{id:"facebook",name:"Facebook",icon:"f",group:"Social",description:"Connect a Facebook account/page when your workflow needs it.",connectPath:"/api/integrations/facebook/connect",available:true},
{id:"instagram",name:"Instagram",icon:"◎",group:"Social",description:"Connect Instagram for supported publishing and account workflows.",connectPath:"/api/integrations/instagram/connect",available:true},
{id:"tiktok",name:"TikTok",icon:"♪",group:"Video",description:"Connect TikTok for supported creator workflows.",connectPath:"/api/integrations/tiktok/connect",available:true},
{id:"linkedin",name:"LinkedIn",icon:"in",group:"Professional",description:"Professional publishing and profile workflows.",available:false},
{id:"x",name:"X",icon:"𝕏",group:"Social",description:"Social publishing and account workflows.",available:false},
{id:"pinterest",name:"Pinterest",icon:"P",group:"Social",description:"Pin publishing and account workflows.",available:false},
{id:"reddit",name:"Reddit",icon:"R",group:"Community",description:"Community and content workflows.",available:false},
{id:"threads",name:"Threads",icon:"@",group:"Social",description:"Threads account and publishing workflows.",available:false},
{id:"discord",name:"Discord",icon:"◈",group:"Community",description:"Community/server workflows through official authorization.",available:false},
{id:"telegram",name:"Telegram",icon:"➤",group:"Messaging",description:"Messaging and bot workflows.",available:false},
{id:"whatsapp",name:"WhatsApp Business",icon:"◉",group:"Messaging",description:"Business messaging workflows through official authorization.",available:false},
{id:"shopify",name:"Shopify",icon:"◇",group:"Commerce",description:"Store and commerce workflows.",available:false},
{id:"google-drive",name:"Google Drive",icon:"△",group:"Productivity",description:"Files and workspace workflows.",available:false},
{id:"google-calendar",name:"Google Calendar",icon:"□",group:"Productivity",description:"Calendar and scheduling workflows.",available:false},
];

const names:Record<string,string>=Object.fromEntries(providers.map(p=>[p.id,p.name]));
const accessModes:Array<{id:AccessMode;label:string;desc:string}>=[
{id:"ask",label:"Always ask",desc:"Ask before using this connected account."},
{id:"read",label:"Allow read",desc:"Reading is allowed; actions still need approval."},
{id:"low-risk",label:"Allow low-risk",desc:"Low-risk actions can proceed without repeated prompts."},
];

export default function PlatformConnections(){
 const [items,setItems]=useState<Connection[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState("");
 const [msg,setMsg]=useState("");
 const [group,setGroup]=useState("All");
 const [modes,setModes]=useState<Record<string,AccessMode>>({});
 const [enabled,setEnabled]=useState<Record<string,boolean>>({});
 const groups=useMemo(()=>["All",...Array.from(new Set(providers.map(p=>p.group)))],[]);

 useEffect(()=>{load();try{
   const raw=localStorage.getItem("createsoul_connection_access_modes");if(raw)setModes(JSON.parse(raw));
   const rawEnabled=localStorage.getItem("createsoul_enabled_integrations");
   if(rawEnabled)setEnabled(JSON.parse(rawEnabled));
   else setEnabled(Object.fromEntries(providers.map(p=>[p.id,p.available])));
 }catch{}},[]);

 async function load(){
   setLoading(true);
   try{const r=await fetch("/api/integrations",{cache:"no-store"});if(!r.ok)throw new Error("Unable to load connections");const d=await r.json();setItems(d.connections||[]);}
   catch(e){setMsg(e instanceof Error?e.message:"Unable to load connections");}
   finally{setLoading(false);}
 }
 function setMode(id:string,mode:AccessMode){
   const next={...modes,[id]:mode};setModes(next);
   try{localStorage.setItem("createsoul_connection_access_modes",JSON.stringify(next));}catch{}
 }
 function setEnabledFor(id:string,value:boolean){
   const next={...enabled,[id]:value};setEnabled(next);
   try{localStorage.setItem("createsoul_enabled_integrations",JSON.stringify(next));}catch{}
 }
 async function disconnect(id:string){
   setBusy(id);setMsg("");
   try{const r=await fetch("/api/integrations",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});if(!r.ok)throw new Error("Could not disconnect account");await load();}
   catch(e){setMsg(e instanceof Error?e.message:"Could not disconnect account");}
   finally{setBusy("");}
 }

 const params=new URLSearchParams(typeof window!=="undefined"?window.location.search:"");
 const integrationError=params.get("error");
 const integration=params.get("integration");
 const connected=params.get("connected")==="1";
 const filtered=providers.filter(p=>group==="All"||p.group===group);

 return <section className="cf-card" style={{padding:22}}>
   <div className="cf-eyebrow">APPS & CONNECTIONS</div>
   <h2 style={{margin:"6px 0"}}>Connect your accounts</h2>
   <p className="cf-muted">Each user connects only the platforms they need. CreateSoul never treats an account as connected until the provider authorization flow succeeds.</p>
   {(connected||integrationError)&&<div className="cf-card" style={{padding:12,marginTop:12}}>{connected?"Connected successfully: "+(names[integration||""]||"Platform"):"Connection could not be completed: "+(integrationError||"unknown error").replaceAll("_"," ")+"."}</div>}
   <div className="cf-card" style={{padding:14,marginTop:14}}><strong>How the integration hub works</strong><p className="cf-muted" style={{fontSize:12,margin:"7px 0 0"}}>Enable only the services you want. Then connect that service and approve its own permissions. Disabling a service hides its action from this workspace; it does not revoke the provider account permission, so use Disconnect when you want to remove the stored connection.</p></div>
   <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:14,marginBottom:14}}>{groups.map(g=><button key={g} className={"cf-icon-btn "+(group===g?"active":"")} onClick={()=>setGroup(g)}>{g}</button>)}</div>
   {loading?<p className="cf-muted">Checking connections…</p>:<div style={{display:"grid",gap:10}}>{filtered.map(p=>{
     const c=items.find(x=>x.platform===p.id&&x.status==="connected");
     const mode=modes[p.id]||"ask";
     const isEnabled=enabled[p.id] ?? p.available;
     return <article key={p.id} className="cf-card" style={{padding:14,opacity:isEnabled?1:.72}}>
       <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
         <div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:22,width:38,height:38,display:"grid",placeItems:"center",borderRadius:10,border:"1px solid rgba(255,255,255,.12)"}}>{p.icon}</span><div><strong>{p.name}</strong><div className="cf-muted" style={{fontSize:12,marginTop:3}}>{p.description}</div></div></div>
         <span className="cf-live">{c?"● Connected":isEnabled&&p.available?"● Not connected":isEnabled?"● Enabled · setup required":"● Disabled"}</span>
       </div>
       <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginTop:12}}>
         {c?<button className="cf-icon-btn" disabled={busy===c.id} onClick={()=>disconnect(c.id)}>{busy===c.id?"Removing…":"Disconnect"}</button>:isEnabled&&p.available?<a className="cf-btn" href={p.connectPath}>Connect {p.name}</a>:isEnabled?<span className="cf-muted" style={{fontSize:12}}>Provider adapter not configured yet</span>:<span className="cf-muted" style={{fontSize:12}}>Enable this service to use it</span>}
         <button className="cf-icon-btn" onClick={()=>setEnabledFor(p.id,!isEnabled)}>{isEnabled?"Disable":"Enable"}</button>
         <label className="cf-muted" style={{fontSize:12,display:"flex",alignItems:"center",gap:7}}>CreateSoul access preference<select className="cf-input" style={{width:"auto",minWidth:150,padding:"7px 9px"}} value={mode} onChange={e=>setMode(p.id,e.target.value as AccessMode)}>{accessModes.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
       </div>
       <div className="cf-muted" style={{fontSize:11,marginTop:7}}>{accessModes.find(x=>x.id===mode)?.desc} This preference does not grant provider permissions; those are chosen during account authorization.</div>
     </article>;
   })}</div>}
   {msg&&<div className="cf-muted" style={{marginTop:12}}>{msg}</div>}
 </section>
}
