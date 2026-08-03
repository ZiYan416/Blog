"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`删除文章：${title}`}
          className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-sm hover:scale-110 transition-all text-red-500 hover:text-red-600 hover:bg-white dark:hover:bg-black"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            确认删除文章？
          </DialogTitle>
          <DialogDescription className="pt-2">
            您即将删除文章 <span className="font-bold text-foreground">&ldquo;{title}&rdquo;</span>。
            <br />
            此操作<span className="font-bold text-red-500">无法撤销</span>。文章删除后，
            系统还会清理仅由该文章引用的博客托管图片；被其他文章复用的图片会保留。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" className="rounded-full" disabled={isDeleting}>
              取消
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            className="rounded-full bg-red-600 hover:bg-red-700"
            onClick={handleDelete}
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
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
