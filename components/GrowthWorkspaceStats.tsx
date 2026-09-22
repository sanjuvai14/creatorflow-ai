"use client";

import { useEffect, useState } from "react";

type Stats = {
  generationCount: number;
  savedContentCount: number;
  savedImageCount: number;
  jobCount: number;
  completedJobCount: number;
};

export default function GrowthWorkspaceStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/analytics/growth", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => data && setStats(data))
      .catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <div className="cf-card" style={{ padding: 20, marginTop: 18 }}>
      <div className="cf-eyebrow">WORKSPACE ACTIVITY · LAST 30 DAYS</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 12 }}>
        {[
          ["AI generations", stats.generationCount],
          ["Saved content", stats.savedContentCount],
          ["Saved images", stats.savedImageCount],
          ["Jobs completed", stats.completedJobCount],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <div className="cf-muted" style={{ fontSize: 12 }}>{label}</div>
            <div style={{ fontSize: 25, fontWeight: 900, marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
