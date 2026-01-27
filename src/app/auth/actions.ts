"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const supabase = await createClient();

  // 检查当前是否有会话并注销
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.auth.signOut();
  }

  // 清除服务端 Cookies 后重定向
  redirect("/login");
}
