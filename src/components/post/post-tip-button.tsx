"use client"

import { Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SafeImage } from '@/components/ui/safe-image'

interface PostTipButtonProps {
  alipayQr?: string | null
  wechatQr?: string | null
  authorName: string
}

export function PostTipButton({ alipayQr, wechatQr, authorName }: PostTipButtonProps) {
  const [activeTab, setActiveTab] = useState<'wechat' | 'alipay'>(wechatQr ? 'wechat' : 'alipay')

  if (!alipayQr && !wechatQr) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-4 gap-2 rounded-full border-amber-200 bg-amber-50/50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-amber-500 dark:hover:bg-amber-900/30">
          <Coffee className="w-4 h-4" />
          <span className="font-bold">赞赏作者</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-xl">赞赏 {authorName}</DialogTitle>
          <DialogDescription className="text-center">
            如果这篇文章对您有帮助，可以请作者喝杯咖啡 ☕
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          <div className="flex gap-2 mb-6 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-full">
            {wechatQr && (
              <button
                onClick={() => setActiveTab('wechat')}
                className={cn(
                  "px-6 py-1.5 rounded-full text-sm font-medium transition-all",
                  activeTab === 'wechat' ? "bg-white dark:bg-neutral-700 shadow-sm text-green-600" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                )}
              >
                微信支付
              </button>
            )}
            {alipayQr && (
              <button
                onClick={() => setActiveTab('alipay')}
                className={cn(
                  "px-6 py-1.5 rounded-full text-sm font-medium transition-all",
                  activeTab === 'alipay' ? "bg-white dark:bg-neutral-700 shadow-sm text-blue-600" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                )}
              >
                支付宝
              </button>
            )}
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-3xl border border-black/5 dark:border-white/5 shadow-inner">
            {activeTab === 'wechat' && wechatQr && (
              <div className="flex flex-col items-center gap-4">
                <SafeImage src={wechatQr} alt="微信赞赏码" width={224} height={224} sizes="(min-width: 640px) 224px, 192px" className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl" />
                <span className="text-sm font-medium text-green-600 flex items-center gap-1">微信扫一扫，赞赏作者</span>
              </div>
            )}
            
            {activeTab === 'alipay' && alipayQr && (
              <div className="flex flex-col items-center gap-4">
                <SafeImage src={alipayQr} alt="支付宝赞赏码" width={224} height={224} sizes="(min-width: 640px) 224px, 192px" className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl" />
                <span className="text-sm font-medium text-blue-600 flex items-center gap-1">打开支付宝扫一扫</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
