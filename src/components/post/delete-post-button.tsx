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

export function DeletePostButton({ slug, title }: { slug: string, title: string }) {
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
        toast({
          title: "删除成功",
          description: `文章 "${title}" 已被永久删除。`,
        });
        setOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        toast({
          variant: "destructive",
          title: "删除失败",
          description: data.error || "未知错误，请稍后重试。",
        });
      }
    } catch (error) {
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
          className="rounded-full h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
            您即将删除文章 <span className="font-bold text-foreground">"{title}"</span>。
            <br />
            此操作<span className="font-bold text-red-500">无法撤销</span>，删除后该文章及其所有数据将永久丢失。
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
