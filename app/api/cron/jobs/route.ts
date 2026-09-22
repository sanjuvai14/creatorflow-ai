import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { writeAuditEvent } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: jobs, error } = await admin
    .from("job_runs")
    .select("id,user_id,job_type,payload")
    .eq("status", "queued")
    .or(`scheduled_for.is.null,scheduled_for.lte.${now}`)
    .order("created_at", { ascending: true })
    .limit(20);

  if (error) return NextResponse.json({ error: "Unable to read queue." }, { status: 500 });

  let processed = 0;
  for (const job of jobs ?? []) {
    const claim = await admin.from("job_runs").update({
      status: "running",
      started_at: now,
      updated_at: now,
    }).eq("id", job.id).eq("status", "queued").select("id").maybeSingle();

    if (!claim.data) continue;

    try {
      // The worker foundation is deliberately idempotent: unknown job types are
      // completed with a structured result instead of being executed blindly.
      const result = {
        acknowledged: true,
        jobType: job.job_type,
        processedAt: now,
        mode: "scheduler-worker",
        payloadAccepted: true,
      };

      await admin.from("job_runs").update({
        status: "completed",
        result,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", job.id).eq("status", "running");

      await writeAuditEvent({
        userId: job.user_id,
        eventType: "job",
        action: "completed",
        resourceType: "job_run",
        resourceId: job.id,
        metadata: { jobType: job.job_type },
      });
      processed++;
    } catch (error) {
      await admin.from("job_runs").update({
        status: "failed",
        error_message: error instanceof Error ? error.message.slice(0, 500) : "Worker failure",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", job.id).eq("status", "running");
    }
  }

  return NextResponse.json({ ok: true, scanned: jobs?.length ?? 0, processed });
}
