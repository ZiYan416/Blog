import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "../src/lib/auth";

describe("getSafeRedirectPath", () => {
  it("accepts local paths and preserves query strings", () => {
    expect(getSafeRedirectPath("/post?page=2")).toBe("/post?page=2");
  });

  it.each([
    "https://example.com",
    "//example.com",
    "javascript:alert(1)",
    "/auth/callback?next=/dashboard",
    "/auth/success",
  ])("rejects unsafe redirect %s", (value) => {
    expect(getSafeRedirectPath(value)).toBe("/dashboard");
  });
});
