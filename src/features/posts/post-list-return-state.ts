export type PostSort = "latest" | "oldest" | "views"

export const POST_LIST_RETURN_STATE_KEY = "post_list_return_state_v3"
export const LEGACY_POST_LIST_STATE_KEYS = [
  "post_list_return_state_v2",
  "post_list_state",
] as const

export const POST_LIST_HISTORY_ENTRY_KEY = "__blogPostListReturnKey"
export const POST_DETAIL_HISTORY_ENTRY_KEY = "__blogPostDetailReturnKey"

export interface PostListReturnState {
  page: number
  sort: PostSort
  scrollY: number
  pathname: string
  detailPathname: string
  returnKey: string
  detailEntryKey?: string
}

export function readPostListReturnState(
  storage: Pick<Storage, "getItem"> = sessionStorage
): PostListReturnState | null {
  const raw = storage.getItem(POST_LIST_RETURN_STATE_KEY)
  if (!raw) return null

  try {
    const saved = JSON.parse(raw) as Partial<PostListReturnState>
    if (
      typeof saved.page !== "number" ||
      !["latest", "oldest", "views"].includes(saved.sort || "") ||
      typeof saved.scrollY !== "number" ||
      typeof saved.pathname !== "string" ||
      typeof saved.detailPathname !== "string" ||
      typeof saved.returnKey !== "string"
    ) {
      return null
    }
    return saved as PostListReturnState
  } catch {
    return null
  }
}
