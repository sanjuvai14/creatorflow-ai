import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {FREE_PLAN} from "@/lib/integrations/catalog";
export async function GET(){
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const admin=createAdminClient();
 const {data:profile}=await admin.from("profiles").select("plan,credits").eq("id",user.id).maybeSingle();
 const {data:window}=await admin.from("chat_usage_windows").select("hour_count,day_count,hour_started_at,day_started_at").eq("user_id",user.id).maybeSingle();
 const {data:connections}=await admin.from("platform_connections").select("platform,status,external_account_name,updated_at").eq("user_id",user.id).eq("status","connected").order("platform");
 return NextResponse.json({plan:profile?.plan||"free",credits:profile?.credits??0,chat:{hourly:{used:window?.hour_count??0,limit:FREE_PLAN.hourlyChats},daily:{used:window?.day_count??0,limit:FREE_PLAN.dailyChats}},connections:connections||[],freePlan:FREE_PLAN});
}
