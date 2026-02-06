"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  displayName: string;
  isAdmin?: boolean;
}

export function DashboardHeader({ displayName, isAdmin = false }: DashboardHeaderProps) {
  const [greeting, setGreeting] = useState("你好");
  const [subtext, setSubtext] = useState("欢迎回到您的创作指挥中心。");

  useEffect(() => {
    const hour = new Date().getHours();
    let timeGreeting = "你好";
    let message = "";

    if (hour >= 5 && hour < 12) {
      timeGreeting = "早安";
      message = isAdmin
        ? "又是充满希望的一天，准备好开始创作了吗？"
        : "新的一天，从阅读一篇好文章开始吧。";
    } else if (hour >= 12 && hour < 18) {
      timeGreeting = "下午好";
      message = isAdmin
        ? "愿你的午后时光充满灵感与活力。"
        : "愿你的午后时光轻松愉悦。";
    } else if (hour >= 18 && hour < 22) {
      timeGreeting = "晚上好";
      message = isAdmin
        ? "忙碌了一天，静下心来记录此刻的想法吧。"
        : "忙碌了一天，来这里放松一下心情吧。";
    } else {
      timeGreeting = "夜深了";
      message = isAdmin
        ? "万籁俱寂，正是灵感迸发的时刻。注意休息哦。"
        : "夜深人静，适合静心阅读。注意休息哦。";
    }

    setGreeting(timeGreeting);
    setSubtext(message);
  }, [isAdmin]);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:gap-6 md:mb-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          {greeting}, {displayName}
        </h1>
        <p className="text-neutral-500">{subtext}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" className="rounded-full border-black/10 dark:border-white/10">
          <Link href="/profile">
            <Settings className="w-4 h-4 mr-2" />
            设置
          </Link>
        </Button>
        {isAdmin && (
          <Button asChild className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 px-6">
            <Link href="/admin/posts/new">
              <Plus className="w-4 h-4 mr-2" />
              撰写文章
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
