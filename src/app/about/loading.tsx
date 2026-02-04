import { Skeleton } from "@/components/ui/skeleton"

export default function AboutLoading() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-8 md:pt-12 mb-12">
      <div className="w-full max-w-5xl h-auto md:h-[550px]">
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-4 md:gap-6 h-full">

          {/* Card 1: Avatar Skeleton */}
          <div className="md:col-span-1 md:row-span-3 rounded-[2rem] bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 p-8 flex flex-col items-center justify-center min-h-[300px]">
            <Skeleton className="w-32 h-32 md:w-48 md:h-48 rounded-full mb-6" />
            <div className="space-y-3 flex flex-col items-center w-full">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-20 mt-2" />
            </div>
          </div>

          {/* Card 2: Intro Skeleton */}
          <div className="md:col-span-2 md:row-span-2 rounded-[2rem] bg-neutral-900 dark:bg-white p-8 py-10 md:py-8 flex flex-col justify-center min-h-[250px] space-y-4">
            <Skeleton className="h-4 w-32 bg-white/20 dark:bg-black/10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4 bg-white/20 dark:bg-black/10" />
              <Skeleton className="h-8 w-1/2 bg-white/20 dark:bg-black/10" />
            </div>
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full bg-white/20 dark:bg-black/10" />
              <Skeleton className="h-4 w-11/12 bg-white/20 dark:bg-black/10" />
            </div>
            <Skeleton className="h-6 w-24 pt-4 bg-white/20 dark:bg-black/10" />
            <Skeleton className="h-4 w-2/3 bg-white/20 dark:bg-black/10" />
          </div>

          {/* Card 3: GitHub Skeleton */}
          <div className="md:col-span-1 md:row-span-1 rounded-[2rem] bg-[#181717] dark:bg-white p-6 flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <Skeleton className="w-8 h-8 rounded-full bg-white/20 dark:bg-black/10" />
              <Skeleton className="w-5 h-5 rounded-md bg-white/20 dark:bg-black/10" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-20 bg-white/20 dark:bg-black/10" />
              <Skeleton className="h-3 w-16 bg-white/20 dark:bg-black/10" />
            </div>
          </div>

          {/* Card 4: Contact Skeleton */}
          <div className="md:col-span-1 md:row-span-1 rounded-[2rem] bg-blue-300 dark:bg-purple-300 p-6 flex flex-col justify-between min-h-[160px]">
             <div className="flex justify-between items-start">
              <Skeleton className="w-8 h-8 rounded-full bg-white/30" />
              <Skeleton className="w-5 h-5 rounded-md bg-white/30" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-20 bg-white/30" />
              <Skeleton className="h-3 w-16 bg-white/30" />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
