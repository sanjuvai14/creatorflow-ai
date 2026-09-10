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
    <main style={{ minHeight: "100vh", overflow: "hidden" }}>
      <nav style={{ maxWidth: 1180, margin: "0 auto", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ fontWeight: 900, fontSize: 22, letterSpacing: -.5 }}>Creator<span style={{ color: "#8b7cff" }}>Flow</span> <span style={{ fontSize: 12, opacity: .75 }}>AI</span></Link>
        <Link href="/login" className="cf-btn">Sign in</Link>
      </nav>

      <section style={{ maxWidth: 1050, margin: "48px auto 0", padding: "34px 20px 20px", textAlign: "center" }}>
        <div className="cf-eyebrow">THE CREATOR WORKSPACE</div>
        <h1 style={{ fontSize: "clamp(44px,9vw,86px)", lineHeight: .98, letterSpacing: -3, margin: "18px 0 22px" }}>
          Create faster.<br /><span style={{ background: "linear-gradient(90deg,#9b87ff,#22d3ee)", WebkitBackgroundClip: "text", color: "transparent" }}>Grow smarter.</span>
        </h1>
        <p className="cf-muted" style={{ fontSize: "clamp(16px,2.2vw,20px)", lineHeight: 1.6, maxWidth: 700, margin: "0 auto 30px" }}>
          Turn one idea into ready-to-publish content, social copy, product descriptions and creator visuals from one simple AI workspace.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link href="/login" className="cf-btn">Start Creating Free →</Link>
          <a href="#tools" className="cf-icon-btn" style={{ display: "inline-flex", alignItems: "center" }}>Explore Tools</a>
        </div>
        <div className="cf-muted" style={{ marginTop: 18, fontSize: 12 }}>Built for creators · Works on phone, tablet and PC</div>
      </section>

      <section id="tools" style={{ maxWidth: 1180, margin: "62px auto", padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(205px,1fr))", gap: 16 }}>
        {tools.map(([icon, title, desc]) => (
          <div className="cf-card cf-glow" key={title} style={{ padding: 24, minHeight: 170 }}>
            <div style={{ fontSize: 30, marginBottom: 12 }}>{icon}</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>{title}</h3>
            <p className="cf-muted" style={{ margin: 0, lineHeight: 1.55, fontSize: 14 }}>{desc}</p>
          </div>
        ))}
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto 80px", padding: "20px" }}>
        <div className="cf-card cf-glow" style={{ padding: "30px 24px", textAlign: "center" }}>
          <div className="cf-eyebrow">ONE WORKSPACE. MANY LANGUAGES.</div>
          <h2 style={{ margin: "8px 0 10px", fontSize: "clamp(24px,5vw,36px)" }}>Your ideas. One workspace.</h2>
          <p className="cf-muted" style={{ margin: "0 auto 22px", lineHeight: 1.6 }}>Create content in English, বাংলা, Hindi, Spanish, Portuguese, French, German, Arabic, Indonesian and Turkish.</p>
          <Link href="/login" className="cf-btn">Enter CreatorFlow AI</Link>
        </div>
      </section>
    </main>
  );
}
