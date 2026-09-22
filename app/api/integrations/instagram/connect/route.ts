import { startSocialOAuth } from "@/lib/integrations/social-oauth";
export async function GET(request: Request) { return startSocialOAuth(request, "instagram"); }
