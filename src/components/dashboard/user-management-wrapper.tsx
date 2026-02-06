"use client";

import { useState, useEffect } from "react";
import { UserManagement } from "./user-management";
import { UserDetailDialog } from "./user-detail-dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  comment_count?: number;
}

interface UserManagementWrapperProps {
  initialUsers: User[];
  currentUserId: string;
}

export function UserManagementWrapper({
  initialUsers,
  currentUserId,
}: UserManagementWrapperProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    userId: string | null;
  }>({ open: false, userId: null });

  const refreshUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("获取用户列表失败");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("刷新用户列表失败:", error);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: isAdmin })
        .eq("id", userId);

      if (error) throw error;

      toast.success(isAdmin ? "已设为管理员" : "已取消管理员权限");
      refreshUsers();
    } catch (error) {
      console.error("更新权限失败:", error);
      toast.error("操作失败，请重试");
    }
  };

  const handleDeleteUser = (userId: string) => {
    setDeleteDialog({ open: true, userId });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.userId) return;

    try {
      const response = await fetch(`/api/admin/users/${deleteDialog.userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("删除用户失败");

      toast.success("用户已删除");
      refreshUsers();
      setDeleteDialog({ open: false, userId: null });
    } catch (error) {
      console.error("删除用户失败:", error);
      toast.error("删除失败，请重试");
    }
  };

  return (
    <>
      <UserManagement
        users={users}
        currentUserId={currentUserId}
        onEditUser={handleEditUser}
        onToggleAdmin={handleToggleAdmin}
        onDeleteUser={handleDeleteUser}
      />

      <UserDetailDialog
        user={selectedUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refreshUsers}
        currentUserId={currentUserId}
      />

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, userId: deleteDialog.userId })
        }
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除用户？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。该用户的所有数据将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-full bg-red-500 hover:bg-red-600"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
