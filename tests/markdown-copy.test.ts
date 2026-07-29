// @vitest-environment jsdom

import { describe, expect, it } from "vitest"
import {
  getMarkdownSelectionText,
  removeCopyExcludedElements,
} from "../src/features/posts/markdown-copy"

function createFragment(html: string) {
  const template = document.createElement("template")
  template.innerHTML = html
  return template.content
}

describe("Markdown selection copy", () => {
  it("copies inline code as its literal text without presentation markup", () => {
    const fragment = createFragment(
      "<p>运行 <code><span>npm</span> test</code> 完成</p>"
    )

    expect(getMarkdownSelectionText(fragment)).toBe("运行 npm test 完成")
  })

  it("copies table rows as newline-delimited TSV text", () => {
    const fragment = createFragment(`
      <table>
        <thead><tr><th>名称</th><th>值</th></tr></thead>
        <tbody>
          <tr><td>alpha</td><td><code>1</code></td></tr>
          <tr><td>beta</td><td>2</td></tr>
        </tbody>
      </table>
    `)

    expect(getMarkdownSelectionText(fragment)).toBe(
      "名称\t值\nalpha\t1\nbeta\t2"
    )
  })

  it("removes editor chrome and favicon elements from copied content", () => {
    const fragment = createFragment(
      '<div><div data-copy-exclude="true">javascript 复制</div><p>查看<span data-copy-exclude="true"><img alt="" /></span><a href="https://example.com">示例</a></p></div>'
    )

    removeCopyExcludedElements(fragment)

    expect(getMarkdownSelectionText(fragment)).toBe("查看示例")
    expect(fragment.querySelector("[data-copy-exclude]")).toBeNull()
  })
})
