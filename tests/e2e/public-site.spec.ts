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

test("mobile public post list aligns sorting with the page heading", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium")
  await page.goto("/post")

  await expect(page.getByRole("link", { name: "新建文章" })).toHaveCount(0)
  const heading = page.getByRole("heading", { name: "全部文章" })
  const sortButton = page.getByRole("button", { name: "选择文章排序方式" })
  await expect(heading).toBeVisible()
  await expect(sortButton).toBeVisible()

  const [headingBox, sortBox] = await Promise.all([
    heading.boundingBox(),
    sortButton.boundingBox(),
  ])
  expect(headingBox).not.toBeNull()
  expect(sortBox).not.toBeNull()
  expect(Math.abs((headingBox?.y ?? 0) - (sortBox?.y ?? 0))).toBeLessThan(12)
})

test("about page presents the profile and sites within one viewport", async ({
  page,
}) => {
  await page.goto("/about")
  await expect(page.getByRole("status", { name: "网站正在加载" })).toBeHidden({
    timeout: 10_000,
  })

  await expect(
    page.getByRole("heading", { name: /你好，我是 SuziJay/ })
  ).toBeVisible()
  await expect(page.getByText(/AISTATS 2026 论文作者/)).toBeVisible()
  await expect(page.getByRole("link", { name: /808 Page/ })).toHaveAttribute(
    "href",
    "https://808-page.vercel.app"
  )

  const viewport = await page.evaluate(() => ({
    clientHeight: document.documentElement.clientHeight,
    scrollHeight: document.documentElement.scrollHeight,
  }))

  expect(viewport.scrollHeight).toBeLessThanOrEqual(viewport.clientHeight + 1)

  const layout = await page.evaluate(() => {
    const navbarContainer = document.querySelector("header > div")
    const aboutContainer = document.querySelector(
      '[data-testid="about-content"]'
    )
    const poster = document.querySelector('[data-testid="about-poster"]')
    const video = document.querySelector<HTMLVideoElement>(
      '[data-testid="about-video"]'
    )
    const navbarRect = navbarContainer?.getBoundingClientRect()
    const aboutRect = aboutContainer?.getBoundingClientRect()

    return {
      leftDifference:
        navbarRect && aboutRect
          ? Math.abs(navbarRect.left - aboutRect.left)
          : Number.POSITIVE_INFINITY,
      rightDifference:
        navbarRect && aboutRect
          ? Math.abs(navbarRect.right - aboutRect.right)
          : Number.POSITIVE_INFINITY,
      poster: video?.poster || "",
      source: video?.currentSrc || video?.src || "",
      fallbackImage: poster ? getComputedStyle(poster).backgroundImage : "",
    }
  })

  expect(layout.leftDifference).toBeLessThanOrEqual(1)
  expect(layout.rightDifference).toBeLessThanOrEqual(1)
  expect(layout.source).toContain("/videos/about/aquarium-loop-v1.mp4")
  expect(layout.poster).toContain("/videos/about/aquarium-poster-v1.jpg")
  expect(layout.fallbackImage).toContain("/videos/about/aquarium-poster-v1.jpg")
  await expect(page.getByTestId("about-video-buffer")).toHaveCount(0)
})

test("first visit shows a global data saver notice on metered connections", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: {
        effectiveType: "4g",
        saveData: true,
        type: "cellular",
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      },
    })
  })
  await page.goto("/post")

  await expect(page.getByRole("status", { name: "节流模式提示" })).toBeVisible()
  await expect(page.getByText("当前网络可能按流量计费，背景视频已暂停。")).toBeVisible()

  await page.getByRole("button", { name: "关闭节流" }).click()
  await expect(page.getByRole("status", { name: "节流模式提示" })).toHaveCount(0)
  await page.goto("/about")
  await expect(page.getByTestId("about-video")).toHaveCount(1)
})

test("about page keeps the fish poster when the video request fails", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium")

  await page.route("**/videos/about/aquarium-loop-v1.mp4", (route) =>
    route.abort()
  )
  await page.goto("/about")
  await expect(page.getByRole("status", { name: "网站正在加载" })).toBeHidden({
    timeout: 10_000,
  })

  await expect(page.getByTestId("about-poster")).toHaveCSS(
    "background-image",
    /aquarium-poster-v1\.jpg/
  )
  await expect(page.getByTestId("about-video")).toHaveCSS("opacity", "0")
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
      page.locator("[data-post-hero]:visible"),
      post.title
    ).toBeVisible()
  }
})
