import { useEffect, useRef, useState } from 'react'
import { onTick } from '../lib/ticker'
import useSeen from '../lib/useSeen'

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-6.5" stroke="#6FB38E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

// Previews are tiny pictures of the real app screens
const Orgs = () => (
  <div className="flex h-full flex-col justify-center gap-1.5">
    <p className="px-1 text-xs font-medium text-[#7A756B]">Workspace</p>
    {[['Acme Corp', 'admin', '#D97757', 1], ['Side Project', 'member', '#6FB38E', 0], ['Design Guild', 'admin', '#9C8FE0', 0]].map(([n, r, c, sel]) => (
      <div key={n} className={`flex items-center gap-3 rounded-xl border px-2.5 py-1.5 ${sel ? 'border-[#E4DDCD] bg-[#F4EFE5]' : 'border-transparent'}`}>
        <span className="grid h-8 w-8 place-items-center rounded-lg text-xs font-bold text-white" style={{ background: c }}>{n.split(' ').map((w) => w[0]).join('')}</span>
        <span className="flex-1 leading-tight"><b className="block text-sm">{n}</b><span className="block text-[11px] capitalize text-[#7A756B]">{r}</span></span>
        {sel ? <Check /> : null}
      </div>
    ))}
  </div>
)

const Boards = () => (
  <div className="grid h-full grid-cols-2 gap-3">
    {[['Product roadmap', '#D97757'], ['Sprint 14', '#6FB38E'], ['Launch plan', '#9C8FE0'], ['Hiring', '#E9A23B']].map(([t, c]) => (
      <div key={t} className="flex flex-col overflow-hidden rounded-xl border border-[#E4DDCD] bg-white shadow-sm">
        <div className="flex h-12 gap-1 p-2 opacity-90" style={{ background: c }}>
          {[2, 1, 1].map((n, i) => <div key={i} className="flex-1 space-y-1">{Array.from({ length: n }).map((_, k) => <div key={k} className="h-2 rounded-sm bg-white/80" />)}</div>)}
        </div>
        <p className="px-2.5 py-2 text-[13px] font-bold">{t}</p>
      </div>
    ))}
  </div>
)

const Sections = () => (
  <div className="grid h-full grid-cols-3 gap-2">
    {[['To do', '#D97757', 2], ['Doing', '#9C8FE0', 1], ['Done', '#6FB38E', 1]].map(([t, c, n], ci) => (
      <div key={t} className="rounded-xl border border-[#E4DDCD] bg-[#F4EFE5] p-2">
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold"><span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />{t}</p>
        {Array.from({ length: n }).map((_, k) => (
          <div key={k} className={`mb-1.5 rounded-lg border border-[#E4DDCD] bg-white p-1.5 shadow-sm ${ci === 0 && k === 0 ? 'animate-[drift_3.6s_ease-in-out_infinite] motion-reduce:animate-none' : ''}`}>
            <i className="mb-1 block h-1.5 w-3/4 rounded bg-[#ece5d6]" /><i className="block h-1.5 w-1/2 rounded bg-[#ece5d6]" />
          </div>
        ))}
      </div>
    ))}
  </div>
)

const Issues = () => (
  <div className="flex h-full flex-col justify-center gap-2.5">
    {[['Fix the login bug', 'Users on Safari get logged out after a refresh.', '#D97757'], ['Write the launch post', 'Draft the announcement and get it reviewed.', '#6FB38E'], ['Plan the sprint', 'Pick the work for the next two weeks.', '#9C8FE0']].map(([t, d, c], i) => (
      <div key={t} className={`relative overflow-hidden rounded-xl border border-[#E4DDCD] bg-white py-2 pl-4 pr-3 shadow-sm ${i === 2 ? 'opacity-60' : ''}`}>
        <span className="absolute inset-y-2.5 left-0 w-[3px] rounded-r" style={{ background: c }} />
        <p className="text-[13px] font-bold leading-snug">{t}</p>
        <p className="truncate text-[11px] text-[#7A756B]">{d}</p>
      </div>
    ))}
  </div>
)

const FEATURES = [
  { t: 'Organisations', d: 'A home for every team. Switch between workspaces without leaving the page.', v: <Orgs /> },
  { t: 'Boards', d: 'One board per project, each with its own colour, so you can tell them apart at a glance.', v: <Boards /> },
  { t: 'Sections', d: 'Name your columns whatever your team calls them: To do, Doing, Review, Done.', v: <Sections /> },
  { t: 'Issues', d: 'Write down each piece of work with a title and a description, in the section where it belongs.', v: <Issues /> },
]

export default function Features() {
  const [act, setAct] = useState(null) // row under the pointer
  const [last, setLast] = useState(0) // preview kept on screen while it fades out
  const [listRef, seen] = useSeen(0.2)
  const pv = useRef(null)
  const st = useRef({ tx: 0, ty: 0, px: 0, py: 0, T: 0, S: 0 })

  useEffect(() => {
    const s = st.current
    const pm = (e) => { s.tx = Math.min(e.clientX + 34, innerWidth - 360); s.ty = e.clientY - 115 }
    addEventListener('pointermove', pm)
    const off = onTick(() => {
      s.px += (s.tx - s.px) * 0.14; s.py += (s.ty - s.py) * 0.14; s.S += (s.T - s.S) * 0.12
      const el = pv.current
      if (el) { el.style.opacity = s.S; el.style.transform = `translate3d(${s.px}px,${s.py}px,0) scale(${0.9 + 0.1 * s.S})` }
    })
    return () => { removeEventListener('pointermove', pm); off() }
  }, [])

  return (
    <>
      <section id="features" className="relative z-[4] bg-[#F4EFE5] pb-[16vh] pt-[14vh]">
        <div className="pointer-events-none absolute inset-x-0 -top-[18vh] h-[18vh]" style={{ background: 'linear-gradient(transparent,#F4EFE5)' }} />
        <p className="px-[3vw] pb-[5vh] font-serif text-[clamp(16px,1.5vw,22px)] italic text-[#7A756B]">What's inside</p>
        <ul ref={listRef} onPointerLeave={() => { st.current.T = 0; setAct(null) }} className="m-0 list-none border-b border-[#1b1a1726] p-0">
          {FEATURES.map((f, i) => (
            <li key={f.t} onPointerEnter={() => { st.current.T = 1; setAct(i); setLast(i) }}
              className={`group flex flex-wrap items-center justify-between gap-6 border-t border-[#1b1a1726] px-[3vw] py-[3.4vh] transition-opacity duration-300 max-sm:flex-col max-sm:items-start ${act !== null && act !== i ? 'opacity-30' : 'opacity-100'}`}>
              <div className="overflow-hidden transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-x-[1.5vw]">
                <h2 className="m-0 text-[clamp(40px,8vw,128px)] font-bold leading-[1.02] tracking-[-.035em]">
                  <span style={{ transitionDelay: `${i * 120}ms` }} className={`inline-block transition-transform duration-[1100ms] ease-[cubic-bezier(.2,.8,.2,1)] ${seen ? 'translate-y-0' : 'translate-y-[112%]'}`}>{f.t}</span>
                </h2>
              </div>
              <p className="max-w-[300px] text-[15px] leading-snug text-[#7A756B]">{f.d}</p>
              {/* touch screens have no hover, so show the picture inline */}
              <div className="relative hidden h-[230px] w-[min(340px,100%)] overflow-hidden rounded-2xl border border-[#E4DDCD] bg-white p-4 [@media(hover:none)]:block">{f.v}</div>
            </li>
          ))}
        </ul>
      </section>
      <div ref={pv} className="pointer-events-none fixed left-0 top-0 z-[60] h-[230px] w-[340px] overflow-hidden rounded-2xl border border-[#E4DDCD] bg-white opacity-0 shadow-[0_30px_80px_-30px_rgba(70,45,10,0.5)] [@media(hover:none)]:hidden">
        {FEATURES.map((f, i) => (
          <div key={f.t} className={`absolute inset-0 p-4 transition-opacity duration-300 ${i === last ? 'opacity-100' : 'opacity-0'}`}>{f.v}</div>
        ))}
      </div>
    </>
  )
}
