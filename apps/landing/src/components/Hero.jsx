import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { S, clamp } from '../lib/scroll'
import { onTick } from '../lib/ticker'

export default function Hero() {
  const root = useRef(null)

  useEffect(() => {
    const q = (s) => root.current.querySelector(s)
    S.intro = 0
    const ctx = gsap.context(() => {
      const cnt = { v: 0 }, num = q('#ld .n'), r = S.reduce
      gsap.set('.ln>span', { yPercent: 115 })
      gsap.set('.fx', { opacity: 0, y: 12 })
      gsap.timeline()
        .to(cnt, { v: 100, duration: r ? 0.05 : 1.8, ease: 'power2.inOut', onUpdate() { num.textContent = Math.round(cnt.v) } })
        .to('#ld', { yPercent: -100, duration: r ? 0.05 : 1, ease: 'power4.inOut' }, '+=.15')
        .to(S, { intro: 1, duration: 2, ease: 'power2.out' }, '<.2')
        .to('.ln>span', { yPercent: 0, duration: 1.2, stagger: 0.12, ease: 'power4.out' }, '<.3')
        .to('.fx', { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, '<.4')
    }, root)

    const txt = q('#txt'), end = q('#end'), hint = q('.hint')
    const off = onTick(() => {
      const P = S.P
      txt.style.transform = `translateY(${-P * 70}px)`
      txt.style.opacity = clamp(1 - P * 1.6, 0, 1)
      txt.classList.toggle('off', P > 0.5)
      hint.style.visibility = P > 0.2 ? 'hidden' : 'visible'
      end.style.opacity = clamp((P - 0.65) * 3, 0, 1)
    })
    return () => { ctx.revert(); off() }
  }, [])

  return (
    <div ref={root}>
      <div id="ld"><p>Hello, let's get organised.</p><div className="n">0</div></div>
      <header className="fx">
        <a className="menu" href="#"><i />Menu</a>
        <a className="logo" href="#">boardly</a>
        <a href="#">Start free</a>
      </header>
      <div className="hero" id="txt">
        <h1>
          <span className="ln"><span>Turn messy</span></span>
          <span className="ln l2"><span>ideas into<span className="chip"><b><u /><u /></b><b><u /><u /></b><b><u /><u /></b></span></span></span>
          <span className="ln l3"><span>shipped work</span></span>
        </h1>
        <span className="it langs fx">Kanban | Timeline | Docs</span>
        <span className="it since fx">Free for small teams</span>
        <div className="blurb fx">
          A visual workspace for tasks. Drop cards in, drag them around, and watch the plan take shape.
          <br /><a className="cta" href="#">Start a board</a>
        </div>
      </div>
      <div className="hint fx" />
      <div className="end" id="end">Chaos in. Order out.</div>
    </div>
  )
}
