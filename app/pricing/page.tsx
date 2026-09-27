import Link from "next/link";

const plans = [
  { name: "Free", price: "$0", period: "/forever", credits: "30 credits / month", cta: "Start Free", features: ["Content ideas","YouTube title, description & tags","Shorts & Reels scripts","Social posts & captions","Product descriptions","Basic image generation","Basic thumbnail creation"] },
  { name: "Starter", price: "$4.99", period: "/month", credits: "Starter monthly plan", cta: "Choose Starter", features: ["Core creator tools","YouTube & social content","Product copy","Image/thumbnail tools","Monthly credits"] },
  { name: "Creator", price: "$19.99", period: "/month", credits: "Creator monthly plan", cta: "Choose Creator", features: ["Everything in Starter","Higher usage capacity","HD exports","Saved projects & visuals","Priority processing"] },
  { name: "Pro", price: "$9.99", period: "/month", credits: "Pro monthly plan", cta: "Choose Pro", features: ["Advanced AI workflows","Higher generation capacity","Priority processing","Advanced workspace features"] },
];

export default function PricingPage() {
  return <main style={{minHeight:"100vh",padding:"24px 20px 70px"}}>
    <nav style={{maxWidth:1180,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}><Link href="/" style={{fontWeight:900,fontSize:22}}>Create<span style={{color:"#8b7cff"}}>Soul</span> <span style={{fontSize:12,opacity:.75}}>AI</span></Link><Link href="/login" className="cf-btn">Sign in</Link></nav>
    <section style={{maxWidth:980,margin:"58px auto 0",textAlign:"center"}}><div className="cf-eyebrow">CREATESOUL AI PRICING</div><h1 style={{fontSize:"clamp(38px,8vw,68px)",lineHeight:1,letterSpacing:-2,margin:"16px 0"}}>Create more. <span style={{background:"linear-gradient(90deg,#9b87ff,#22d3ee)",WebkitBackgroundClip:"text",color:"transparent"}}>Grow smarter.</span></h1><p className="cf-muted" style={{maxWidth:700,margin:"0 auto",lineHeight:1.65}}>Start free and upgrade when you need more AI creation capacity.</p></section>
    <section style={{maxWidth:1180,margin:"46px auto 0",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:18}}>{plans.map((p,i)=><div className="cf-card cf-glow" key={p.name} style={{padding:26}}><h2 style={{margin:0,fontSize:24}}>{p.name}</h2><div style={{marginTop:18,fontSize:42,fontWeight:900}}>{p.price}<span style={{fontSize:14,opacity:.6}}>{p.period}</span></div><div style={{fontWeight:800,margin:"20px 0 8px"}}>{p.credits}</div><ul style={{margin:"0 0 24px",paddingLeft:20,lineHeight:1.9}}>{p.features.map(f=><li key={f}>{f}</li>)}</ul><Link href={p.name==="Free"?"/login":"/login?purchase="+p.name.toLowerCase()} className={i===0?"cf-btn":"cf-icon-btn"} style={{display:"block",textAlign:"center",width:"100%",boxSizing:"border-box"}}>{p.cta}</Link></div>)}</section>
    <section style={{maxWidth:820,margin:"34px auto 0"}}><div className="cf-card" style={{padding:24,lineHeight:1.65}}><strong>Credits:</strong> usage is metered through the CreateSoul credit system. Paid checkout remains disabled until server-side Paddle configuration and webhook verification are complete.<br/><br/><strong>One-time credits:</strong> available through the configured Paddle credit purchase when billing is enabled.</div></section>
  </main>;
}
