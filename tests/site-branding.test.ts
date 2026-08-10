import { describe, expect, it } from "vitest"
import { metadata as privacyMetadata } from "@/app/privacy/page"
import { siteConfig } from "@/lib/site-config"

describe("site branding", () => {
  it("uses Jay's Blog as the default public site name", () => {
    expect(siteConfig.name).toBe("Jay's Blog")
  })

  it("lets the root metadata template append the site name once", () => {
    expect(privacyMetadata.title).toBe("隐私政策")
  })
})
