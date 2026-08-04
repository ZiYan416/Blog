import { describe, expect, it } from "vitest";
import {
  isMeteredConnection,
  isMobileDevice,
} from "@/features/settings/hooks/use-data-saver";

describe("data saver network detection", () => {
  it.each([
    [{ type: "cellular" }, true, true],
    [{ type: "cellular", saveData: true }, false, false],
    [{ type: "cellular", effectiveType: "3g" }, false, false],
    [{ saveData: true }, true, false],
    [{ effectiveType: "slow-2g" }, true, false],
    [{ effectiveType: "2g" }, true, false],
    [{ effectiveType: "3g" }, true, false],
    [{ effectiveType: "4g" }, true, false],
    [{ type: "wifi", effectiveType: "4g" }, true, false],
    [undefined, true, false],
  ])(
    "classifies %o on mobile=%s as metered=%s",
    (connection, isMobile, expected) => {
      expect(isMeteredConnection(connection, isMobile)).toBe(expected);
    }
  );
});

describe("mobile device detection", () => {
  it.each([
    [{ userAgentData: { mobile: true } }, true],
    [{ userAgentData: { mobile: false }, userAgent: "iPhone" }, false],
    [{ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" }, true],
    [{ userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" }, false],
    [undefined, false],
  ])("classifies %o as mobile=%s", (navigatorLike, expected) => {
    expect(isMobileDevice(navigatorLike)).toBe(expected);
  });
});
