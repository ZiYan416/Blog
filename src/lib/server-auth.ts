import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

export class AccessError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403,
    public readonly code: "UNAUTHORIZED" | "FORBIDDEN"
  ) {
    super(message);
    this.name = "AccessError";
  }
}

export async function requireUser(supabase: SupabaseClient<Database>): Promise<User> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AccessError("未授权", 401, "UNAUTHORIZED");
  }

  return user;
}

export async function requireAdmin(supabase: SupabaseClient<Database>): Promise<User> {
  const user = await requireUser(supabase);
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_admin) {
    throw new AccessError("需要管理员权限", 403, "FORBIDDEN");
  }

  return user;
}
