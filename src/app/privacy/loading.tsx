import { Skeleton } from "@/components/ui/skeleton"

export default function PrivacyLoading() {
  return (
    <div className="container max-w-3xl mx-auto px-8 md:px-6 py-12 md:py-24">
      <header className="mb-6 md:mb-8 border-b border-black/5 dark:border-white/5 pb-6 md:pb-8">
        <Skeleton className="h-8 md:h-10 w-48 mb-4" />
        <Skeleton className="h-4 w-32" />
      </header>

      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-full" />
        </div>

        <div className="pt-4 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <div className="pl-4 space-y-2 pt-2">
              <Skeleton className="h-4 w-10/12" />
              <Skeleton className="h-4 w-9/12" />
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <div className="pl-4 space-y-2 pt-2">
              <Skeleton className="h-4 w-10/12" />
              <Skeleton className="h-4 w-8/12" />
              <Skeleton className="h-4 w-9/12" />
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-10/12" />
          </div>
        </div>
      </div>
    </div>
  )
}
