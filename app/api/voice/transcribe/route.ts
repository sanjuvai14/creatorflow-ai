import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BYTES) {
    return NextResponse.json({ error: "Audio file is too large." }, { status: 413 });
  }

  const form = await request.formData();
  const audio = form.get("audio");
  const language = String(form.get("language") || "en");

  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "Audio file is required." }, { status: 400 });
  }
  if (audio.size === 0 || audio.size > MAX_BYTES) {
    return NextResponse.json({ error: "Invalid audio file size." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Voice transcription is not configured." }, { status: 503 });

  const body = new FormData();
  body.append("file", audio, audio.name || "voice.webm");
  body.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe");
  if (language !== "auto") body.append("language", language);

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Voice transcription failed." }, { status: 502 });
  }

  const data = await response.json() as { text?: string };
  if (!data.text?.trim()) return NextResponse.json({ error: "No speech was detected." }, { status: 422 });

  return NextResponse.json({ text: data.text.trim() });
}
