import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    note: "Explore the core tools with no payment required.",
    credits: "30 credits / month",
    features: [
      "Content ideas",
      "YouTube title, description & tags",
      "Shorts & Reels scripts",
      "Social posts & captions",
      "Product descriptions",
      "Basic image generation",
      "Basic thumbnail creation",
      "2 short video projects / month",
      "Watermark on generated media",
    ],
    cta: "Start Free",
  },
  {
    name: "Creator",
    price: "$14.99",
    note: "For creators publishing consistently every month.",
    credits: "300 credits / month",
    video: "Up to 20 × 30-sec, or 10 × 60-sec, or 6 × 90-sec videos / month",
    features: [
      "Everything in Free",
      "HD exports",
      "No watermark",
      "50 image generations / month",
      "50 thumbnail generations / month",
      "100 scripts / month",
      "100 YouTube SEO generations / month",
      "200 social posts / month",
      "Saved projects & visuals",
      "Priority processing",
    ],
    cta: "Choose Creator",
  },
  {
    name: "Pro",
    price: "$29.99",
    note: "For serious creators, brands and frequent publishing.",
    credits: "750 credits / month",
    video: "Up to 50 × 30-sec, or 25 × 60-sec, or 16 × 90-sec videos / month",
    features: [
      "Everything in Creator",
      "Advanced AI workflows",
      "Higher generation capacity",
      "150 image generations / month",
      "150 thumbnail generations / month",
      "300 scripts / month",
      "300 YouTube SEO generations / month",
      "600 social posts / month",
      "Priority processing",
      "Advanced workspace features",
    ],
    cta: "Choose Pro",
  },
];

export default function PricingPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "24px 20px 70px" }}>
      <nav style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ fontWeight: 900, fontSize: 22 }}>
          Create<span style={{ color: "#8b7cff" }}>Soul</span>{" "}
          <span style={{ fontSize: 12, opacity: 0.75 }}>AI</span>
        </Link>
        <Link href="/login" className="cf-btn">Sign in</Link>
      </nav>

      <section style={{ maxWidth: 980, margin: "58px auto 0", textAlign: "center" }}>
        <div className="cf-eyebrow">SIMPLE CREATOR PRICING</div>
        <h1 style={{ fontSize: "clamp(38px,8vw,68px)", lineHeight: 1, letterSpacing: -2, margin: "16px 0" }}>
          Create more.{" "}
          <span style={{ background: "linear-gradient(90deg,#9b87ff,#22d3ee)", WebkitBackgroundClip: "text", color: "transparent" }}>
            Grow smarter.
          </span>
        </h1>
        <p className="cf-muted" style={{ maxWidth: 700, margin: "0 auto", lineHeight: 1.65 }}>
          Start free, then upgrade when CreateSoul becomes part of your regular publishing workflow.
          Pricing and limits are designed around a transparent monthly credit system.
        </p>
      </section>

      <section style={{ maxWidth: 1180, margin: "46px auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(245px,1fr))", gap: 18 }}>
        {plans.map((plan, index) => (
          <div className="cf-card cf-glow" key={plan.name} style={{ padding: 26, position: "relative", border: index === 1 ? "1px solid rgba(139,124,255,.55)" : undefined }}>
            {index === 1 && <div className="cf-eyebrow" style={{ position: "absolute", top: 18, right: 18 }}>MOST POPULAR</div>}
            <h2 style={{ margin: 0, fontSize: 24 }}>{plan.name}</h2>
            <div style={{ marginTop: 18, fontSize: 42, fontWeight: 900 }}>
              {plan.price}<span style={{ fontSize: 14, opacity: 0.6 }}>{plan.price !== "$0" ? "/month" : "/forever"}</span>
            </div>
            <p className="cf-muted" style={{ minHeight: 42, lineHeight: 1.5 }}>{plan.note}</p>
            <div style={{ fontWeight: 800, margin: "20px 0 8px" }}>{plan.credits}</div>
            {plan.video && (
              <div className="cf-muted" style={{ marginBottom: 14, lineHeight: 1.55, fontSize: 14 }}>
                <strong>Video allowance:</strong> {plan.video}
              </div>
            )}
            <ul style={{ margin: "0 0 24px", paddingLeft: 20, lineHeight: 1.9 }}>
              {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <Link href="/login" className={index === 0 ? "cf-btn" : "cf-icon-btn"} style={{ display: "block", textAlign: "center", width: "100%", boxSizing: "border-box" }}>
              {plan.cta}
            </Link>
          </div>
        ))}
      </section>

      <section style={{ maxWidth: 820, margin: "34px auto 0" }}>
        <div className="cf-card" style={{ padding: 24, lineHeight: 1.65 }}>
          <strong>How limits work:</strong> monthly credits are the main usage currency. Higher-cost generations can consume more credits depending on the model, duration and quality.
          Video allowances shown above are monthly planning caps for standard CreateSoul video generation and use the same monthly video allowance rather than stacking together.
          Unused monthly plan credits do not automatically become extra video allowance.
          <br /><br />
          <strong>Billing:</strong> international card/payment options and Bangladesh-compatible merchant payment rails are being prepared.
          Real-money billing will only be enabled after server-side payment verification, signed webhooks, idempotency and plan/credit activation are implemented and tested.
        </div>
      </section>
    </main>
  );
}
