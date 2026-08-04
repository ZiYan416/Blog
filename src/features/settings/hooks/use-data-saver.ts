"use client";

import { useEffect, useState } from "react";
import { useThemeSettings } from "@/features/settings/hooks/use-theme-settings";

export interface NetworkInformationLike {
  effectiveType?: string;
  saveData?: boolean;
  type?: string;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
}

export interface NavigatorLike {
  userAgent?: string;
  userAgentData?: {
    mobile?: boolean;
  };
}

const MOBILE_USER_AGENT_PATTERN =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Mobile/i;

function getNavigator(): NavigatorLike | undefined {
  return typeof navigator === "undefined"
    ? undefined
    : (navigator as NavigatorLike);
}

export function isMobileDevice(navigatorLike = getNavigator()) {
  if (!navigatorLike) return false;

  if (typeof navigatorLike.userAgentData?.mobile === "boolean") {
    return navigatorLike.userAgentData.mobile;
  }

  return MOBILE_USER_AGENT_PATTERN.test(navigatorLike.userAgent ?? "");
}

export function isMeteredConnection(
  connection: NetworkInformationLike | undefined,
  isMobile = isMobileDevice()
) {
  return isMobile && connection?.type === "cellular";
}

function getConnection() {
  if (typeof navigator === "undefined") return undefined;

  return (
    navigator as Navigator & { connection?: NetworkInformationLike }
  ).connection;
}

export function useDataSaver() {
  const { dataSaverEnabled, toggleDataSaver } = useThemeSettings();
  const [isMeteredNetwork, setIsMeteredNetwork] = useState(false);
  const [isNetworkStatusReady, setIsNetworkStatusReady] = useState(false);

  useEffect(() => {
    const connection = getConnection();
    const isMobile = isMobileDevice();
    const updateConnection = () => {
      setIsMeteredNetwork(isMeteredConnection(connection, isMobile));
      setIsNetworkStatusReady(true);
    };

    updateConnection();
    connection?.addEventListener?.("change", updateConnection);
    return () =>
      connection?.removeEventListener?.("change", updateConnection);
  }, []);

  return {
    dataSaverEnabled,
    isMeteredNetwork,
    isNetworkStatusReady,
    isDataSaverActive: dataSaverEnabled && isMeteredNetwork,
    setDataSaverEnabled: toggleDataSaver,
  };
}
