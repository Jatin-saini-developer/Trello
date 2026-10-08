import { useEffect, useRef, useState } from 'react'
import { onTick } from '../lib/ticker'

const Boards = () => (
  <div className="bd">
    <div><b className="t" /><i className="c" /><i className="c" /></div>
    <div><b className="t" /><i className="c hot" /></div>
    <div><b className="t" /><i className="c" /><i className="c" /><i className="c" /></div>
  </div>
)
const Timeline = () => (
  <div className="tl">
    {[[2, 40, '#45cab0'], [22, 46, '#8793e8'], [44, 30, '#fffde2'], [60, 36, '#e9d58a']].map(([l, w, c], i) => (
      <span className="r" key={i}><i style={{ left: l + '%', width: w + '%', background: c }} /></span>
    ))}
    <em />
  </div>
)
const Docs = () => (
  <div className="dc">
    <b className="h" />
    <i className="l" style={{ width: '92%' }} /><i className="l" style={{ width: '78%' }} /><i className="l" style={{ width: '85%' }} />
    <p><u className="ck on" /><i className="l" style={{ width: '55%' }} /></p>
    <p><u className="ck" /><i className="l" style={{ width: '62%' }} /></p>
  </div>
)
const Automations = () => (
  <div className="au">
    <span className="n">When a card moves to Done</span><s />
    <span className="n">Notify the team</span><s />
    <span className="n">Archive the card</span>
  </div>
)

const FEATURES = [
  { t: 'Boards', d: 'Drag cards across columns to show where work stands.', v: <Boards /> },
  { t: 'Timeline', d: 'See every task on a calendar and spot what is running late.', v: <Timeline /> },
  { t: 'Docs', d: 'Write specs and notes next to the tasks they belong to.', v: <Docs /> },
  { t: 'Automations', d: 'Set a rule once, like telling the team when a card is done.', v: <Automations /> },
]

export default function Features() {
  const [act, setAct] = useState(0)
  const [seen, setSeen] = useState(false)
  const pv = useRef(null), list = useRef(null)
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
    const io = new IntersectionObserver(([x]) => { if (x.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.2 })
    io.observe(list.current)
    return () => { removeEventListener('pointermove', pm); off(); io.disconnect() }
  }, [])

  return (
    <>
      <section className="feat" id="feat">
        <p className="fh">What you can do with it</p>
        <ul className={'list' + (seen ? ' in' : '')} id="list" ref={list} onPointerLeave={() => { st.current.T = 0 }}>
          {FEATURES.map((f, i) => (
            <li className="row" style={{ '--d': i }} key={f.t} onPointerEnter={() => { st.current.T = 1; setAct(i) }}>
              <div className="tt"><h2><span>{f.t}</span></h2></div>
              <p className="ds">{f.d}</p>
              <div className="pvi"><div className="on">{f.v}</div></div>
            </li>
          ))}
        </ul>
      </section>
      <div className="pv" id="pv" ref={pv}>
        {FEATURES.map((f, i) => <div key={f.t} className={i === act ? 'on' : ''}>{f.v}</div>)}
      </div>
    </>
  )
}
