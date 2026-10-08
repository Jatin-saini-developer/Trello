import { useEffect, useRef, useState } from 'react'
import { onTick } from '../lib/ticker'
import { S, clamp } from '../lib/scroll'

const T = [
  { t: 'Write the launch post', c: '#45cab0' }, { t: 'Fix the login bug', c: '#fffde2' },
  { t: 'Design the pricing page', c: '#8793e8' }, { t: 'Review the pull request', c: '#e9d58a' },
  { t: 'Plan next sprint', c: '#45cab0' }, { t: 'Ship version one', c: '#8793e8' },
]
const START = [[0, 1, 2], [3, 4], [5]]
const NAMES = ['To do', 'Doing', 'Done']

export default function Play() {
  const [cols, setCols] = useState(START)
  const [dr, setDr] = useState(null) // the card being dragged + where its placeholder sits
  const [hot, setHot] = useState(-1) // column under the pointer
  const [nudge, setNudge] = useState(true)
  const el = useRef({}), colEl = useRef([]), ph = useRef(null), D = useRef(null)
  const colsRef = useRef(cols)
  colsRef.current = cols

  useEffect(() => {
    const mv = (e) => { const d = D.current; if (d && !d.done) { d.x = e.clientX; d.y = e.clientY } }
    const finish = () => {
      const d = D.current
      if (!d || d.done) return
      d.done = true
      const card = el.current[d.id], p = ph.current
      if (card && p && card.classList.contains('drag')) {
        const r = p.getBoundingClientRect()
        card.classList.add('land')
        card.style.left = r.left + 'px'; card.style.top = r.top + 'px'; card.style.transform = 'none'
      }
      setHot(-1)
      setTimeout(() => {
        setCols((c) => { const n = c.map((a) => a.filter((i) => i !== d.id)); n[d.ci].splice(d.idx, 0, d.id); return n })
        setDr(null)
        D.current = null
      }, S.reduce ? 0 : 420)
    }
    const off = onTick(() => {
      const d = D.current
      if (!d || d.done) return
      const card = el.current[d.id]
      if (!card || !card.classList.contains('drag')) return
      d.vx += (d.x - d.lx - d.vx) * 0.25; d.vy += (d.y - d.ly - d.vy) * 0.25; d.lx = d.x; d.ly = d.y
      card.style.left = d.x - d.ox + 'px'; card.style.top = d.y - d.oy + 'px'
      card.style.transform = `perspective(700px) rotateX(${clamp(-d.vy * 0.5, -18, 18)}deg) rotateY(${clamp(d.vx * 0.8, -22, 22)}deg) rotateZ(${clamp(d.vx * 0.6, -16, 16)}deg) scale(1.07)`
      let ci = 0, bd = 1e9
      colEl.current.forEach((c, i) => {
        const r = c.getBoundingClientRect()
        if (d.x >= r.left && d.x <= r.right && d.y >= r.top && d.y <= r.bottom) { ci = i; bd = -1 }
        else if (bd >= 0) { const k = Math.hypot(d.x - (r.left + r.width / 2), d.y - (r.top + r.height / 2)); if (k < bd) { bd = k; ci = i } }
      })
      let idx = 0
      for (const id of colsRef.current[ci]) {
        if (id === d.id) continue
        const n = el.current[id]
        if (!n) continue
        const r = n.getBoundingClientRect()
        if (d.y >= r.top + r.height / 2) idx++; else break
      }
      if (ci !== d.ci || idx !== d.idx) { d.ci = ci; d.idx = idx; setDr((s) => s && { ...s, ci, idx }); setHot(ci) }
    })
    addEventListener('pointermove', mv)
    addEventListener('pointerup', finish)
    addEventListener('pointercancel', finish)
    return () => { off(); removeEventListener('pointermove', mv); removeEventListener('pointerup', finish); removeEventListener('pointercancel', finish) }
  }, [])

  const down = (e, id, from) => {
    if (D.current || e.button > 0) return
    e.preventDefault()
    setNudge(false)
    const r = el.current[id].getBoundingClientRect()
    const idx = cols[from].indexOf(id)
    D.current = { id, ci: from, idx, ox: e.clientX - r.left, oy: e.clientY - r.top, x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, vx: 0, vy: 0 }
    setHot(from)
    setDr({ id, ci: from, idx, h: r.height, w: r.width, left: r.left, top: r.top })
  }

  const key = (e, id, ci) => {
    const n = e.key === 'ArrowRight' ? ci + 1 : e.key === 'ArrowLeft' ? ci - 1 : ci
    if (n === ci || n < 0 || n > 2 || D.current) return
    e.preventDefault()
    setCols((c) => { const x = c.map((a) => a.filter((i) => i !== id)); x[n].push(id); return x })
    requestAnimationFrame(() => el.current[id] && el.current[id].focus())
  }

  const done = cols[2].length === T.length

  return (
    <section className="play" id="play">
      <h3 className="pt">Go on.<br />Move something.</h3>
      <p className="fh">Drag a card to another column, or focus one and press the arrow keys.</p>
      <div className="board" id="board">
        {cols.map((ids, ci) => {
          const items = (dr ? ids.filter((i) => i !== dr.id) : ids).map((id) => (
            <div key={id} ref={(n) => { el.current[id] = n }} className={'card' + (id === 0 && nudge ? ' nudge' : '')}
              tabIndex={0} style={{ '--c': T[id].c }} onPointerDown={(e) => down(e, id, ci)} onKeyDown={(e) => key(e, id, ci)}>
              {T[id].t}
            </div>
          ))
          if (dr && dr.ci === ci) items.splice(dr.idx, 0, <div key="ph" className="ph" ref={ph} style={{ '--h': dr.h + 'px' }} />)
          return (
            <div className={'col' + (hot === ci ? ' over' : '')} key={ci} ref={(n) => { colEl.current[ci] = n }}>
              <header><span>{NAMES[ci]}</span><b key={ids.length} className="pop">{ids.length}</b></header>
              <div className="cards">{items}</div>
            </div>
          )
        })}
      </div>
      {dr && (
        <div className="card drag" ref={(n) => { el.current[dr.id] = n }}
          style={{ '--c': T[dr.id].c, width: dr.w, left: dr.left, top: dr.top }}>{T[dr.id].t}</div>
      )}
      <p className="fh" id="msg" style={{ opacity: done ? 1 : 0, transition: 'opacity .5s' }}>Everything shipped.</p>
      <button className="rs" id="rs" type="button" onClick={() => setCols(START.map((a) => [...a]))}>Reset board</button>
    </section>
  )
}
