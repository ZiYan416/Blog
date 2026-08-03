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
import { Gauge, Settings, Tv } from "lucide-react";
import { useThemeSettings } from "@/features/settings/hooks/use-theme-settings";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const {
    cinematicHeroEnabled,
    dataSaverEnabled,
    toggleCinematicHero,
    toggleDataSaver,
  } = useThemeSettings();
  const { toast } = useToast();

  const handleToggle = (checked: boolean) => {
    toggleCinematicHero(checked);
    toast({
      title: checked ? "已开启首页动态背景" : "已关闭首页动态背景",
      description: checked ? "首页将播放背景视频。" : "首页将显示静态内容。",
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
            调整首页显示和媒体加载方式。
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-start justify-between p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 transition-all hover:border-black/10 dark:hover:border-white/10">
            <div className="flex gap-3.5 min-w-0 pr-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-neutral-200/50 text-neutral-500 dark:bg-neutral-700/50 dark:text-neutral-300">
                <Tv className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <Label htmlFor="hero-theme-toggle" className="text-sm font-semibold cursor-pointer">
                    首页动态背景
                  </Label>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  开启后在首页播放背景视频；关闭后显示静态首页。
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

          <div className="flex items-start justify-between p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 transition-all hover:border-black/10 dark:hover:border-white/10">
            <div className="flex gap-3.5 min-w-0 pr-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-neutral-200/50 text-neutral-500 dark:bg-neutral-700/50 dark:text-neutral-300">
                <Gauge className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <Label htmlFor="data-saver-toggle" className="text-sm font-semibold cursor-pointer">
                  自动节省流量
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  在移动网络或慢速网络下暂停背景视频。
                </p>
              </div>
            </div>

            <div className="pt-1">
              <Switch
                id="data-saver-toggle"
                checked={dataSaverEnabled}
                onCheckedChange={(checked) => {
                  toggleDataSaver(checked);
                  toast({
                    title: checked ? "已开启自动节省流量" : "已关闭自动节省流量",
                  });
                }}
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2 text-xs font-bold rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
          >
            完成
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
