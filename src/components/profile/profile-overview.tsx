"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, Calendar, User as UserIcon, Activity, FileText, ArrowUpRight } from "lucide-react";
import { getCardStyle } from "@/lib/card-styles";
import { cn } from "@/lib/utils";
import { type User } from "@supabase/supabase-js";
import Link from "next/link";

interface ProfileOverviewProps {
  user: User;
  profile: {
    display_name: string;
    bio: string;
    website: string;
    avatar_url: string;
    card_bg: string;
  };
  stats: {
    commentsCount: number;
    activeDays: number;
    lastActive?: string;
    joinedDate?: string;
  };
  recentActivity: any[]; // Explicit type to be refined later
}

export function ProfileOverview({ user, profile, stats, recentActivity }: ProfileOverviewProps) {
  return (
    <div className="space-y-8">
      {/* Top Section: Info Card + Stats */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Personal Card */}
        <div className="md:col-span-2">
            <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl p-0 overflow-hidden md:h-full flex flex-col text-center">
              <div className={cn("h-32 w-full relative transition-all duration-500", getCardStyle(profile.card_bg).class)}>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24">
                  <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden border-4 border-white dark:border-neutral-900">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-10 h-10 text-neutral-400" />
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-14 px-8 pb-8 md:flex-1 md:flex md:flex-col">
                <div className="mb-0">
                  <h3 className="font-bold text-lg mb-1 truncate">{profile.display_name || "您的名称"}</h3>
                  <p className="text-xs text-neutral-500 truncate mb-6">{user.email}</p>
                </div>

                <div className="md:mt-auto pt-6 border-t border-black/5 dark:border-white/5">
                    {profile.bio ? (
                        <p className="text-xs text-neutral-400 leading-relaxed italic">
                            "{profile.bio}"
                        </p>
                    ) : (
                        <p className="text-xs text-neutral-400 italic">
                            这个用户很懒，还没有写简介...
                        </p>
                    )}
                </div>
              </div>
            </Card>
        </div>

        {/* Stats Column */}
        <div className="space-y-4 flex flex-col justify-center">
            {/* Stat 1: Comments */}
            <Card className="border border-black/5 dark:border-white/5 shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-neutral-600 dark:text-neutral-400 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{stats.commentsCount}</div>
                        <div className="text-xs text-neutral-500 font-medium">历史评论</div>
                    </div>
                </CardContent>
            </Card>

             {/* Stat 2: Last Active */}
             <Card className="border border-black/5 dark:border-white/5 shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-neutral-600 dark:text-neutral-400 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{stats.lastActive || "刚刚"}</div>
                        <div className="text-xs text-neutral-500 font-medium">上次活跃</div>
                    </div>
                </CardContent>
            </Card>

            {/* Stat 3: Active Days */}
            <Card className="border border-black/5 dark:border-white/5 shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-neutral-600 dark:text-neutral-400 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                {stats.activeDays} <span className="text-xs font-normal text-neutral-400">天</span>
                            </div>
                            {stats.joinedDate && (
                                <span className="text-xs text-neutral-400 font-normal">
                                    {stats.joinedDate}
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-neutral-500 font-medium">加入天数</div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <h3 className="text-xl font-bold mb-4 px-2">最近动态</h3>
        <div className="space-y-4">
            {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((comment) => (
                    <Card key={comment.id} className="border border-black/5 dark:border-white/5 shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row md:items-stretch">
                                {/* Left: Comment Content */}
                                <div className="p-6 flex-1 flex flex-col justify-center">
                                     <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-medium text-neutral-400">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                        <span className="text-xs text-neutral-300 dark:text-neutral-700">•</span>
                                        <span className="text-xs font-medium text-neutral-500">
                                            发表评论
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2 leading-relaxed italic">
                                        "{comment.content}"
                                    </p>
                                </div>

                                {/* Right: Article Context */}
                                {comment.posts && (
                                    <Link
                                        href={`/post/${comment.posts.slug}`}
                                        className="relative md:w-1/3 border-t md:border-t-0 md:border-l border-black/5 dark:border-white/5 flex flex-col group/article overflow-hidden"
                                    >
                                        {/* Cover Image Background */}
                                        {comment.posts.cover_image ? (
                                            <>
                                                <div className="absolute inset-0 z-0">
                                                    <img
                                                        src={comment.posts.cover_image}
                                                        alt=""
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/article:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 group-hover/article:bg-black/40 transition-colors" />
                                                </div>
                                                <div className="relative z-10 p-6 h-full flex flex-col justify-center">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-white/90 uppercase tracking-wider flex items-center gap-1">
                                                            <FileText className="w-3 h-3" />
                                                            相关文章
                                                        </span>
                                                        <ArrowUpRight className="w-4 h-4 text-white/90" />
                                                    </div>
                                                    <h4 className="font-bold text-sm text-white line-clamp-2 mb-1">
                                                        {comment.posts.title}
                                                    </h4>
                                                    {comment.posts.excerpt && (
                                                        <p className="text-xs text-white/80 line-clamp-1">
                                                            {comment.posts.excerpt}
                                                        </p>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-6 h-full flex flex-col justify-center bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                     <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                                                        <FileText className="w-3 h-3" />
                                                        相关文章
                                                     </span>
                                                     <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover/article:text-black dark:group-hover/article:text-white transition-colors" />
                                                </div>
                                                <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 line-clamp-2 mb-1 group-hover/article:underline decoration-neutral-400/50 underline-offset-4">
                                                    {comment.posts.title}
                                                </h4>
                                                 {comment.posts.excerpt && (
                                                    <p className="text-xs text-neutral-500 line-clamp-1">
                                                        {comment.posts.excerpt}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </Link>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
                    <MessageSquare className="w-8 h-8 mx-auto text-neutral-300 mb-3" />
                    <p className="text-sm text-neutral-500">暂无评论动态</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
