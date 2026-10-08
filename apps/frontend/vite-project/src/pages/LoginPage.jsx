import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import api from '../utils/api.js'
import './LoginPage.css'

gsap.registerPlugin(Flip)

const AV = { P: '#D97757', A: '#6FB38E', M: '#9C8FE0', J: '#E9A23B' }
// title, label colors, checklist, due, members
const CARDS = [
  ['Review pull requests', ['#D97757', '#9C8FE0'], '3/5', 'Fri', 'PA'],
  ['Write release notes', ['#6FB38E'], '1/4', 'Mon', 'M'],
  ['Plan the sprint', ['#E9A23B', '#D97757'], '0/6', 'Tue', 'JP'],
  ['Reply to Priya', ['#9C8FE0'], '', 'Today', 'A'],
  ['Update the roadmap', ['#6FB38E', '#E9A23B'], '2/3', 'Thu', 'PM'],
  ['Book the offsite', ['#D97757'], '', 'Next week', 'J'],
  ['Fix the login bug', ['#D97757'], '4/6', 'Today', 'AJ'],
  ['Design the pricing page', ['#9C8FE0', '#6FB38E'], '2/5', 'Wed', 'MP'],
  ['Ship version one', ['#6FB38E'], '8/8', '', 'PAM'],
  ['Set up the CI pipeline', ['#E9A23B'], '5/5', '', 'J'],
  ['Onboard the team', ['#9C8FE0'], '3/3', '', 'AM'],
]
const LANES = ['To do', 'Doing', 'Done']

const Card = ({ id }) => {
  const [t, cs, ck, due, who] = CARDS[id]
  return (
    <article className="kc" data-flip-id={id}>
      <div className="lb">{cs.map((c) => <i key={c} style={{ background: c }} />)}</div>
      <h3>{t}</h3>
      <div className="mt">
        <span>{ck && <em>{ck}</em>}{due && <em>Due {due}</em>}</span>
        <span className="avs">{who.split('').map((w) => <i className="av" key={w} style={{ background: AV[w] }}>{w}</i>)}</span>
      </div>
    </article>
  )
}

const LoginPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [show, setShow] = useState(false)
  const [lanes, setLanes] = useState([[0, 1, 2, 3, 4, 5], [6, 7], [8, 9, 10]])
  const root = useRef(null), fc = useRef(null)
  const lanesRef = useRef(lanes), flip = useRef(null), lift = useRef(null), step = useRef(0)
  const S = useRef({ reduce: false, t: 0 })
  lanesRef.current = lanes

  const emailOk = /^\S+@\S+\.\S+$/.test(formData.email)
  const hasPw = formData.password.length > 0
  const status = ok ? 'Done' : error ? 'Blocked' : loading || formData.email || hasPw ? 'In progress' : 'To do'
  const desc = ok ? 'Done. Opening your workspace…' : loading ? 'Moving your card along…' : 'Finish this card to get into your workspace.'

  // entrance, cursor tilt + parallax, keep the Doing lane clear of the form card
  useLayoutEffect(() => {
    const st = S.current
    st.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      const tilt = root.current.querySelector('.tilt'), fcw = root.current.querySelector('.fcw')
      if (!st.reduce) {
        gsap.from('.top', { opacity: 0, y: -14, duration: 0.8 })
        gsap.from('.lane', { opacity: 0, y: 44, duration: 0.9, stagger: 0.1, ease: 'power3.out' })
        gsap.from('.kc', { opacity: 0, y: 26, duration: 0.7, stagger: 0.05, delay: 0.35, ease: 'power3.out' })
        gsap.from(fc.current, { opacity: 0, y: 36, scale: 0.96, duration: 0.9, delay: 0.4, ease: 'power3.out' })
        gsap.from('.note', { opacity: 0, scale: 0.6, rotation: -20, duration: 0.8, delay: 1, ease: 'back.out(2)' })
      }
      gsap.set(tilt, { transformPerspective: 1500, transformOrigin: '50% 40%' })
      const rx = gsap.quickTo(tilt, 'rotationX', { duration: 1, ease: 'power3' }), ry = gsap.quickTo(tilt, 'rotationY', { duration: 1, ease: 'power3' })
      const px = gsap.quickTo(fcw, 'x', { duration: 1, ease: 'power3' }), py = gsap.quickTo(fcw, 'y', { duration: 1, ease: 'power3' })
      const mm = (e) => {
        if (st.reduce) return
        const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5
        rx(-ny * 5); ry(nx * 6); px(-nx * 12); py(-ny * 9)
      }
      addEventListener('pointermove', mm)
      const ro = new ResizeObserver(() => tilt.style.setProperty('--fh', fc.current.offsetHeight + 'px'))
      ro.observe(fc.current)
      st.off = () => { removeEventListener('pointermove', mm); ro.disconnect() }
    }, root)
    return () => { st.off && st.off(); clearTimeout(st.t); ctx.revert() }
  }, [])

  // the board keeps moving: one card hops to the next lane every couple of seconds
  useEffect(() => {
    if (ok || S.current.reduce) return
    const id = setInterval(() => {
      const s = step.current++ % 3, moving = lanesRef.current[s][0]
      flip.current = Flip.getState('.kc')
      lift.current = moving
      setLanes((L) => { const n = L.map((a) => [...a]); n[(s + 1) % 3].push(n[s].shift()); return n })
    }, 2600)
    return () => clearInterval(id)
  }, [ok])

  useLayoutEffect(() => {
    if (!flip.current) return
    const el = () => document.querySelector(`[data-flip-id="${lift.current}"]`)
    Flip.from(flip.current, {
      duration: 1, ease: 'power3.inOut',
      onStart: () => el() && el().classList.add('lift'),
      onComplete: () => el() && el().classList.remove('lift'),
    })
    flip.current = null
  }, [lanes])

  useEffect(() => {
    if (error && !S.current.reduce) gsap.fromTo(fc.current, { x: -14 }, { x: 0, duration: 0.7, ease: 'elastic.out(1.1,0.3)' })
  }, [error])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  // success: the form card slides into the Done lane, then we go in
  const finish = () => {
    const st = S.current
    if (st.reduce) { st.t = setTimeout(() => navigate('/createOrg'), 200); return }
    const dx = root.current.querySelector('.lane').offsetWidth + 20
    gsap.to('.lane-3 .kc', { y: fc.current.offsetHeight + 10, duration: 0.7, delay: 0.5, ease: 'power3.inOut' })
    gsap.to(fc.current, { x: dx, rotation: 2.5, duration: 0.9, delay: 0.6, ease: 'power3.inOut' })
    st.t = setTimeout(() => navigate('/createOrg'), 2100)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email: formData.email, password: formData.password })
      localStorage.setItem('token', data.token)
      setOk(true)
      finish()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lg" ref={root}>
      <i className="bl b1" /><i className="bl b2" />
      <header className="top">
        <div className="brand">
          <div className="mark">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" /><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" /><rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
            </svg>
          </div>
          Trello
        </div>
        <div className="bt" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></svg>
          <b>Sign in</b><span className="sep" />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
          Private board
        </div>
        <div className="tr">
          <span className="avs" aria-hidden="true">{'PAMJ'.split('').map((w) => <i className="av" key={w} style={{ background: AV[w] }}>{w}</i>)}</span>
          <Link className="su" to="/signup">Sign up</Link>
        </div>
      </header>

      <div className="bd">
        <div className="tilt" aria-hidden="true">
          {LANES.map((name, li) => (
            <section className={'lane lane-' + (li + 1)} key={name}>
              <h2><span>{name}</span><em>{lanes[li].length + (li === 1 && !ok ? 1 : 0) + (li === 2 && ok ? 1 : 0)}</em></h2>
              {li === 1 && <div className="sp" />}
              {lanes[li].map((id) => <Card key={id} id={id} />)}
            </section>
          ))}
        </div>

        <div className="fcw">
          <form className="fc" data-s={status} ref={fc} onSubmit={handleSubmit}>
            <div className="cov" />
            <div className="chips">
              <span className="st" data-s={status}>{status}</span>
              <span className="tg">Sign in</span>
              <span className="prog" aria-hidden="true"><i className={emailOk ? 'on' : ''} /><i className={hasPw ? 'on' : ''} /><b>{(emailOk ? 1 : 0) + (hasPw ? 1 : 0)}/2</b></span>
            </div>
            <h1>Welcome back</h1>
            <p className="ds" aria-live="polite">{desc}</p>
            {error && <div className="err" role="alert"><b>Blocked</b>{error}</div>}

            <div className="row">
              <span className={'cbx' + (emailOk ? ' on' : '')} />
              <label className="fld">
                <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder=" " autoComplete="email" required />
                <span>Email</span><i className="ln" />
              </label>
            </div>
            <div className="row">
              <span className={'cbx' + (hasPw ? ' on' : '')} />
              <label className="fld">
                <input id="password" type={show ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder=" " autoComplete="current-password" required />
                <span>Password</span>
                <button type="button" className="eye" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
                <i className="ln" />
              </label>
            </div>

            <button className="go" type="submit" disabled={loading || ok}>
              {loading ? <span className="dots"><i /><i /><i /></span> : ok ? "You're in" : 'Log in'}
            </button>
            <p className="alt">Don't have an account? <Link to="/signup">Sign up</Link></p>
          </form>
        </div>
      </div>

      <div className="note" aria-hidden="true">Your boards missed you.</div>
    </div>
  )
}

export default LoginPage