import "server-only"

import { revalidateTag } from "next/cache"

export function invalidatePublishedPosts() {
  revalidateTag("posts", "max")
  revalidateTag("tags", "max")
}

export function invalidatePublishedComments() {
  revalidateTag("comments", "max")
}
