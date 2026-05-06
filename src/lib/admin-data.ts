import type { SupabaseClient } from "@supabase/supabase-js";

export interface ManagedUser {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string | null;
  comment_count: number;
}

interface CommentOwner {
  user_id: string | null;
}

const COMMENT_COUNT_PAGE_SIZE = 1000;

export function getLoginRedirect(path: string) {
  return `/?next=${encodeURIComponent(path)}`;
}

export async function getCommentCountsByUser(supabase: SupabaseClient) {
  const counts = new Map<string, number>();
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("comments")
      .select("user_id")
      .range(from, from + COMMENT_COUNT_PAGE_SIZE - 1);

    if (error) throw error;

    const rows = (data || []) as CommentOwner[];
    rows.forEach((comment) => {
      if (!comment.user_id) return;
      counts.set(comment.user_id, (counts.get(comment.user_id) || 0) + 1);
    });

    if (rows.length < COMMENT_COUNT_PAGE_SIZE) break;
    from += COMMENT_COUNT_PAGE_SIZE;
  }

  return counts;
}

export async function getManagedUsers(supabase: SupabaseClient): Promise<ManagedUser[]> {
  const usersPromise = supabase
    .from("profiles")
    .select("id, email, display_name, avatar_url, bio, is_admin, created_at, updated_at")
    .order("created_at", { ascending: false });
  const commentCountsPromise = getCommentCountsByUser(supabase);

  const [{ data: users, error }, commentCounts] = await Promise.all([
    usersPromise,
    commentCountsPromise,
  ]);

  if (error) throw error;

  return ((users || []) as Omit<ManagedUser, "comment_count">[]).map((user) => ({
    ...user,
    comment_count: commentCounts.get(user.id) || 0,
  }));
}
