"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "cinematic_hero_theme_enabled";
const CHANGE_EVENT = "theme-settings-changed";

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useThemeSettings() {
  const cinematicHeroEnabled = useSyncExternalStore(subscribe, getSnapshot, () => true);

  const toggleCinematicHero = (enabled: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch (error) {
      console.error("Failed to save theme settings to localStorage", error);
    }
  };

  return {
    cinematicHeroEnabled,
    toggleCinematicHero,
    isLoaded: true,
  };
}
