"use client"

import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from '@tiptap/react'
import { CodeBlockShell } from '@/components/post/code-block-shell'

function EditorCodeBlockNode({ node }: NodeViewProps) {
  const language = (node.attrs.language || 'text').toLowerCase()
  const copyText = node.textContent || ''

  return (
    <NodeViewWrapper className="not-prose">
      <CodeBlockShell language={language} onCopy={() => navigator.clipboard.writeText(copyText)}>
        <pre className="article-code-block__pre">
          <NodeViewContent
            as="code"
            className={language === 'text' ? 'hljs' : `hljs language-${language}`}
          />
        </pre>
      </CodeBlockShell>
    </NodeViewWrapper>
  )
}

export const ArticleCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(EditorCodeBlockNode)
  },
})
