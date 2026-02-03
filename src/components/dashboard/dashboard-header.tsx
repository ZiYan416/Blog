"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader({ displayName }: { displayName: string }) {
  const [greeting, setGreeting] = useState("你好");
  const [subtext, setSubtext] = useState("欢迎回到您的创作指挥中心。");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("早安");
      setSubtext("又是充满希望的一天，准备好开始创作了吗？");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("下午好");
      setSubtext("愿你的午后时光充满灵感与活力。");
    } else if (hour >= 18 && hour < 22) {
      setGreeting("晚上好");
      setSubtext("忙碌了一天，静下心来记录此刻的想法吧。");
    } else {
      setGreeting("夜深了");
      setSubtext("万籁俱寂，正是灵感迸发的时刻。注意休息哦。");
    }
  }, []);

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
        <Button asChild className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 px-6">
          <Link href="/admin/posts/new">
            <Plus className="w-4 h-4 mr-2" />
            撰写文章
          </Link>
        </Button>
      </div>
    </div>
  );
}
