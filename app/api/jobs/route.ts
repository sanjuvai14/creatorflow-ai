import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAuditEvent } from "@/lib/audit";

const MAX_PAYLOAD_BYTES = 32_000;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("job_runs")
    .select("id,job_type,status,payload,result,error_message,scheduled_for,started_at,completed_at,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: "Unable to load jobs." }, { status: 500 });
  return NextResponse.json({ jobs: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  let body: { jobType?: unknown; payload?: unknown; scheduledFor?: unknown };
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const jobType = typeof body.jobType === "string" ? body.jobType.trim().slice(0, 80) : "";
  if (!jobType) return NextResponse.json({ error: "jobType is required." }, { status: 400 });

  const payload = body.payload && typeof body.payload === "object" && !Array.isArray(body.payload) ? body.payload : {};
  const scheduledFor = typeof body.scheduledFor === "string" ? body.scheduledFor : null;

  const { data, error } = await supabase
    .from("job_runs")
    .insert({ user_id: user.id, job_type: jobType, payload, scheduled_for: scheduledFor })
    .select("id,job_type,status,payload,scheduled_for,created_at")
    .single();

  if (error) return NextResponse.json({ error: "Unable to queue job." }, { status: 500 });

  await writeAuditEvent({
    userId: user.id,
    eventType: "job",
    action: "queued",
    resourceType: "job_run",
    resourceId: data.id,
    metadata: { jobType },
  });

  return NextResponse.json({ job: data }, { status: 201 });
}
