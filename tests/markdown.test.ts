import { describe, expect, it } from "vitest";
import {
  calculateReadingTime,
  getPostExcerpt,
} from "../src/lib/markdown";

describe("markdown helpers", () => {
  it("removes common Markdown syntax from excerpts", () => {
    expect(getPostExcerpt("# 标题\n这是 **正文** 和 [链接](https://example.com)")).toBe(
      "标题 这是 正文 和 链接"
    );
  });

  it("returns a minimum one-minute reading time for non-empty content", () => {
    expect(calculateReadingTime("简短内容")).toBe("1 分钟阅读");
  });
});
