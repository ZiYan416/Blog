// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SiteBrandName } from "@/components/ui/site-brand-name";

afterEach(cleanup);

describe("SiteBrandName", () => {
  it("renders continuous accessible text with the split brand fonts", () => {
    render(<SiteBrandName data-testid="site-brand-name" />);

    const brand = screen.getByTestId("site-brand-name");
    const jay = brand.querySelector(".font-pixel");
    const suffix = brand.querySelector(".font-serif");

    expect(brand.textContent).toBe("Jay's Blog");
    expect(jay?.textContent).toBe("Jay");
    expect(jay?.classList.contains("font-pixel")).toBe(true);
    expect(jay?.classList.contains("not-italic")).toBe(true);
    expect(jay?.classList.contains("font-semibold")).toBe(true);
    expect(suffix?.textContent).toBe("'s Blog");
    expect(suffix?.classList.contains("font-serif")).toBe(true);
    expect(suffix?.classList.contains("italic")).toBe(true);
  });
});
