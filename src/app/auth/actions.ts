"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const supabase = await createClient();

  // 无论是否获取到用户，都尝试执行注销操作以清除可能存在的会话
  await supabase.auth.signOut();

  // 清除服务端 Cookies 后重定向
  redirect("/login");
}
