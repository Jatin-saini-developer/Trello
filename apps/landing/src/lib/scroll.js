import Lenis from 'lenis'
import { onTick } from './ticker'

export const clamp = (x, a, b) => Math.min(b, Math.max(a, x))
export const lerp = (a, b, t) => a + (b - a) * t

// Shared live state: P = hero scroll progress 0..1, mx/my = smoothed-by-consumer mouse, intro = 0..1 fade-in
export const S = { P: 0, mx: 0.5, my: 0.5, intro: 0, reduce: false }

export function initScroll() {
  S.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  let lenis = null
  let off = () => {}
  if (!S.reduce) {
    lenis = new Lenis({ lerp: 0.09 })
    off = onTick((t) => lenis.raf(t))
  }
  const sc = () => { S.P = clamp(scrollY / (innerHeight * 1.2), 0, 1) }
  const pm = (e) => { S.mx = e.clientX / innerWidth; S.my = 1 - e.clientY / innerHeight }
  addEventListener('scroll', sc, { passive: true })
  addEventListener('pointermove', pm)
  sc()
  return () => {
    removeEventListener('scroll', sc)
    removeEventListener('pointermove', pm)
    off()
    if (lenis) lenis.destroy()
  }
}
