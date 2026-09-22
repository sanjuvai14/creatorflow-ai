import { createAdminClient } from "@/lib/supabase/admin";

export async function writeAuditEvent(input: {
  userId?: string | null;
  eventType: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  status?: "success" | "failure" | "denied";
  metadata?: Record<string, unknown>;
}) {
  try {
    const admin = createAdminClient();
    await admin.from("audit_events").insert({
      user_id: input.userId ?? null,
      event_type: input.eventType,
      action: input.action,
      resource_type: input.resourceType ?? null,
      resource_id: input.resourceId ?? null,
      status: input.status ?? "success",
      metadata: input.metadata ?? {},
    });
  } catch {
    // Audit failures must never break the primary user operation.
  }
}
