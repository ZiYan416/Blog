import { PostForm } from "@/features/posts/components/post-form"

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PostForm mode="edit" postId={id} />
}
