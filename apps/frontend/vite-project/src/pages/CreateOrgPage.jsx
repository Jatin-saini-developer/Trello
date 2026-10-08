import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import api from '../utils/api.js'
import { LANES } from '../components/BoardCard.jsx'
import './LoginPage.css' // shared styles: header, background, inputs, buttons
import './CreateOrgPage.css'

const TILES = ['#D97757', '#6FB38E', '#9C8FE0', '#E9A23B', '#5FA8D3']
const BURST = ['#D97757', '#6FB38E', '#9C8FE0', '#E9A23B', '#5FA8D3', '#D97757', '#6FB38E', '#9C8FE0']

const CreateOrgPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState(null); // keeps the preview alive after the inputs are cleared
    const root = useRef(null), winw = useRef(null), timer = useRef(0), reduce = useRef(false)

    useLayoutEffect(() => {
        reduce.current = matchMedia('(prefers-reduced-motion: reduce)').matches
        let off = () => {}
        const ctx = gsap.context(() => {
            if (!reduce.current) {
                gsap.from('.top', { opacity: 0, y: -14, duration: 0.8 })
                gsap.from('.cf > *', { opacity: 0, y: 28, duration: 0.8, stagger: 0.08, delay: 0.15, ease: 'power3.out' })
                gsap.from(winw.current, { opacity: 0, y: 50, scale: 0.94, duration: 1, delay: 0.3, ease: 'power3.out' })
            }
            gsap.set(winw.current, { transformPerspective: 1400 })
            const rx = gsap.quickTo(winw.current, 'rotationX', { duration: 1, ease: 'power3' })
            const ry = gsap.quickTo(winw.current, 'rotationY', { duration: 1, ease: 'power3' })
            const mm = (e) => {
                if (reduce.current) return
                rx(-(e.clientY / innerHeight - 0.5) * 6); ry((e.clientX / innerWidth - 0.5) * 8)
            }
            addEventListener('pointermove', mm)
            off = () => removeEventListener('pointermove', mm)
        }, root)
        return () => { off(); clearTimeout(timer.current); ctx.revert() }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Organisation name cannot be empty.");
            return;
        }
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const token = localStorage.getItem("token");
            const { data } = await api.post(
                "/createorg",
                { name: name.trim(), description: description.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess(`"${data.org.name}" created successfully!`);
            setCreated({ name: data.org.name, desc: description.trim() });
            setName("");
            setDescription("");
            if (!reduce.current) gsap.to(winw.current, { scale: 1.06, duration: 1.2, ease: 'power2.inOut' })
            // Redirect after short delay
            timer.current = setTimeout(() => navigate("/dashboard"), 1500);
        } catch (err) {
            const message =
                err.response?.data?.message || "Something went wrong.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const ok = !!created
    const shown = ok ? created.name : name.trim()
    const desc = ok ? created.desc : description.trim()
    const words = shown.split(/\s+/).filter(Boolean)
    const ini = (words.length > 1 ? words[0][0] + words[1][0] : shown.slice(0, 2)).toUpperCase()
    const color = TILES[[...shown].reduce((a, c) => a + c.charCodeAt(0), 0) % TILES.length]
    const size = shown.length > 22 ? 3 : shown.length > 13 ? 2 : 1
    const hint = ok ? 'Your workspace is ready.' : loading ? 'Setting things up…' : error ? "Let's fix that and try again." : shown.length > 2 ? 'Good name.' : 'One last thing before your boards.'

    return (
        <div className="lg co-root" ref={root}>
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
                <div className="bt" aria-hidden="true"><b>New organisation</b><span className="sep" />Only you can see this</div>
                <div className="tr"><button type="button" className="su" onClick={() => navigate(-1)}>Go back</button></div>
            </header>

            <div className="co">
                <form className="cf" onSubmit={handleSubmit}>
                    <p className="hint" aria-live="polite">{hint}</p>
                    <h1>Name your team's home.</h1>
                    <p className="ds">Give your team a home. You can invite members after setup.</p>

                    {error && <div className="err" role="alert"><b>Blocked</b>{error}</div>}
                    {success && <div className="okb" role="status"><b>Created</b>{success}</div>}

                    <label className="fld">
                        <input id="orgName" type="text" value={name} placeholder=" " autoFocus required
                            onChange={(e) => { setName(e.target.value); setError(""); }} />
                        <span>Organisation name</span><i className="ln" />
                    </label>
                    <label className="fld">
                        <textarea id="orgDesc" rows={2} value={description} placeholder=" "
                            onChange={(e) => setDescription(e.target.value)} />
                        <span>Description (optional)</span><i className="ln" />
                    </label>

                    <button id="create-org-btn" className="go" type="submit" disabled={loading || ok}>
                        {loading ? <span className="dots"><i /><i /><i /></span> : ok ? 'Opening your dashboard…' : 'Create organisation'}
                    </button>
                </form>

                <div className="winw" ref={winw} aria-hidden="true">
                    <div className={'win' + (ok ? ' ok' : '')}>
                        <div className="tb"><i /><i /><i /><span>Workspace preview</span></div>
                        <div className="wb">
                            <aside className="sd">
                                <div className="org">
                                    <div className="tile" style={{ background: shown ? color : '#e3dac7' }}>
                                        {ini}
                                        <b className="chk" />
                                        <span className="bst">{BURST.map((c, i) => <i key={i} style={{ '--c': c, '--a': i * 45 + 'deg' }} />)}</span>
                                    </div>
                                    <div><strong>{shown || 'Your organisation'}</strong><small>Workspace</small></div>
                                </div>
                                <nav><span className="ni act"><i />Boards</span><span className="ni"><i />Members</span><span className="ni"><i />Settings</span></nav>
                                <span className="inv">Invite members</span>
                            </aside>
                            <div className="mn">
                                <h2 className={'wt s' + size + (shown ? '' : ' ph')}>
                                    {shown ? [...shown].map((ch, i) => <span key={i + ch}>{ch}</span>) : 'Your organisation'}
                                </h2>
                                {desc ? <p className="wd">{desc}</p> : <div className="wd sk2"><i /><i /></div>}
                                <div className="ml">
                                    {LANES.map((l, li) => (
                                        <div className="mlane" key={l}>
                                            <b>{l}</b>
                                            {Array.from({ length: [2, 1, 1][li] }).map((_, k) => <div className="sk" key={k}><i /><i /></div>)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateOrgPage;