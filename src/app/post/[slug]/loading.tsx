import { Skeleton } from "@/components/ui/skeleton"

export default function PostLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-12 md:pb-24">
      {/* Hero Header Skeleton */}
      <div className="relative w-full h-[35vh] min-h-[300px] md:h-[40vh] md:min-h-[350px] bg-neutral-900 dark:bg-black overflow-hidden">
        <div className="absolute inset-0 bg-neutral-800 animate-pulse" />

        <div className="container max-w-6xl mx-auto px-6 h-full flex flex-col justify-end md:justify-start md:pt-24 pb-12 relative z-10">
          <div className="space-y-4 pt-16 md:pt-0">
             {/* Back Button Skeleton */}
            <div className="absolute top-4 left-6 md:static z-30">
               <div className="h-10 w-24 rounded-full bg-white/10 backdrop-blur-md" />
            </div>

            {/* Title Skeleton */}
            <Skeleton className="h-10 md:h-14 w-3/4 bg-white/10" />

            {/* Meta Pills Skeleton */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <Skeleton className="h-6 md:h-8 w-24 rounded-full bg-white/10" />
              <Skeleton className="h-6 md:h-8 w-20 rounded-full bg-white/10" />
              <Skeleton className="h-6 md:h-8 w-20 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-0 md:px-6 -mt-4 md:-mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Main Content Skeleton */}
          <div className="bg-white dark:bg-neutral-900 rounded-none md:rounded-3xl p-5 md:p-10 shadow-none md:shadow-xl border-none md:border border-black/5 dark:border-white/5 min-h-[50vh]">
             {/* Mobile TOC Skeleton */}
            <div className="lg:hidden mb-8 p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-black/5 dark:border-white/5 space-y-4">
               <Skeleton className="h-5 w-16" />
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Article Content Skeletons */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              <Skeleton className="h-48 md:h-64 w-full rounded-xl my-8" />

              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>

             {/* Mobile Author Card Skeleton */}
            <div className="lg:hidden mt-8 md:mt-12 mb-0 pt-8 border-t border-dashed border-black/10 dark:border-white/10">
               <div className="bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl p-6 flex flex-col items-center text-center border border-black/5 dark:border-white/5">
                 <Skeleton className="h-4 w-24 mb-6" />
                 <Skeleton className="w-16 h-16 rounded-full mb-4" />
                 <Skeleton className="h-6 w-32 mb-2" />
                 <Skeleton className="h-4 w-48" />
               </div>
            </div>
          </div>

          {/* Desktop Sidebar Skeleton */}
          <div className="hidden lg:flex flex-col gap-6">
             <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 p-6 h-[200px]">
                <Skeleton className="h-full w-full" />
             </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5">
              <Skeleton className="h-4 w-24 mb-6 mx-auto" />
              <div className="flex flex-col items-center">
                <Skeleton className="w-20 h-20 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-4" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
