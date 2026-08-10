"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeletePostButton({
  slug,
  title,
  onDeleted,
}: {
  slug: string
  title: string
  onDeleted?: () => void
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${slug}/delete`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json() as {
          imageCleanup?: { failed?: unknown[] }
        };
        const failedCleanupCount = data.imageCleanup?.failed?.length || 0;
        toast({
          title: "删除成功",
          description: failedCleanupCount > 0
            ? `文章 "${title}" 已删除；${failedCleanupCount} 张图片需稍后手动清理。`
            : `文章 "${title}" 及其未被引用的托管图片已删除。`,
        });
        setOpen(false);
        if (onDeleted) {
          onDeleted();
        } else {
          router.refresh();
        }
      } else {
        const data = await res.json();
        toast({
          variant: "destructive",
          title: "删除失败",
          description: data.error || "未知错误，请稍后重试。",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "网络错误",
        description: "无法连接到服务器，请检查您的网络。",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        // Keep the confirmation visible while the destructive request is in
        // flight, even if the user presses Escape or clicks the overlay.
        if (!isDeleting) {
          setOpen(nextOpen);
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`删除文章：${title}`}
          className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-sm hover:scale-110 transition-all text-red-500 hover:text-red-600 hover:bg-white dark:hover:bg-black"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            确认删除文章？
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2">
            您即将删除文章 <span className="font-bold text-foreground">&ldquo;{title}&rdquo;</span>。
            <br />
            此操作<span className="font-bold text-red-500">无法撤销</span>。文章删除后，
            系统还会清理仅由该文章引用的博客托管图片；被其他文章复用的图片会保留。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="rounded-full" disabled={isDeleting}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-full bg-red-600 hover:bg-red-700"
            onClick={(event) => {
              // AlertDialogAction closes by default. Keep it open until the
              // request succeeds so failures remain actionable.
              event.preventDefault();
              void handleDelete();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                删除中...
              </>
            ) : (
              "确认删除"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
