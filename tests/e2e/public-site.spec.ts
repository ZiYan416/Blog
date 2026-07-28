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
