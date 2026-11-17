/**
 * Native, dependency-free circle-blur theme animation for this blog.
 * Inspired by theme-switch-animation's documented CIRCLE_BLUR interaction.
 * https://github.com/baiwumm/theme-switch-animation (MIT)
 */
export const THEME_REVEAL_DURATION = 750
export const THEME_REVEAL_EASING = 'ease-in-out'

const STYLE_ID = 'blog-native-circle-blur'
const RADIUS = '--blog-native-circle-radius'
const KEYFRAMES = 'blog-native-circle-reveal'

export interface RevealGeometry {
  x: number
  y: number
  farthestCorner: number
  feather: number
}

interface Session {
  targetIsDark: boolean
  style: HTMLStyleElement
  transition?: ViewTransition
}

const sessions = new WeakMap<Document, Session>()

export function getThemeRevealGeometry(trigger: HTMLElement | null, doc: Document): RevealGeometry {
  const width = doc.defaultView?.innerWidth ?? doc.documentElement.clientWidth
  const height = doc.defaultView?.innerHeight ?? doc.documentElement.clientHeight
  const rect = trigger?.getBoundingClientRect()
  const x = Math.round((rect ? rect.left + rect.width / 2 : width / 2) * 100) / 100
  const y = Math.round((rect ? rect.top + rect.height / 2 : height / 2) * 100) / 100
  const farthestCorner = Math.max(
    Math.hypot(x, y),
    Math.hypot(width - x, y),
    Math.hypot(x, height - y),
    Math.hypot(width - x, height - y),
  )
  const feather = Math.round(Math.max(28, Math.min(120, farthestCorner * 0.055)))
  return { x, y, farthestCorner, feather }
}

/** Build a stationary, soft-edged radial alpha mask for the new snapshot. */
export function buildThemeRevealCss({ x, y, farthestCorner, feather }: RevealGeometry, toDark: boolean): string {
  const value = 'var(' + RADIUS + ')'
  const inner = 'calc(' + value + ' - ' + feather + 'px)'
  const nearInner = 'calc(' + value + ' - ' + Math.round(feather * 0.45) + 'px)'
  const nearOuter = 'calc(' + value + ' + ' + Math.round(feather * 0.45) + 'px)'
  const outer = 'calc(' + value + ' + ' + feather + 'px)'
  const stops = toDark
    ? '#000 ' + inner + ', rgba(0,0,0,.82) ' + nearInner + ', rgba(0,0,0,.5) ' + value + ', rgba(0,0,0,.18) ' + nearOuter + ', transparent ' + outer
    : 'transparent ' + inner + ', rgba(0,0,0,.18) ' + nearInner + ', rgba(0,0,0,.5) ' + value + ', rgba(0,0,0,.82) ' + nearOuter + ', #000 ' + outer
  const gradient = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, ' + stops + ')'
  // Padding either endpoint by the feather width prevents a visible dot
  // at the first frame and guarantees full coverage at the furthest corner.
  const start = toDark ? -feather : farthestCorner + feather
  const end = toDark ? farthestCorner + feather : -feather

  return [
    '@property ' + RADIUS + ' { syntax: "<length>"; inherits: false; initial-value: 0px; }',
    '::view-transition-image-pair(root) { isolation: auto; }',
    '::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }',
    '@keyframes ' + KEYFRAMES + ' {',
    '  from { ' + RADIUS + ': ' + start + 'px; }',
    '  to { ' + RADIUS + ': ' + end + 'px; }',
    '}',
    '::view-transition-new(root) {',
    '  mask-image: ' + gradient + ';',
    '  -webkit-mask-image: ' + gradient + ';',
    '  mask-size: 100% 100%;',
    '  mask-repeat: no-repeat;',
    '  animation: ' + KEYFRAMES + ' ' + THEME_REVEAL_DURATION + 'ms ' + THEME_REVEAL_EASING + ' both;',
    '}',
  ].join('\n')
}

function reducedMotion(doc: Document): boolean {
  try {
    return doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

/**
 * The caller retains ownership of localStorage, the html.dark class,
 * colorScheme, and initial theme selection. We only wrap its DOM update.
 * When clicks overlap, the most recently requested theme takes precedence.
 */
export function toggleThemeWithCircleBlur(
  trigger: HTMLElement | null,
  updateTheme: (nextIsDark: boolean) => void,
  doc: Document = document,
): void {
  const previous = sessions.get(doc)
  const nextIsDark = !(previous?.targetIsDark ?? doc.documentElement.classList.contains('dark'))

  if (previous) {
    previous.transition?.skipTransition()
    previous.style.remove()
    sessions.delete(doc)
  }

  if (typeof doc.startViewTransition !== 'function' || reducedMotion(doc)) {
    updateTheme(nextIsDark)
    return
  }

  const style = doc.createElement('style')
  style.id = STYLE_ID
  style.textContent = buildThemeRevealCss(getThemeRevealGeometry(trigger, doc), nextIsDark)
  ;(doc.head ?? doc.documentElement).appendChild(style)

  const session: Session = { targetIsDark: nextIsDark, style }
  sessions.set(doc, session)

  const updateIfCurrent = () => {
    if (sessions.get(doc) === session) updateTheme(nextIsDark)
  }
  const cleanup = () => {
    style.remove()
    if (sessions.get(doc) === session) sessions.delete(doc)
  }

  try {
    const transition = doc.startViewTransition(updateIfCurrent)
    session.transition = transition
    // Cancellation is expected during rapid clicks; consume all rejections.
    void transition.finished.then(cleanup, cleanup)
    void transition.ready?.catch(() => {})
    void transition.updateCallbackDone?.catch(() => {})
  } catch {
    cleanup()
    updateTheme(nextIsDark)
  }
}
