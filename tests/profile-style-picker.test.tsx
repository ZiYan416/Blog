// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ProfileStylePicker } from "../src/features/profile/components/profile-style-picker"

describe("ProfileStylePicker", () => {
  afterEach(cleanup)

  it("exposes selection state and keyboard-accessible controls", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ProfileStylePicker value="default" onChange={onChange} />)

    const choices = screen.getAllByRole("button", { name: /选择.+名片背景/ })
    expect(choices.length).toBeGreaterThan(1)
    expect(
      choices.some((choice) => choice.getAttribute("aria-pressed") === "true")
    ).toBe(true)

    await user.click(choices[1])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it("expands the remaining visual styles", async () => {
    const user = userEvent.setup()
    render(<ProfileStylePicker value="default" onChange={() => {}} />)

    const initialChoices = screen.getAllByRole("button", {
      name: /选择.+名片背景/,
    }).length
    await user.click(screen.getByRole("button", { name: /查看更多样式/ }))

    expect(
      screen.getAllByRole("button", { name: /选择.+名片背景/ }).length
    ).toBeGreaterThan(initialChoices)
    expect(screen.getByRole("button", { name: "收起样式" })).toBeTruthy()
  })
})
