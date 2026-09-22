import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { data, error } = await supabase.from("job_runs")
    .select("id,status,payload,result,error_message,started_at,completed_at,created_at")
    .eq("id", id).eq("user_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "Unable to load video job." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Video job not found." }, { status: 404 });
  return NextResponse.json({ job: data });
}
