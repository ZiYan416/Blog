import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { marked } from 'marked'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateString(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getPostExcerpt(content: string, maxLength: number = 150): string {
  // Remove markdown formatting and get plain text
  const plainText = content
    .replace(/[#*`_\[\]()]/g, '')
    .replace(/\n/g, ' ')
    .trim()

  if (plainText.length <= maxLength) {
    return plainText
  }

  return plainText.slice(0, maxLength).trim() + '...'
}

export function generatePostSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/^-+|-+$/g, '')
}

export function extractTags(content: string): string[] {
  const tagRegex = /#\w+/g
  const tags = content.match(tagRegex) || []
  return tags.map((tag) => tag.slice(1))
}

export function stripHtml(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

// Custom renderer for markdown
export const markedRenderer = new marked.Renderer()

marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    code(code: string, language?: string): string {
      const languageClass = language ? `language-${language}` : ''
      return `<pre class="relative"><code class="${languageClass}">${escapeHtml(code)}</code></pre>`
    },
    heading(text: string, level: number): string {
      const id = text.toLowerCase().replace(/\s+/g, '-')
      return `<h${level} id="${id}" class="scroll-mt-20">${text}</h${level}>`
    },
    link(href: string, title: string, text: string): string {
      return `<a href="${href}" title="${title}" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">${text}</a>`
    },
  },
})

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export async function renderMarkdown(content: string): Promise<string> {
  return marked.parse(content)
}
