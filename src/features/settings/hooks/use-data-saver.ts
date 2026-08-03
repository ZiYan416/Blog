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

export function isMeteredConnection(
  connection: NetworkInformationLike | undefined
) {
  if (!connection) return false;

  return (
    connection.saveData === true ||
    connection.type === "cellular" ||
    ["slow-2g", "2g", "3g"].includes(connection.effectiveType ?? "")
  );
}

function getConnection() {
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
    const updateConnection = () => {
      setIsMeteredNetwork(isMeteredConnection(connection));
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
