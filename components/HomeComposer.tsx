"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

export default function HomeComposer() {
  const [message, setMessage] = useState("");
  const router = useRouter();
  function send() {
    const prompt = message.trim();
    if (!prompt) return;
    router.push(("/dashboard?prompt=" + encodeURIComponent(prompt)) as Route);
  }
  return (
    <div className="cs-home-v2-composer-dock">
      <form className="cs-home-v2-composer" onSubmit={(event) => { event.preventDefault(); send(); }}>
        <label className="cs-home-v2-composer-label" htmlFor="cs-home-v2-prompt">Message CreateSoul AI</label>
        <textarea
          id="cs-home-v2-prompt"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }}
          placeholder="Ask anything…"
          rows={1}
          aria-label="Write a message to CreateSoul AI"
        />
        <div className="cs-home-v2-composer-bottom">
          <span>AI chat · Images · Research · Content</span>
          <button type="submit" disabled={!message.trim()} aria-label="Send message">↑</button>
        </div>
      </form>
      <p>Press Enter to start · Sign in is required to send messages</p>
    </div>
  );
}
