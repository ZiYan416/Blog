import { describe, expect, it } from "vitest";
import {
  calculateReadingTime,
  getPostExcerpt,
} from "../src/lib/markdown";
import {
  insertMarkdownBlocks,
  normalizeMarkdownBlockBoundaries,
} from "../src/features/posts/markdown-normalization";

describe("markdown helpers", () => {
  it("removes common Markdown syntax from excerpts", () => {
    expect(getPostExcerpt("# 标题\n这是 **正文** 和 [链接](https://example.com)")).toBe(
      "标题 这是 正文 和 链接"
    );
  });

  it("returns a minimum one-minute reading time for non-empty content", () => {
    expect(calculateReadingTime("简短内容")).toBe("1 分钟阅读");
  });

  it("separates a heading that was serialized directly after an image", () => {
    expect(
      normalizeMarkdownBlockBoundaries("![配图](https://example.com/a.png)## 标题")
    ).toBe("![配图](https://example.com/a.png)\n\n## 标题");
  });

  it("does not rewrite image-like text inside fenced or inline code", () => {
    const content = [
      "```markdown",
      "![配图](https://example.com/a.png)## 示例",
      "```",
      "`![配图](https://example.com/a.png)## 示例`",
    ].join("\n");
    expect(normalizeMarkdownBlockBoundaries(content)).toBe(content);
  });

  it("inserts image blocks with safe spacing from surrounding Markdown", () => {
    expect(
      insertMarkdownBlocks("前文## 后续标题", 2, 2, ["![配图](image.png)"])
    ).toEqual({
      content: "前文\n\n![配图](image.png)\n\n## 后续标题",
      blockStart: 4,
      blockEnd: 20,
    });
  });
});
