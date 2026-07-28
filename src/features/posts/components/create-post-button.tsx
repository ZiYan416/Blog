"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"

export function CreatePostButton() {
  const { isAdmin, loading } = useAuth()

  if (loading || !isAdmin) return null

  return (
    <Button
      asChild
      className="w-full md:w-auto rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 h-9 md:h-10"
    >
      <Link href="/admin/posts/new">
        <Plus className="w-4 h-4 mr-2" />
        <span>新建文章</span>
      </Link>
    </Button>
  )
}
