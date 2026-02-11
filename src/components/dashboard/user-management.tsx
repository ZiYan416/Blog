"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Shield,
  ShieldOff,
  Pencil,
  Trash2,
  UserCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string | null;
  comment_count?: number;
}

interface UserManagementProps {
  users: User[];
  currentUserId: string;
  onEditUser: (user: User) => void;
  onToggleAdmin: (userId: string, isAdmin: boolean) => void;
  onDeleteUser: (userId: string) => void;
}

export function UserManagement({
  users,
  currentUserId,
  onEditUser,
  onToggleAdmin,
  onDeleteUser,
}: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "updated_at">("created_at");

  // 过滤和排序用户
  const filteredUsers = users
    .filter((user) => {
      const query = searchQuery.toLowerCase();
      return (
        user.display_name?.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a[sortBy] || 0).getTime();
      const dateB = new Date(b[sortBy] || 0).getTime();
      return dateB - dateA;
    });

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.is_admin).length;
  const activeUsers = users.filter(
    (u) =>
      u.updated_at &&
      new Date(u.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="space-y-6">
      {/* 快速统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.03] dark:border-white/[0.03]">
          <div className="text-xs text-neutral-500 mb-1">总用户数</div>
          <div className="text-2xl font-bold">{totalUsers}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.03] dark:border-white/[0.03]">
          <div className="text-xs text-neutral-500 mb-1">管理员</div>
          <div className="text-2xl font-bold text-purple-500">{adminCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.03] dark:border-white/[0.03]">
          <div className="text-xs text-neutral-500 mb-1">7日活跃</div>
          <div className="text-2xl font-bold text-green-500">{activeUsers}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.03] dark:border-white/[0.03]">
          <div className="text-xs text-neutral-500 mb-1">活跃率</div>
          <div className="text-2xl font-bold text-blue-500">
            {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* 搜索和排序 */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="搜索用户昵称或邮箱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full border-black/[0.08] dark:border-white/[0.08]"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "created_at" ? "default" : "outline"}
            onClick={() => setSortBy("created_at")}
            className="rounded-full"
            size="sm"
          >
            按加入时间
          </Button>
          <Button
            variant={sortBy === "updated_at" ? "default" : "outline"}
            onClick={() => setSortBy("updated_at")}
            className="rounded-full"
            size="sm"
          >
            按最后活跃时间
          </Button>
        </div>
      </div>

      {/* 用户列表表格 */}
      <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-black/[0.03] dark:border-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-black/[0.03] dark:border-white/[0.03]">
                <TableHead className="w-[300px] min-w-[250px]">用户</TableHead>
                <TableHead className="min-w-[120px]">角色</TableHead>
                <TableHead className="min-w-[120px]">加入时间</TableHead>
                <TableHead className="min-w-[100px]">最后活跃</TableHead>
                <TableHead className="text-center min-w-[80px]">评论数</TableHead>
                <TableHead className="text-right min-w-[80px]">操作</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-black/[0.03] dark:border-white/[0.03] hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  {/* 用户信息 */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center shrink-0">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.display_name || user.email}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCircle className="w-6 h-6 text-neutral-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {user.display_name || "未设置昵称"}
                        </div>
                        <div className="text-xs text-neutral-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* 角色 */}
                  <TableCell>
                    {user.is_admin ? (
                      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-none">
                        <Shield className="w-3 h-3 mr-1" />
                        管理员
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-neutral-500">
                        普通用户
                      </Badge>
                    )}
                  </TableCell>

                  {/* 加入时间 */}
                  <TableCell className="text-sm text-neutral-600 dark:text-neutral-400">
                    {new Date(user.created_at).toLocaleDateString("zh-CN")}
                  </TableCell>

                  {/* 最后活跃 */}
                  <TableCell className="text-sm text-neutral-600 dark:text-neutral-400">
                    {user.updated_at
                      ? formatDistanceToNow(new Date(user.updated_at), {
                          addSuffix: true,
                          locale: zhCN,
                        })
                      : "从未登录"}
                  </TableCell>

                  {/* 评论数 */}
                  <TableCell className="text-center text-sm font-medium">
                    {user.comment_count || 0}
                  </TableCell>

                  {/* 操作 */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onEditUser(user)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          编辑资料
                        </DropdownMenuItem>
                        {user.id !== currentUserId && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onToggleAdmin(user.id, !user.is_admin)}
                            >
                              {user.is_admin ? (
                                <>
                                  <ShieldOff className="w-4 h-4 mr-2" />
                                  取消管理员
                                </>
                              ) : (
                                <>
                                  <Shield className="w-4 h-4 mr-2" />
                                  设为管理员
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDeleteUser(user.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除用户
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-neutral-400">
                  未找到匹配的用户
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}
