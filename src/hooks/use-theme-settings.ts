"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "cinematic_hero_theme_enabled";

export function useThemeSettings() {
  const [cinematicHeroEnabled, setCinematicHeroEnabled] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setCinematicHeroEnabled(saved === "true");
      }
    } catch (e) {
      console.error("Failed to read theme settings from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const toggleCinematicHero = (enabled: boolean) => {
    setCinematicHeroEnabled(enabled);
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
      // Trigger storage event so other components update reactively
      window.dispatchEvent(new Event("theme-settings-changed"));
    } catch (e) {
      console.error("Failed to save theme settings to localStorage", e);
    }
  };

  useEffect(() => {
    const handleSettingsChange = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          setCinematicHeroEnabled(saved === "true");
        }
      } catch (e) {}
    };

    window.addEventListener("theme-settings-changed", handleSettingsChange);
    return () => window.removeEventListener("theme-settings-changed", handleSettingsChange);
  }, []);

  return {
    cinematicHeroEnabled,
    toggleCinematicHero,
    isLoaded,
  };
}
