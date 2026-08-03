"use client";

import { useSyncExternalStore } from "react";

const CINEMATIC_HERO_STORAGE_KEY = "cinematic_hero_theme_enabled";
const DATA_SAVER_STORAGE_KEY = "media_data_saver_enabled";
const CHANGE_EVENT = "theme-settings-changed";

function getStoredBoolean(key: string, fallback: boolean) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value !== "false";
  } catch {
    return fallback;
  }
}

const getCinematicHeroSnapshot = () =>
  getStoredBoolean(CINEMATIC_HERO_STORAGE_KEY, true);
const getDataSaverSnapshot = () =>
  getStoredBoolean(DATA_SAVER_STORAGE_KEY, true);

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useThemeSettings() {
  const cinematicHeroEnabled = useSyncExternalStore(
    subscribe,
    getCinematicHeroSnapshot,
    () => true
  );
  const dataSaverEnabled = useSyncExternalStore(
    subscribe,
    getDataSaverSnapshot,
    () => true
  );

  const savePreference = (key: string, enabled: boolean) => {
    try {
      localStorage.setItem(key, String(enabled));
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch (error) {
      console.error("Failed to save preference to localStorage", error);
    }
  };

  return {
    cinematicHeroEnabled,
    dataSaverEnabled,
    toggleCinematicHero: (enabled: boolean) =>
      savePreference(CINEMATIC_HERO_STORAGE_KEY, enabled),
    toggleDataSaver: (enabled: boolean) =>
      savePreference(DATA_SAVER_STORAGE_KEY, enabled),
    isLoaded: true,
  };
}
