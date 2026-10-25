import "./landing.css";
import Link from "next/link";
import type { Route } from "next";
import HomeComposer from "@/components/HomeComposer";

const tools: Array<{ icon: string; title: string; description: string; href: Route }> = [
  { icon: "✦", title: "Chat with AI", description: "Ask questions, draft content and explore ideas.", href: "/login" },
  { icon: "▧", title: "Create images", description: "Make visuals and thumbnails for your projects.", href: "/images" },
  { icon: "⌕", title: "Research & write", description: "Turn a rough idea into a clear first draft.", href: "/login" },
  { icon: "◷", title: "Plan content", description: "Organize your next creator project.", href: "/growth" },
];

export default function Home() {
  return (
    <main className="cs-home-v2">
      <header className="cs-home-v2-header">
        <Link href="/" className="cs-home-v2-brand" aria-label="CreateSoul AI home">
          <span className="cs-home-v2-mark">✦</span>
          <span>CreateSoul <em>AI</em></span>
        </Link>
        <nav className="cs-home-v2-nav" aria-label="Main navigation">
          <Link href="/pricing">Pricing</Link>
          <Link href="/login" className="cs-home-v2-signin">Sign in</Link>
        </nav>
      </header>

      <section className="cs-home-v2-hero">
        <div className="cs-home-v2-eyebrow"><span /> YOUR AI CREATIVE WORKSPACE</div>
        <h1>Bring your ideas<br /><span>to life with AI.</span></h1>
        <p className="cs-home-v2-intro">Chat, create images, research and plan your next project — all in one place.</p>
        <div className="cs-home-v2-actions">
          <Link href="/login" className="cs-home-v2-primary">Start chatting <span aria-hidden="true">↗</span></Link>
          <Link href="/images" className="cs-home-v2-secondary">Explore image tools</Link>
        </div>
        <p className="cs-home-v2-note">Sign in to access your personal workspace and saved projects.</p>
      </section>

      <HomeComposer />

      <section className="cs-home-v2-tools" aria-labelledby="cs-home-v2-tools-title">
        <div className="cs-home-v2-section-heading">
          <div><span>ONE WORKSPACE</span><h2 id="cs-home-v2-tools-title">What would you like to do?</h2></div>
          <p>Choose a tool to get started.</p>
        </div>
        <div className="cs-home-v2-grid">
          {tools.map((tool) => (
            <Link href={tool.href} className="cs-home-v2-card" key={tool.title}>
              <span className="cs-home-v2-tool-icon" aria-hidden="true">{tool.icon}</span>
              <span className="cs-home-v2-card-copy"><strong>{tool.title}</strong><small>{tool.description}</small></span>
              <span className="cs-home-v2-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>
      <footer className="cs-home-v2-footer">
        <span>CreateSoul AI</span><span>Your ideas, amplified.</span>
      </footer>
    </main>
  );
}
