import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { S, clamp, lerp } from '../lib/scroll'
import { onTick } from '../lib/ticker'

const VS = 'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}'

const BG_FS = `varying vec2 v;uniform float uT,uA,uP;uniform vec2 uM;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
  vec2 p=(v-.5)*vec2(uA,1.)*2.;vec2 m=(uM-.5)*vec2(uA,1.)*2.;float t=uT*.18;float d=0.;
  for(int i=0;i<4;i++){float f=float(i);
    vec2 c=vec2(sin(t*(1.+f*.6)+f*2.)*.45,cos(t*(1.2+f*.4)+f)*.28-.3);
    d+=.16/(length(p-c)+.16);}
  d+=.22/(length(p-m*.7)+.2);
  d*=1.-uP*.55;
  vec3 col=vec3(.067,.102,.188);
  col+=vec3(.08,.11,.42)*smoothstep(.3,1.4,d);
  col=mix(col,vec3(.2,.5,.55),smoothstep(1.4,2.4,d)*.85);
  col=mix(col,vec3(.27,.79,.69),smoothstep(2.2,3.4,d)*.9);
  col*=1.-.15*length(v-.5);
  col+=(h(v*900.+uT)-.5)*.05;
  gl_FragColor=vec4(col,1.);}`

const CARD_FS = `varying vec2 v;uniform float uB,uF;uniform vec3 uC;
float bar(vec2 q,vec2 c,vec2 hh,float s){vec2 d=abs(q-c)-hh;return 1.-smoothstep(-s,s,max(d.x,d.y));}
float circ(vec2 q,vec2 c,float r,float s){return 1.-smoothstep(r-s,r+s,length(q-c));}
void main(){
  vec2 q=(v-.5)*vec2(1.7,1.);vec2 d=abs(q)-(vec2(.85,.5)-.12);
  float sd=length(max(d,0.))+min(max(d.x,d.y),0.)-.12;
  float s=.01+uB;
  float fill=1.-smoothstep(-s,s,sd);
  float edge=1.-smoothstep(0.,s+.01,abs(sd+.004));
  float k=1.-clamp(uB*7.,0.,1.);
  float c=bar(q,vec2(-.12,.2),vec2(.5,.03),s)*.9+bar(q,vec2(-.28,.06),vec2(.34,.022),s)*.5+bar(q,vec2(-.2,-.04),vec2(.42,.022),s)*.35;
  float dt=circ(q,vec2(-.66,-.3),.045,s);float av=circ(q,vec2(.62,-.3),.075,s)*.8;
  vec3 col=mix(vec3(.08,.12,.24),vec3(.15,.21,.35),v.y)+vec3(.9,.95,1.)*c*k*.8+uC*(dt+av*.6)*k+uC*edge*.55;
  gl_FragColor=vec4(col,(fill*.62+edge*.5)*uF);}`

const COLORS = ['#45cab0', '#fffde2', '#8793e8']
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }

export default function HeroScene() {
  const ref = useRef(null)

  useEffect(() => {
    THREE.ColorManagement.enabled = false // keep hex colors identical to the prototype
    let R
    try { R = new THREE.WebGLRenderer({ canvas: ref.current, antialias: true }) } catch (e) { return }
    R.setPixelRatio(Math.min(devicePixelRatio, 2))
    R.setClearColor(0x111a30)

    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 60)
    cam.position.z = 7

    const bgM = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uM: { value: new THREE.Vector2(0.5, 0.5) }, uA: { value: 1.7 }, uP: { value: 0 } },
      vertexShader: VS, fragmentShader: BG_FS, depthWrite: false,
    })
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(44, 22), bgM)
    bg.position.z = -9
    scene.add(bg)

    const geo = new THREE.PlaneGeometry(1.7, 1)
    const grp = new THREE.Group()
    scene.add(grp)
    const cards = Array.from({ length: 9 }, (_, i) => {
      const u = { uB: { value: 0 }, uF: { value: 0 }, uC: { value: new THREE.Color(COLORS[i % 3]) } }
      const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: u, vertexShader: VS, fragmentShader: CARD_FS, transparent: true, depthWrite: false }))
      grp.add(m)
      return {
        m, u,
        ox: [-2.3, 0, 2.3][i % 3], oy: [1.4, 0.2, -1][Math.floor(i / 3)],
        cx: (rnd(i * 3 + 1) - 0.5) * 10, cy: (rnd(i * 3 + 2) - 0.5) * 5.4, cz: (rnd(i * 3 + 3) - 0.5) * 5.4,
        rx: (rnd(i + 40) - 0.5) * 1.2, ry: (rnd(i + 50) - 0.5) * 1.2, rz: (rnd(i + 60) - 0.5) * 1.6, sp: 0.5 + rnd(i + 70),
      }
    })

    const resize = () => {
      const w = innerWidth, h = innerHeight
      R.setSize(w, h, false)
      cam.aspect = w / h
      cam.updateProjectionMatrix()
      bgM.uniforms.uA.value = w / h
      grp.scale.setScalar(Math.min(1, w / h / 1.5))
    }
    addEventListener('resize', resize)
    resize()

    let mx = 0.5, my = 0.5
    const t0 = performance.now()
    const off = onTick(() => {
      const t = (performance.now() - t0) / 1000, P = S.P
      mx += (S.mx - mx) * 0.06
      my += (S.my - my) * 0.06
      bgM.uniforms.uT.value = t
      bgM.uniforms.uM.value.set(mx, my)
      bgM.uniforms.uP.value = P
      grp.rotation.y = (mx - 0.5) * 0.2
      grp.rotation.x = -(my - 0.5) * 0.14
      cards.forEach((c, i) => {
        const pc = clamp(P * 1.35 - i * 0.05, 0, 1), e = pc * pc * (3 - 2 * pc)
        const fl = S.reduce ? 0 : (1 - e) * Math.sin(t * c.sp + i) * 0.16
        c.m.position.set(lerp(c.cx, c.ox, e), lerp(c.cy, c.oy, e) + fl, lerp(c.cz, 0, e))
        c.m.rotation.set(lerp(c.rx, 0, e), lerp(c.ry, 0, e), lerp(c.rz, 0, e))
        c.u.uB.value = Math.min(0.16, Math.abs(c.m.position.z) * 0.05)
        c.u.uF.value = S.intro
      })
      if (scrollY < innerHeight * 2.5) R.render(scene, cam) // stop drawing once the page covers it
    })

    return () => {
      off()
      removeEventListener('resize', resize)
      geo.dispose(); bg.geometry.dispose(); R.dispose()
    }
  }, [])

  return <canvas id="gl" ref={ref} />
}
