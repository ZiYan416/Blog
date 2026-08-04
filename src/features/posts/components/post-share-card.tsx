/* eslint-disable @next/next/no-img-element */
"use client"

import React, { forwardRef } from 'react'
import { Calendar, User } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { formatDateString } from '@/lib/markdown'
import { getTagStyles } from '@/lib/tag-color'
import { siteConfig } from '@/lib/site-config'
import { cn } from '@/lib/utils'

export interface ShareCardPost {
  title: string
  slug: string
  public_id: number
  excerpt: string | null
  cover_image: string | null
  created_at: string
  tags: Array<{ name: string; slug: string }> | string[]
  author?: {
    display_name: string | null
    avatar_url: string | null
  } | null
  url: string
}

interface PostShareCardProps {
  post: ShareCardPost
  className?: string
}

export const PostShareCard = forwardRef<HTMLDivElement, PostShareCardProps>(
  ({ post, className }, ref) => {
    const formattedDate = formatDateString(post.created_at)

    // Normalize tags to string array
    const tagList: string[] = (post.tags || []).map((t) =>
      typeof t === 'string' ? t : t.name
    )

    const authorName = post.author?.display_name || siteConfig.name || 'Anonymous'
    const authorAvatar = post.author?.avatar_url

    return (
      <div
        ref={ref}
        style={{ width: '460px' }}
        className={cn(
          "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-2xl border-2 border-neutral-900 dark:border-neutral-200 shadow-[8px_8px_0px_0px_#171717] dark:shadow-[8px_8px_0px_0px_#f5f5f5] p-6 flex flex-col justify-between overflow-hidden select-none font-sans",
          className
        )}
      >
        {/* Top Header: Brand & Author */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 overflow-hidden shrink-0 flex items-center justify-center">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <User className="w-5 h-5 text-neutral-500" />
              )}
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">{authorName}</div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                {siteConfig.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Cover Image Section */}
        {post.cover_image && (
          <div className="relative w-full aspect-[16/9] mb-4 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          </div>
        )}

        {/* Post Title */}
        <h2 className="text-xl font-extrabold leading-snug tracking-tight mb-3 line-clamp-2">
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {tagList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {tagList.slice(0, 3).map((tag) => {
              const styles = getTagStyles(tag)
              return (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: styles.backgroundColor,
                    color: styles.color,
                  }}
                >
                  #{tag}
                </span>
              )
            })}
          </div>
        )}

        {/* Footer: Read More & QR Code */}
        <div className="pt-4 mt-auto border-t border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-between">
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-black tracking-widest uppercase shadow-sm">
              READ MORE
            </div>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 font-medium">
              扫码阅读完整文章
            </span>
          </div>

          {/* QR Code */}
          <div className="p-1.5 bg-white rounded-xl border-2 border-neutral-900 shadow-sm flex items-center justify-center shrink-0">
            <QRCodeSVG
              value={post.url}
              size={64}
              level="M"
              includeMargin={false}
            />
          </div>
        </div>
      </div>
    )
  }
)

PostShareCard.displayName = 'PostShareCard'
