import { expect, test } from "@playwright/test"

test("Logo loader hands off only after the hero can render", async ({ page }) => {
  await page.goto("/")

  const loader = page.getByRole("status", { name: "网站正在加载" })
  await expect(loader).toBeVisible()
  await expect(loader).toBeHidden({ timeout: 10_000 })
  await expect
    .poll(() =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll("video")).some(
          (video) => video.currentSrc && video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA
        )
      )
    )
    .toBe(true)
  await expect(page.locator("main h1").first()).toBeVisible()
})

test("desktop hero content stays centered inside the train window", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium")
  await page.setViewportSize({ width: 2500, height: 1210 })
  await page.goto("/")
  await expect(page.getByRole("status", { name: "网站正在加载" })).toBeHidden({
    timeout: 10_000,
  })

  const metrics = await page.locator("[data-hero-content]").evaluate((content) => {
    const section = content.closest("section")?.getBoundingClientRect()
    const contentBox = content.getBoundingClientRect()
    const childBoxes = Array.from(content.children, (child) =>
      child.getBoundingClientRect()
    )

    if (!section || childBoxes.length === 0) {
      throw new Error("Hero alignment geometry is unavailable")
    }

    const groupTop = Math.min(...childBoxes.map((box) => box.top))
    const groupBottom = Math.max(...childBoxes.map((box) => box.bottom))

    return {
      topRatio: (contentBox.top - section.top) / section.height,
      bottomRatio: (section.bottom - contentBox.bottom) / section.height,
      contentCenter: contentBox.top + contentBox.height / 2,
      groupCenter: (groupTop + groupBottom) / 2,
    }
  })

  expect(metrics.topRatio).toBeCloseTo(0.04, 2)
  expect(metrics.bottomRatio).toBeCloseTo(0.13, 2)
  expect(Math.abs(metrics.groupCenter - metrics.contentCenter)).toBeLessThan(2)

  await page.screenshot({
    path: testInfo.outputPath("hero-window-centered.png"),
    fullPage: false,
  })
})

test("public article navigation remains available without authentication", async ({
  page,
}) => {
  await page.goto("/post")
  await expect(page.getByRole("heading", { name: /文章/ }).first()).toBeVisible()
  if ((page.viewportSize()?.width || 0) < 768) {
    await page.getByRole("button", { name: "打开移动导航菜单" }).click()
    await expect(
      page.getByRole("navigation", { name: "移动端主导航" })
    ).toBeVisible()
  } else {
    await expect(page.getByRole("navigation", { name: "主导航" })).toBeVisible()
  }
})

test("published article detail pages render without server errors", async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium")
  test.setTimeout(180_000)
  const listResponse = await request.get("/api/posts?page=1&limit=50&sort=latest")
  expect(listResponse.ok()).toBe(true)
  const { posts } = (await listResponse.json()) as {
    posts: Array<{ slug: string; title: string }>
  }

  for (const post of posts) {
    const response = await page.goto(
      `/post/${encodeURIComponent(post.slug)}`
    )
    expect(response?.status(), post.title).toBeLessThan(500)
    await expect(
      page.locator("[data-post-hero]"),
      post.title
    ).toBeVisible()
  }
})
