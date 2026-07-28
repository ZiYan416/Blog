import { SafeImage } from "@/components/ui/safe-image"

interface PostHeroCoverProps {
  coverImage: string | null
  title: string
}

export function PostHeroCover({
  coverImage,
  title,
}: PostHeroCoverProps) {
  if (!coverImage) return null

  return (
    <div className="absolute inset-0 opacity-60">
      <SafeImage
        src={coverImage}
        alt={title}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] dark:from-[#050505] via-transparent to-transparent" />
    </div>
  )
}
