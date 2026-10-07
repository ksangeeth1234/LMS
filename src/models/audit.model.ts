import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { getMockStore } from "@/lib/mock-store";
import { AuditLog } from "./types";

export class AuditModel {
  /**
   * Insert an enterprise audit log entry
   */
  static async log(entry: {
    user_id?: string | null;
    action: string;
    entity_type: string;
    entity_id?: string | null;
    details?: Record<string, any> | null;
    ip_address?: string | null;
  }): Promise<void> {
    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin.from("audit_logs").insert({
          user_id: entry.user_id || null,
          action: entry.action,
          entity_type: entry.entity_type,
          entity_id: entry.entity_id || null,
          details: entry.details || null,
          ip_address: entry.ip_address || "127.0.0.1",
          created_at: timestamp,
        });
        return;
      } catch (err) {
        console.error("Supabase audit log error:", err);
      }
    }

    const store = getMockStore();
    store.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user_id: entry.user_id,
      username: entry.user_id?.includes("admin") ? "admin" : "system",
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      details: entry.details,
      ip_address: entry.ip_address || "127.0.0.1",
      created_at: timestamp,
    });
  }

  /**
   * Retrieve all audit logs
   */
  static async getAll(limit: number = 50): Promise<AuditLog[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from("audit_logs")
          .select("*, users(username)")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (!error && data) {
          return data.map((item: any) => ({
            ...item,
            username: item.users?.username || "Admin / System",
          }));
        }
      } catch (err) {
        console.error("Supabase get audit logs error:", err);
      }
    }

    const store = getMockStore();
    return store.auditLogs.slice(0, limit);
  }
}
