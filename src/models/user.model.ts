import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { getMockStore } from "@/lib/mock-store";
import { User, Admin, Student } from "./types";

export class UserModel {
  /**
   * Find user by username
   */
  static async findByUsername(username: string): Promise<(User & { admin?: Admin; student?: Student }) | null> {
    const cleanUsername = username.trim();

    if (isSupabaseConfigured()) {
      try {
        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("*, admins(*), students(*)")
          .ilike("username", cleanUsername)
          .single();

        if (error || !user) return null;

        return {
          id: user.id,
          username: user.username,
          password_hash: user.password_hash,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at,
          admin: user.admins?.[0] || undefined,
          student: user.students?.[0] || undefined,
        };
      } catch (err) {
        console.error("Supabase findByUsername error:", err);
      }
    }

    // Fallback store
    const store = getMockStore();
    const user = store.users.find(
      (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    if (!user) return null;

    const admin = store.admins.find((a) => a.user_id === user.id);
    const student = store.students.find((s) => s.user_id === user.id);

    return {
      ...user,
      admin,
      student,
    };
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && user) return user as User;
      } catch (err) {
        console.error("Supabase findById error:", err);
      }
    }

    const store = getMockStore();
    return store.users.find((u) => u.id === id) || null;
  }
}
