import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [generations, saved, images, jobs] = await Promise.all([
    supabase.from("generations").select("id,tool_type,created_at").eq("user_id", user.id).gte("created_at", since),
    supabase.from("saved_content").select("id,created_at").eq("user_id", user.id).gte("created_at", since),
    supabase.from("saved_images").select("id,created_at").eq("user_id", user.id).gte("created_at", since),
    supabase.from("job_runs").select("id,status,created_at").eq("user_id", user.id).gte("created_at", since),
  ]);

  const errors = [generations.error, saved.error, images.error, jobs.error].filter(Boolean);
  if (errors.length) return NextResponse.json({ error: "Unable to load growth analytics." }, { status: 500 });

  const toolCounts = (generations.data ?? []).reduce<Record<string, number>>((acc, row) => {
    const key = row.tool_type || "creator";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const completedJobs = (jobs.data ?? []).filter((row) => row.status === "completed").length;

  return NextResponse.json({
    periodDays: 30,
    generationCount: generations.data?.length ?? 0,
    savedContentCount: saved.data?.length ?? 0,
    savedImageCount: images.data?.length ?? 0,
    jobCount: jobs.data?.length ?? 0,
    completedJobCount: completedJobs,
    toolCounts,
    generatedAt: new Date().toISOString(),
    source: "CreateSoul workspace data",
  });
}
