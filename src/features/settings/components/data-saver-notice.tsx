"use client";

import { useSyncExternalStore } from "react";
import { Gauge } from "lucide-react";
import { useDataSaver } from "@/features/settings/hooks/use-data-saver";

const SESSION_DISMISSED_KEY = "media_data_saver_notice_dismissed";
const NOTICE_CHANGE_EVENT = "media-data-saver-notice-changed";
let ephemeralDismissed = false;

function getDismissedSnapshot() {
  try {
    return (
      ephemeralDismissed ||
      sessionStorage.getItem(SESSION_DISMISSED_KEY) === "true"
    );
  } catch {
    return ephemeralDismissed;
  }
}

function subscribeToDismissal(onStoreChange: () => void) {
  window.addEventListener(NOTICE_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(NOTICE_CHANGE_EVENT, onStoreChange);
}

export function DataSaverNotice() {
  const {
    isDataSaverActive,
    isNetworkStatusReady,
    setDataSaverEnabled,
  } = useDataSaver();
  const isDismissed = useSyncExternalStore(
    subscribeToDismissal,
    getDismissedSnapshot,
    () => false
  );

  const dismissForSession = () => {
    ephemeralDismissed = true;
    try {
      sessionStorage.setItem(SESSION_DISMISSED_KEY, "true");
    } catch {
      // The notice can still be dismissed for the current page lifecycle.
    }
    window.dispatchEvent(new Event(NOTICE_CHANGE_EVENT));
  };

  if (
    !isNetworkStatusReady ||
    !isDataSaverActive ||
    isDismissed
  ) {
    return null;
  }

  return (
    <div
      role="status"
      aria-label="节流模式提示"
      className="fixed left-1/2 top-20 z-[250] flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-start gap-3 rounded-2xl border border-black/10 bg-white/95 p-4 text-neutral-900 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/95 dark:text-white sm:items-center"
    >
      <Gauge className="mt-0.5 size-5 shrink-0 text-amber-500 sm:mt-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">已开启节流模式</p>
        <p className="mt-0.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          当前网络可能按流量计费，背景视频已暂停。
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
        <button
          type="button"
          onClick={dismissForSession}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10"
        >
          保持开启
        </button>
        <button
          type="button"
          onClick={() => setDataSaverEnabled(false)}
          className="rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
        >
          关闭节流
        </button>
      </div>
    </div>
  );
}
