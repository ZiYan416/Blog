import { describe, expect, it } from "vitest";
import { isMeteredConnection } from "@/features/settings/hooks/use-data-saver";

describe("data saver network detection", () => {
  it.each([
    [{ saveData: true }, true],
    [{ type: "cellular" }, true],
    [{ effectiveType: "slow-2g" }, true],
    [{ effectiveType: "2g" }, true],
    [{ effectiveType: "3g" }, true],
    [{ effectiveType: "4g" }, false],
    [{ type: "wifi", effectiveType: "4g" }, false],
    [undefined, false],
  ])("classifies %o as metered=%s", (connection, expected) => {
    expect(isMeteredConnection(connection)).toBe(expected);
  });
});
