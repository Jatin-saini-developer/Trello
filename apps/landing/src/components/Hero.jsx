import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { S, clamp } from '../lib/scroll'
import { onTick } from '../lib/ticker'
import { APP_URL } from '../lib/appUrl'
import Brand from './Brand'

const line = 'block overflow-hidden pb-[.05em]'

export default function Hero() {
  const root = useRef(null), txt = useRef(null), end = useRef(null), hint = useRef(null)

  useEffect(() => {
    S.intro = 0
    const ctx = gsap.context(() => {
      const cnt = { v: 0 }, num = root.current.querySelector('[data-n]'), r = S.reduce
      gsap.set('[data-ln]', { yPercent: 115 })
      gsap.set('[data-fx]', { opacity: 0, y: 12 })
      gsap.timeline()
        .to(cnt, { v: 100, duration: r ? 0.05 : 1.6, ease: 'power2.inOut', onUpdate() { num.textContent = Math.round(cnt.v) } })
        .to('[data-ld]', { yPercent: -100, duration: r ? 0.05 : 1, ease: 'power4.inOut' }, '+=.15')
        .to(S, { intro: 1, duration: 2, ease: 'power2.out' }, '<.2')
        .to('[data-ln]', { yPercent: 0, duration: 1.2, stagger: 0.12, ease: 'power4.out' }, '<.3')
        .to('[data-fx]', { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, '<.4')
    }, root)

    const off = onTick(() => {
      const P = S.P
      txt.current.style.transform = `translateY(${-P * 70}px)`
      txt.current.style.opacity = clamp(1 - P * 1.6, 0, 1)
      txt.current.style.visibility = P > 0.85 ? 'hidden' : 'visible'
      hint.current.style.visibility = P > 0.2 ? 'hidden' : 'visible'
      end.current.style.opacity = clamp((P - 0.65) * 3, 0, 1)
    })
    return () => { ctx.revert(); off() }
  }, [])

  return (
    <div ref={root}>
      {/* loader */}
      <div data-ld className="fixed inset-0 z-50 flex flex-col justify-between bg-[#F4EFE5] px-[3vw] py-[4vh]">
        <p className="font-serif text-[clamp(16px,1.6vw,22px)] italic">Hello, let's get organised.</p>
        <div data-n className="self-end text-[clamp(70px,15vw,230px)] font-bold leading-[.85] tracking-[-.05em]">0</div>
      </div>

      {/* nav */}
      <header data-fx className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-[3vw] py-6">
        <Brand />
        <nav className="flex items-center gap-5 text-sm font-bold">
          <a href={APP_URL + '/login'} className="text-[#7A756B] transition-colors hover:text-[#1B1A17]">Log in</a>
          <a href={APP_URL + '/signup'} className="group relative isolate overflow-hidden rounded-xl bg-[#1B1A17] px-4 py-2.5 text-white">
            <span className="absolute inset-0 -z-10 translate-y-full bg-[#D97757] transition-transform duration-500 ease-out group-hover:translate-y-0" />
            Get started
          </a>
        </nav>
      </header>

      {/* headline */}
      <div ref={txt} className="pointer-events-none fixed inset-0 z-[2] grid place-items-center">
        <h1 className="m-0 w-[min(92vw,1080px)] text-[clamp(38px,8.2vw,128px)] font-bold uppercase leading-[.93] tracking-[-.035em]">
          <span className={line}><span data-ln className="inline-block">Everything</span></span>
          <span className={`${line} ml-[9%] max-sm:ml-[4%]`}>
            <span data-ln className="inline-block">in its
              <span className="relative mx-[.08em] inline-block h-[.74em] w-[1.75em] overflow-hidden rounded-[.1em] border border-[#E4DDCD] bg-white align-[-.04em]">
                {[['7%', '#D97757', 0], ['38%', '#6FB38E', -1], ['69%', '#9C8FE0', -2]].map(([l, c, d], i) => (
                  <b key={i} className="absolute top-[12%] h-[76%] w-[24%]" style={{ left: l }}>
                    {[0, 1].map((k) => (
                      <u key={k} className="mb-[9%] block h-[28%] animate-[hop_3.2s_ease-in-out_infinite] rounded-[3px] no-underline motion-reduce:animate-none"
                        style={{ background: c, opacity: k ? 0.7 : 1, animationDelay: `${d - k * 0.6}s` }} />
                    ))}
                  </b>
                ))}
              </span>
            </span>
          </span>
          <span className={`${line} ml-[2%]`}><span data-ln className="inline-block">place.</span></span>
        </h1>
        <span data-fx className="absolute right-[3vw] top-[25vh] font-serif text-[clamp(14px,1.3vw,19px)] italic text-[#4a463e] max-sm:top-[18vh]">Organisations | Boards | Issues</span>
        <span data-fx className="absolute bottom-[24vh] left-[3vw] font-serif text-[clamp(14px,1.3vw,19px)] italic text-[#4a463e] max-sm:hidden">Seiton, from the Japanese for “set in order”</span>
        <div data-fx className="pointer-events-auto absolute bottom-[5vh] right-[3vw] max-w-[300px] text-sm leading-snug text-[#4a463e] max-sm:left-[3vw] max-sm:max-w-none">
          Seiton is a board for your team's work. Create an organisation, add boards, and keep every issue in its place.
          <br />
          <a href={APP_URL + '/signup'} className="group relative isolate mt-4 inline-block overflow-hidden rounded-full bg-[#D97757] px-6 py-3 font-bold text-white">
            <span className="absolute inset-0 -z-10 translate-y-full bg-[#1B1A17] transition-transform duration-500 ease-out group-hover:translate-y-0" />
            Start a board
          </a>
        </div>
      </div>

      <div ref={hint} data-fx className="fixed bottom-0 left-1/2 z-[3] h-[70px] w-px [background:linear-gradient(#1B1A17,transparent)]">
        <i className="absolute -left-[3px] -top-1 h-[7px] w-[7px] animate-[hint_2s_ease-in-out_infinite] rounded-full border border-[#1B1A17] motion-reduce:animate-none" />
      </div>
      <div ref={end} className="pointer-events-none fixed inset-x-0 bottom-[11vh] z-[2] text-center font-serif text-[clamp(28px,4.2vw,58px)] italic opacity-0">Set in order.</div>
    </div>
  )
}
