import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

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
  // Enhanced markdown stripping
  const plainText = content
    // Headers
    .replace(/^#+\s+/gm, '')
    // Bold/Italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Images ![alt](url) -> [图片] or remove
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
    // Blockquotes
    .replace(/^>\s+/gm, '')
    // Code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Inline code
    .replace(/`([^`]+)`/g, '$1')
    // Lists
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove extra whitespace
    .replace(/\n+/g, ' ')
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
