import { toPng } from 'html-to-image'

type CaptureOptions = NonNullable<Parameters<typeof toPng>[1]>

const ASSET_WAIT_TIMEOUT = 1_500

// html-to-image rejects the whole export when a cloned image cannot be loaded.
// A transparent pixel keeps the rest of the card exportable when an optional
// cover or avatar is blocked by CORS, hotlink protection, or an expired URL.
export const SHARE_CARD_IMAGE_PLACEHOLDER =
  'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='

function waitForImage(image: HTMLImageElement) {
  if (image.complete) return Promise.resolve()

  return new Promise<void>((resolve) => {
    const finish = () => {
      window.clearTimeout(timeoutId)
      image.removeEventListener('load', finish)
      image.removeEventListener('error', finish)
      resolve()
    }
    const timeoutId = window.setTimeout(finish, ASSET_WAIT_TIMEOUT)

    image.addEventListener('load', finish, { once: true })
    image.addEventListener('error', finish, { once: true })
  })
}

async function waitForCardAssets(node: HTMLElement) {
  const fontReady = document.fonts?.ready ?? Promise.resolve()
  const timeout = new Promise<void>((resolve) => {
    window.setTimeout(resolve, ASSET_WAIT_TIMEOUT)
  })

  await Promise.all([
    Promise.race([fontReady.then(() => undefined), timeout]),
    Promise.all(Array.from(node.querySelectorAll('img')).map(waitForImage)),
  ])
}

function getCaptureOptions(skipFonts = false): CaptureOptions {
  return {
    backgroundColor: '#ffffff',
    cacheBust: false,
    includeQueryParams: true,
    imagePlaceholder: SHARE_CARD_IMAGE_PLACEHOLDER,
    pixelRatio: 2,
    skipFonts,
  }
}

async function renderWithFallback<T>(
  node: HTMLElement,
  render: (target: HTMLElement, options: CaptureOptions) => Promise<T>,
) {
  await waitForCardAssets(node)

  try {
    return await render(node, getCaptureOptions())
  } catch (firstError) {
    console.warn(
      'Share card export failed with embedded fonts; retrying with system fonts.',
      firstError,
    )
    return render(node, getCaptureOptions(true))
  }
}

export function renderShareCardPng(node: HTMLElement) {
  return renderWithFallback(node, toPng)
}
