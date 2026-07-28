"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Tv } from "lucide-react";
import { useThemeSettings } from "@/features/settings/hooks/use-theme-settings";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { cinematicHeroEnabled, toggleCinematicHero } = useThemeSettings();
  const { toast } = useToast();

  const handleToggle = (checked: boolean) => {
    toggleCinematicHero(checked);
    toast({
      title: checked ? "已开启列车窗景主题" : "已切换为极简首屏",
      description: checked
        ? "首页将呈现在列车车窗内漫游四季风景的沉浸式效果。"
        : "首页已切换为简约干净的无车窗首屏。",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 shadow-2xl overflow-hidden">
        <DialogHeader className="pb-4 border-b border-black/5 dark:border-white/5">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold tracking-tight">
            <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-black dark:text-white">
              <Settings className="w-5 h-5" />
            </div>
            <span>偏好设置</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500 pt-1">
            自定义您的数字花园探索外观与沉浸视觉效果。
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-start justify-between p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 transition-all hover:border-black/10 dark:hover:border-white/10">
            <div className="flex gap-3.5 min-w-0 pr-4">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                cinematicHeroEnabled
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  : "bg-neutral-200/50 dark:bg-neutral-700/50 text-neutral-400"
              )}>
                <Tv className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <Label htmlFor="hero-theme-toggle" className="text-sm font-bold cursor-pointer">
                    列车窗景首屏主题
                  </Label>
                  {cinematicHeroEnabled && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  开启后，首页将呈现全屏列车车窗与动态沉浸日夜风光；关闭后展示极简文字首屏。
                </p>
              </div>
            </div>

            <div className="pt-1">
              <Switch
                id="hero-theme-toggle"
                checked={cinematicHeroEnabled}
                onCheckedChange={handleToggle}
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2 text-xs font-bold rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
          >
            保存
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
