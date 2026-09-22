import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const COSTS: Record<string, number> = { "30": 30, "60": 60, "90": 90 };

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const duration = String(body.duration ?? "30");
  const creditsRequired = COSTS[duration];
  if (!creditsRequired) return NextResponse.json({ error: "Duration must be 30, 60, or 90 seconds." }, { status: 400 });

  const prompt = typeof body.prompt === "string" ? body.prompt.trim().slice(0, 5000) : "";
  if (!prompt) return NextResponse.json({ error: "Prompt is required." }, { status: 400 });

  if (process.env.VIDEO_GENERATION_ENABLED !== "true") {
    return NextResponse.json({ error: "Video generation is not enabled yet. Your credits were not used.", enabled: false }, { status: 503 });
  }

  const admin = createAdminClient();
  const { data: credits, error: creditError } = await admin.rpc("consume_credits", { p_user_id: user.id, p_amount: creditsRequired });
  if (creditError) return NextResponse.json({ error: creditError.message.toLowerCase().includes("no credits") ? "Not enough credits for this video." : "Could not reserve video credits." }, { status: 402 });

  const { data: job, error } = await supabase.from("job_runs").insert({
    user_id: user.id,
    job_type: "video_generation",
    payload: { prompt, duration: Number(duration), creditCost: creditsRequired, provider: process.env.VIDEO_PROVIDER || "queued" },
  }).select("id,status,created_at").single();

  if (error) {
    await admin.rpc("refund_credits", { p_user_id: user.id, p_amount: creditsRequired });
    return NextResponse.json({ error: "Could not queue video generation. Credits were returned." }, { status: 500 });
  }

  return NextResponse.json({ queued: true, job, credits, creditCost: creditsRequired, duration: Number(duration) }, { status: 202 });
}
