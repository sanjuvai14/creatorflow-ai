import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({error:"Unauthorized"},{status:401});

  const { data, error } = await supabase
    .from("platform_connections")
    .select("id,platform,status,external_account_id,external_account_name,scopes,created_at,updated_at")
    .eq("user_id", user.id)
    .order("platform");

  if (error) return NextResponse.json({error:"Unable to load connections"},{status:500});
  return NextResponse.json({connections:data ?? []});
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({error:"Unauthorized"},{status:401});

  let body: { id?: string };
  try { body = await request.json(); } catch { return NextResponse.json({error:"Invalid body"},{status:400}); }
  if (!body.id || typeof body.id !== "string" || body.id.length > 100) {
    return NextResponse.json({error:"Invalid connection id"},{status:400});
  }

  const { error } = await supabase.from("platform_connections").delete().eq("id", body.id).eq("user_id", user.id);
  if (error) return NextResponse.json({error:"Unable to remove connection"},{status:500});
  return NextResponse.json({ok:true});
}
