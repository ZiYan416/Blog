import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { marked } from 'marked'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateString(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return format(date, 'PPP', { locale: zhCN })
}

export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 300 // Chinese reading speed
  const text = content.replace(/[#*`_\[\]()]/g, '').replace(/\n/g, ' ').trim()
  const stats = text.length // Simple character count for Chinese
  const minutes = Math.ceil(stats / wordsPerMinute)
  return `${minutes} 分钟阅读`
}

export function getPostExcerpt(content: string, maxLength: number = 150): string {
  // Remove markdown formatting and get plain text
  const plainText = content
    .replace(/[#*`_\[\]()]/g, '')
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\n/g, ' ')
    .trim()

  if (plainText.length <= maxLength) {
    return plainText
  }

  return plainText.slice(0, maxLength).trim() + '...'
}

import pinyin from 'pinyin'

export function generatePostSlug(title: string): string {
  const pinyinTitle = pinyin(title, {
    style: pinyin.STYLE_NORMAL, // No tones
    heteronym: false
  }).flat().join('-')

  return pinyinTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens
}

export function extractTags(content: string): string[] {
  const tagRegex = /#[\w\u4e00-\u9fa5]+/g // Match hash tags including Chinese
  const tags = content.match(tagRegex) || []
  return tags.map((tag) => tag.slice(1))
}

export function autoClassifyTags(content: string, existingTags: string[]): string[] {
  if (!content || !existingTags.length) return []

  const contentLower = content.toLowerCase()
  const matches: { tag: string; count: number }[] = []

  existingTags.forEach(tag => {
    // Escape special regex characters in tag
    const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Create regex to match whole word if possible, or just the string for Chinese
    // For simplicity, we'll check for the string existence
    const index = contentLower.indexOf(tag.toLowerCase())

    if (index !== -1) {
      // Calculate relevance score (simple frequency or position)
      // For now, simple existence is enough
      matches.push({ tag, count: 1 })
    }
  })

  // Return all matched tags, maybe limit if too many?
  return matches.map(m => m.tag)
}

// Custom renderer for markdown
const renderer = new marked.Renderer()

// Override specific renderer methods if needed
renderer.link = (href, title, text) => {
  return `<a href="${href}" title="${title || ''}" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">${text}</a>`
}

marked.setOptions({
  gfm: true,
  breaks: true,
  renderer
})

export async function renderMarkdown(content: string): Promise<string> {
  return marked.parse(content)
}
