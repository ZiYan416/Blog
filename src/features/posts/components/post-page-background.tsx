import { SafeImage } from "@/components/ui/safe-image"
import { getHighResolutionImageUrl } from "@/features/posts/image-url"

interface PostPageBackgroundProps {
  coverImage: string | null
}

const edgeBlurMask = {
  WebkitMaskImage:
    "radial-gradient(ellipse 72% 62% at 50% 30%, transparent 38%, rgba(0, 0, 0, 0.28) 64%, #000 100%)",
  maskImage:
    "radial-gradient(ellipse 72% 62% at 50% 30%, transparent 38%, rgba(0, 0, 0, 0.28) 64%, #000 100%)",
}

export function PostPageBackground({
  coverImage,
}: PostPageBackgroundProps) {
  const displayCoverImage = coverImage
    ? getHighResolutionImageUrl(coverImage)
    : null

  return (
    <div
      aria-hidden="true"
      data-post-background
      data-has-cover={Boolean(coverImage)}
      className="pointer-events-none absolute inset-x-0 -top-16 z-0 h-[660px] overflow-hidden bg-[#fafafa] sm:h-[700px] md:h-[780px] dark:bg-[#050505]"
    >
      {displayCoverImage ? (
        <div className="absolute -inset-[4vmax]">
          <SafeImage
            src={displayCoverImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-[1.06] object-cover object-center"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-800 to-[#fafafa] dark:from-black dark:via-neutral-950 dark:to-[#050505]" />
      )}

      <div
        className="absolute inset-0 backdrop-blur-[24px]"
        style={edgeBlurMask}
      />

      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background:
            "radial-gradient(ellipse 84% 74% at 50% 30%, transparent 34%, rgba(250, 250, 250, 0.18) 58%, rgba(250, 250, 250, 0.94) 100%), linear-gradient(to bottom, rgba(0, 0, 0, 0.64) 0%, rgba(0, 0, 0, 0.24) 36%, rgba(250, 250, 250, 0.42) 64%, #fafafa 100%)",
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(ellipse 84% 74% at 50% 30%, transparent 34%, rgba(5, 5, 5, 0.18) 58%, rgba(5, 5, 5, 0.95) 100%), linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.32) 36%, rgba(5, 5, 5, 0.56) 64%, #050505 100%)",
        }}
      />
    </div>
  )
}
