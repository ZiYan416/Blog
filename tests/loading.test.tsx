import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Loading from '../src/app/loading'

describe('root loading fallback', () => {
  it('renders the branded logo before client hydration', () => {
    const markup = renderToStaticMarkup(<Loading />)

    expect(markup).toContain('网站正在加载')
    expect(markup).toContain('branded-loader__halo')
    expect(markup).toContain('>B<')
    expect(markup).not.toContain('opacity:0')
  })
})
