const BLOCK_TAGS = new Set([
  "ADDRESS",
  "ARTICLE",
  "ASIDE",
  "BLOCKQUOTE",
  "DIV",
  "FOOTER",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "LI",
  "MAIN",
  "NAV",
  "OL",
  "P",
  "PRE",
  "SECTION",
  "UL",
])

export function removeCopyExcludedElements(root: ParentNode) {
  root
    .querySelectorAll<HTMLElement>("[data-copy-exclude]")
    .forEach((element) => element.remove())
}

function serializeTable(table: HTMLTableElement) {
  return Array.from(table.rows)
    .map((row) =>
      Array.from(row.cells)
        .map((cell) =>
          serializeNode(cell)
            .replace(/\s*\n+\s*/g, " ")
            .trim()
        )
        .join("\t")
    )
    .join("\n")
}

function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || ""
  if (!(node instanceof HTMLElement)) {
    return Array.from(node.childNodes, serializeNode).join("")
  }
  if (node.hasAttribute("data-copy-exclude")) return ""

  if (node instanceof HTMLTableElement) return serializeTable(node)
  if (node.tagName === "BR") return "\n"
  if (node.tagName === "IMG") return node.getAttribute("alt") || ""

  const content = Array.from(node.childNodes, serializeNode).join("")
  if (!BLOCK_TAGS.has(node.tagName)) return content

  return `${content.replace(/\n+$/, "")}\n`
}

export function getMarkdownSelectionText(root: ParentNode) {
  return serializeNode(root)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
