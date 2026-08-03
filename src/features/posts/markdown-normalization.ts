const MARKDOWN_IMAGE_BEFORE_HEADING =
  /(!\[[^\]\n]*\]\((?:\\.|[^)\n])*\))[ \t]*(#{1,6}[ \t]+)/g
const HTML_IMAGE_BEFORE_HEADING =
  /(<img\b[^>]*>)[ \t]*(#{1,6}[ \t]+)/gi

export function normalizeMarkdownBlockBoundaries(content: string) {
  let fence: { marker: string; length: number } | null = null

  return content
    .split("\n")
    .map((line) => {
      const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/)
      if (fenceMatch) {
        const marker = fenceMatch[1][0]
        if (!fence) {
          fence = { marker, length: fenceMatch[1].length }
        } else if (
          fence.marker === marker &&
          fenceMatch[1].length >= fence.length
        ) {
          fence = null
        }
        return line
      }
      if (fence) return line

      const replaceBoundary = (
        match: string,
        image: string,
        heading: string,
        offset: number
      ) => {
        const backticksBefore = line.slice(0, offset).match(/(?<!\\)`/g)?.length || 0
        return backticksBefore % 2 === 0
          ? `${image}\n\n${heading}`
          : match
      }

      return line
        .replace(MARKDOWN_IMAGE_BEFORE_HEADING, replaceBoundary)
        .replace(HTML_IMAGE_BEFORE_HEADING, replaceBoundary)
    })
    .join("\n")
}

export function insertMarkdownBlocks(
  content: string,
  start: number,
  end: number,
  blocks: string[]
) {
  const before = content.slice(0, start)
  const after = content.slice(end)
  const leadingBreak = before
    ? before.endsWith("\n\n")
      ? ""
      : before.endsWith("\n")
        ? "\n"
        : "\n\n"
    : ""
  const trailingBreak = after
    ? after.startsWith("\n\n")
      ? ""
      : after.startsWith("\n")
        ? "\n"
        : "\n\n"
    : ""
  const markdown = blocks.join("\n\n")

  return {
    content: before + leadingBreak + markdown + trailingBreak + after,
    blockStart: before.length + leadingBreak.length,
    blockEnd: before.length + leadingBreak.length + markdown.length,
  }
}
