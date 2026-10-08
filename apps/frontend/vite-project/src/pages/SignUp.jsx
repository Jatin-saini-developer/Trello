import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import api from '../utils/api.js'
import Card, { AV, LANES } from '../components/BoardCard.jsx'
import './LoginPage.css' // the signup page shares the board styles with the login page

gsap.registerPlugin(Flip)

const SignUp = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [show, setShow] = useState(false)
  const [lanes, setLanes] = useState([[0, 1, 2], [3, 4, 5, 6], [7, 8, 9, 10]])
  const root = useRef(null), fc = useRef(null)
  const lanesRef = useRef(lanes), flip = useRef(null), lift = useRef(null), step = useRef(0)
  const S = useRef({ reduce: false, t: 0 })
  lanesRef.current = lanes

  const { name, email, password, confirmPassword } = formData
  const nameOk = name.trim().length >= 2
  const emailOk = /^\S+@\S+\.\S+$/.test(email)
  const pwOk = password.length >= 8
  const match = confirmPassword.length > 0 && confirmPassword === password
  const done = [nameOk, emailOk, pwOk, match]
  const score = password.length < 4 ? 0 : password.length < 8 ? 1 : 2 + (password.length >= 12 || /[^A-Za-z0-9]/.test(password) ? 1 : 0)
  const status = ok ? 'Done' : error ? 'Blocked' : loading || name || email || password || confirmPassword ? 'In progress' : 'To do'
  const desc = ok ? 'Done. Setting up your workspace…' : loading ? 'Moving your card along…' : 'Fill in this card to get your own workspace.'

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
      const ro = new ResizeObserver(() => root.current.style.setProperty('--fh', fc.current.offsetHeight + 'px'))
      ro.observe(fc.current)
      st.off = () => { removeEventListener('pointermove', mm); ro.disconnect() }
    }, root)
    return () => { st.off && st.off(); clearTimeout(st.t); ctx.revert() }
  }, [])

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

  // success: the card travels from To do all the way across to Done
  const finish = () => {
    const st = S.current
    if (st.reduce) { st.t = setTimeout(() => navigate('/createOrg'), 200); return }
    const dx = 2 * (root.current.querySelector('.lane').offsetWidth + 20)
    gsap.to('.lane-3 .kc', { y: fc.current.offsetHeight + 10, duration: 0.7, delay: 0.5, ease: 'power3.inOut' })
    gsap.to(fc.current, { x: dx, rotation: 2.5, duration: 1.2, delay: 0.6, ease: 'power3.inOut' })
    st.t = setTimeout(() => navigate('/createOrg'), 2300)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup', { name, email, password })
      localStorage.setItem('token', data.token)
      setOk(true)
      finish()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const FIELDS = [
    ['name', 'Full name', 'text', 'name', nameOk],
    ['email', 'Email', 'email', 'email', emailOk],
    ['password', 'Password', show ? 'text' : 'password', 'new-password', pwOk],
    ['confirmPassword', 'Confirm password', show ? 'text' : 'password', 'new-password', match],
  ]

  return (
    <div className="lg lft" ref={root}>
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
          <b>Sign up</b><span className="sep" />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
          Private board
        </div>
        <div className="tr">
          <span className="avs" aria-hidden="true">{'PAMJ'.split('').map((w) => <i className="av" key={w} style={{ background: AV[w] }}>{w}</i>)}</span>
          <Link className="su" to="/login">Log in</Link>
        </div>
      </header>

      <div className="bd">
        <div className="tilt" aria-hidden="true">
          {LANES.map((laneName, li) => (
            <section className={'lane lane-' + (li + 1)} key={laneName}>
              <h2><span>{laneName}</span><em>{lanes[li].length + (li === 0 && !ok ? 1 : 0) + (li === 2 && ok ? 1 : 0)}</em></h2>
              {li === 0 && <div className="sp" />}
              {lanes[li].map((id) => <Card key={id} id={id} />)}
            </section>
          ))}
        </div>

        <div className="fcw">
          <form className={'fc' + (loading ? ' busy' : '') + (ok ? ' ok' : '')} data-s={status} ref={fc} onSubmit={handleSubmit}>
            <div className="cov" />
            <div className="chips">
              <span className="st" data-s={status}>{status}</span>
              <span className="tg">Sign up</span>
              <span className="prog" aria-hidden="true">{done.map((d, i) => <i key={i} className={d ? 'on' : ''} />)}<b>{done.filter(Boolean).length}/4</b></span>
            </div>
            <h1>Create account</h1>
            <p className="ds" aria-live="polite">{desc}</p>
            {error && <div className="err" role="alert"><b>Blocked</b>{error}</div>}

            {FIELDS.map(([n, label, type, ac, good]) => (
              <div key={n}>
                <div className="row">
                  <span className={'cbx' + (good ? ' on' : '')} />
                  <label className="fld">
                    <input id={n} type={type} name={n} value={formData[n]} onChange={handleChange} placeholder=" " autoComplete={ac} minLength={n === 'password' ? 8 : undefined} required />
                    <span>{label}</span>
                    {n === 'password' && <button type="button" className="eye" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>}
                    <i className="ln" />
                  </label>
                </div>
                {n === 'password' && password && <div className="str" data-n={score}><i className={score > 0 ? 'on' : ''} /><i className={score > 1 ? 'on' : ''} /><i className={score > 2 ? 'on' : ''} /></div>}
                {n === 'confirmPassword' && confirmPassword && !match && <p className="mm">Doesn't match yet</p>}
              </div>
            ))}

            <button className="go" type="submit" disabled={loading || ok}>
              {loading ? <span className="dots"><i /><i /><i /></span> : ok ? "You're in" : 'Create account'}
            </button>
            <p className="alt">Already have an account? <Link to="/login">Log in</Link></p>
          </form>
        </div>
      </div>

      <div className="note" aria-hidden="true">Takes about a minute.</div>
    </div>
  )
}

export default SignUp