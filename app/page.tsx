import Link from "next/link";

const tools = [
  ["🎬", "YouTube Studio", "Titles, descriptions, tags and scripts"],
  ["⚡", "Shorts & Reels", "Hooks, scripts and captions"],
  ["📱", "Social Posts", "Facebook, Instagram and TikTok"],
  ["🛍️", "Product Copy", "Conversion-focused product descriptions"],
  ["🖼️", "Visual Creator", "Thumbnails, banners and creator visuals"],
];

export default function Home() {
  return (
    <main>
      <nav style={{maxWidth: 1180, margin: "0 auto", padding: "24px 20px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{fontWeight:900, fontSize:22}}>Creator<span style={{color:"#8b7cff"}}>Flow</span> <span style={{fontSize:13}}>AI</span></div>
        <div style={{display:"flex", gap:10}}>
          <Link href="/login" className="cf-btn">Get Started</Link>
        </div>
      </nav>

      <section style={{maxWidth: 1000, margin:"70px auto 0", padding:"20px", textAlign:"center"}}>
        <div className="cf-muted" style={{fontWeight:700, letterSpacing:1}}>AI CONTENT CREATION PLATFORM</div>
        <h1 style={{fontSize:"clamp(44px,8vw,82px)", lineHeight:1.02, margin:"18px 0"}}>
          Create. Publish.<br/><span style={{color:"#8b7cff"}}>Grow.</span>
        </h1>
        <p className="cf-muted" style={{fontSize:19, maxWidth:680, margin:"0 auto 28px"}}>
          One workspace for YouTube, TikTok, Instagram, Facebook, freelancers and small businesses.
        </p>
        <Link href="/login" className="cf-btn" style={{display:"inline-block"}}>Start Creating Free →</Link>
      </section>

      <section style={{maxWidth:1180, margin:"80px auto", padding:"20px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:16}}>
        {tools.map(([icon,title,desc]) => (
          <div className="cf-card" key={title} style={{padding:24}}>
            <div style={{fontSize:30}}>{icon}</div>
            <h3>{title}</h3>
            <p className="cf-muted">{desc}</p>
          </div>
        ))}
      </section>

      <section style={{maxWidth:900, margin:"0 auto 100px", padding:"20px"}}>
        <div className="cf-card" style={{padding:30}}>
          <h2>Built multilingual from day one</h2>
          <p className="cf-muted">English · বাংলা · Hindi · Spanish · Portuguese · French · German · Arabic · Indonesian · Turkish</p>
        </div>
      </section>
    </main>
  );
}