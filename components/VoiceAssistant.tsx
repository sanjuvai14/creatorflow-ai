"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const WAKE_WORDS = ["hey createsoul", "createsoul"];

function detectSpeechLocale(text?: string) {
  const value = text || "";
  if (/[ঀ-৿]/.test(value)) return "bn-BD";
  if (/[ऀ-ॿ]/.test(value)) return "hi-IN";
  if (typeof navigator !== "undefined") {
    const locale = navigator.language || "en-US";
    if (/^bn/i.test(locale)) return "bn-BD";
    if (/^hi/i.test(locale)) return "hi-IN";
    return locale;
  }
  return "en-US";
}

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [continuous, setContinuous] = useState(false);
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("Ready");
  const recognitionRef = useRef<any>(null);
  const shouldContinueRef = useRef(false);
  const busyRef = useRef(false);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = detectSpeechLocale(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const runTask = useCallback(async (text: string) => {
    if (!text.trim() || busyRef.current) return;
    busyRef.current = true;
    setStatus("Thinking…");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "youtube",
          platform: "",
          language: /বাংলা|bangla|bengali/i.test(text) ? "বাংলা" : /हिन्दी|हिंदी|hindi/i.test(text) ? "Hindi" : "English",
          topic: text,
          tone: "Engaging",
          provider: "auto"
        })
      });
      const data = await response.json();
      const output = response.ok ? (data.output || "I completed the request, but there was no text result.") : (data.error || "The AI service is not connected yet.");
      setReply(output);
      setStatus(response.ok ? "Task complete" : "Needs AI connection");
      speak(output);
    } catch {
      const message = "I couldn't reach the CreateSoul AI service right now.";
      setReply(message);
      setStatus("Connection problem");
      speak(message);
    } finally {
      busyRef.current = false;
    }
  }, [speak]);

  const handleResult = useCallback((text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setHeard(clean);
    const lower = clean.toLowerCase();
    const hasWake = WAKE_WORDS.some(word => lower.includes(word));
    if (continuous || hasWake) {
      const task = hasWake ? clean.replace(/^(hey\s+createsoul|createsoul)[:,\s-]*/i, "") : clean;
      if (task.trim()) void runTask(task.trim());
      else setStatus("Listening for your task…");
    } else {
      setStatus("Say “Hey CreateSoul” or turn on hands-free mode");
    }
  }, [continuous, runTask]);

  const start = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setStatus("Voice input is not supported by this browser.");
      return;
    }
    if (recognitionRef.current) recognitionRef.current.stop();
    const recognition = new SpeechRecognition();
    recognition.lang = typeof navigator !== "undefined" ? (navigator.language || "en-US") : "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => { setListening(true); setStatus("Listening…"); };
    recognition.onresult = (event: any) => handleResult(event.results?.[0]?.[0]?.transcript || "");
    recognition.onerror = () => { setListening(false); setStatus("Voice input stopped"); };
    recognition.onend = () => {
      setListening(false);
      if (shouldContinueRef.current) window.setTimeout(start, 250);
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, [handleResult]);

  const stop = useCallback(() => {
    shouldContinueRef.current = false;
    setContinuous(false);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setListening(false);
    setSpeaking(false);
    setStatus("Ready");
  }, []);

  const toggleHandsFree = useCallback(() => {
    const next = !continuous;
    setContinuous(next);
    shouldContinueRef.current = next;
    if (next) start(); else stop();
  }, [continuous, start, stop]);

  useEffect(() => () => {
    shouldContinueRef.current = false;
    recognitionRef.current?.stop();
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, []);

  return (
    <main style={{ minHeight: "100vh", padding: 24, display: "grid", placeItems: "center" }}>
      <section className="cf-card" style={{ width: "min(900px,100%)", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div className="cf-eyebrow">CREATESOUL AI · VOICE AGENT</div>
            <h1 style={{ margin: "8px 0", fontSize: "clamp(30px,6vw,52px)" }}>Talk. Ask. Create.</h1>
            <p className="cf-muted" style={{ maxWidth: 650, lineHeight: 1.7 }}>
              A hands-free creator assistant. Say “Hey CreateSoul” followed by a task, or enable hands-free mode for a continuous voice conversation.
            </p>
          </div>
          <div style={{ width: 120, height: 120, borderRadius: "50%", display: "grid", placeItems: "center", background: speaking ? "rgba(34,211,238,.16)" : listening ? "rgba(124,92,255,.2)" : "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", fontSize: 42 }}>
            {speaking ? "🔊" : listening ? "🎙" : "✦"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
          <button className="cf-btn" onClick={listening ? stop : start}>{listening ? "Stop listening" : "Start voice"}</button>
          <button className="cf-icon-btn" onClick={toggleHandsFree}>{continuous ? "Hands-free ON" : "Hands-free mode"}</button>
          <button className="cf-icon-btn" onClick={() => { setHeard(""); setReply(""); setStatus("Ready"); }}>Clear</button>
        </div>

        <div style={{ marginTop: 24, padding: 16, borderRadius: 16, background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.08)" }}>
          <div className="cf-eyebrow">STATUS</div>
          <div style={{ marginTop: 7 }}>{status}</div>
        </div>

        {heard && <div className="cf-card" style={{ marginTop: 14, padding: 16 }}><div className="cf-eyebrow">YOU SAID</div><div style={{ marginTop: 7, whiteSpace: "pre-wrap", lineHeight: 1.65 }}>{heard}</div></div>}
        {reply && <div className="cf-card" style={{ marginTop: 14, padding: 16 }}><div className="cf-eyebrow">CREATESOUL AI</div><div style={{ marginTop: 7, whiteSpace: "pre-wrap", lineHeight: 1.65 }}>{reply}</div></div>}

        <div style={{ marginTop: 22, color: "#8e99aa", fontSize: 12, lineHeight: 1.7 }}>
          Voice control is browser-based and only listens while this page is active. Actual AI generation uses the same protected CreateSoul generation route and therefore will not consume credits when no AI provider is configured.
        </div>
      </section>
    </main>
  );
}
