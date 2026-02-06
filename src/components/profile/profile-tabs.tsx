"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Settings } from "lucide-react";
import { ProfileOverview } from "./profile-overview";
import { ProfileSettingsForm } from "./profile-settings-form";
import { motion, AnimatePresence } from "framer-motion";
import { type User } from "@supabase/supabase-js";

interface ProfileTabsProps {
  user: User;
  profile: any;
  stats: any;
  recentActivity: any[];
}

export function ProfileTabs({ user, profile, stats, recentActivity }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  // 1 = slide right (overview -> settings), -1 = slide left (settings -> overview)
  const [direction, setDirection] = useState(0);

  const handleTabChange = (value: string) => {
    // If moving to settings (index 1) from overview (index 0), direction is 1
    // If moving to overview (index 0) from settings (index 1), direction is -1
    const newDirection = value === "settings" ? 1 : -1;
    setDirection(newDirection);
    setActiveTab(value);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 md:mb-4">个人中心</h1>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-auto">
          <TabsList className="bg-white dark:bg-neutral-900 p-1 rounded-full border border-black/5 dark:border-white/5 h-auto">
            <TabsTrigger
              value="overview"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              概览
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              设置
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          >
            {activeTab === "overview" && (
              <ProfileOverview
                user={user}
                profile={profile}
                stats={stats}
                recentActivity={recentActivity}
              />
            )}
            {activeTab === "settings" && (
              <ProfileSettingsForm
                user={user}
                initialProfile={profile}
                onSaveSuccess={() => handleTabChange("overview")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
