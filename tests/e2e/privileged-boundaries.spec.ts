import { expect, test } from "@playwright/test"

const unknownId = "00000000-0000-4000-8000-000000000001"

test("anonymous visitors cannot publish an article", async ({ request }) => {
  const response = await request.post("/api/posts/create", {
    data: {
      title: "E2E unauthorized publish",
      slug: "e2e-unauthorized-publish",
      content: "This request must be rejected before any write.",
      tags: [],
      published: true,
    },
  })

  expect(response.status()).toBe(401)
})

test("anonymous visitors cannot moderate comments", async ({ request }) => {
  const response = await request.patch(`/api/admin/comments/${unknownId}`)
  expect(response.status()).toBe(401)
})

test("anonymous visitors cannot toggle administrator permissions", async ({
  request,
}) => {
  const response = await request.patch(
    `/api/admin/users/${unknownId}/toggle-admin`,
    { data: { is_admin: true } }
  )
  expect(response.status()).toBe(401)
})
