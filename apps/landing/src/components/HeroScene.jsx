import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { S, clamp, lerp } from '../lib/scroll'
import { onTick } from '../lib/ticker'

const VS = 'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}'

// Light paper background with soft peach, sage and lilac glows that follow the cursor
const BG_FS = `varying vec2 v;uniform float uT,uA,uP;uniform vec2 uM;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
  vec2 p=(v-.5)*vec2(uA,1.)*2.;vec2 m=(uM-.5)*vec2(uA,1.)*2.;float t=uT*.18;
  vec3 col=vec3(.957,.937,.898);
  for(int i=0;i<3;i++){float f=float(i);
    vec2 c=vec2(sin(t*(1.+f*.6)+f*2.)*.55,cos(t*(1.2+f*.4)+f)*.3-.15);
    vec3 tint=i==0?vec3(.99,.76,.64):(i==1?vec3(.76,.89,.79):vec3(.80,.77,.96));
    col=mix(col,tint,exp(-length(p-c)*1.5)*.8*(1.-uP*.6));}
  col=mix(col,vec3(.98,.72,.58),exp(-length(p-m*.7)*2.4)*.55*(1.-uP*.6));
  col+=(h(v*900.+uT)-.5)*.03;
  gl_FragColor=vec4(col,1.);}`

// White cards on the paper, with a soft shadow; blur grows with distance from the focal plane
const CARD_FS = `varying vec2 v;uniform float uB,uF;uniform vec3 uC;
float bar(vec2 q,vec2 c,vec2 hh,float s){vec2 d=abs(q-c)-hh;return 1.-smoothstep(-s,s,max(d.x,d.y));}
float circ(vec2 q,vec2 c,float r,float s){return 1.-smoothstep(r-s,r+s,length(q-c));}
float rb(vec2 q){vec2 d=abs(q)-(vec2(.85,.5)-.12);return length(max(d,0.))+min(max(d.x,d.y),0.)-.12;}
void main(){
  vec2 q=(v-.5)*vec2(2.1,1.5);
  float sd=rb(q);
  float s=.01+uB;
  float fill=1.-smoothstep(-s,s,sd);
  float edge=1.-smoothstep(0.,s+.01,abs(sd+.004));
  float sh=(1.-smoothstep(-.02,.16+uB*1.5,rb(q+vec2(0.,.07))))*.2;
  float k=1.-clamp(uB*7.,0.,1.);
  float c=bar(q,vec2(-.12,.2),vec2(.5,.03),s)*.9+bar(q,vec2(-.28,.06),vec2(.34,.022),s)*.55+bar(q,vec2(-.2,-.04),vec2(.42,.022),s)*.4;
  float dt=circ(q,vec2(-.66,-.3),.045,s);float av=circ(q,vec2(.62,-.3),.075,s)*.8;
  vec3 col=mix(vec3(.985,.975,.95),vec3(1.),v.y);
  col=mix(col,vec3(.84,.81,.73),clamp(c,0.,1.)*k);
  col=mix(col,uC,clamp(dt+av*.6,0.,1.)*k);
  col=mix(col,vec3(.89,.86,.79),edge*.8);
  col=mix(vec3(.35,.24,.1),col,fill);
  gl_FragColor=vec4(col,max(fill,sh)*uF);}`

const COLORS = ['#D97757', '#6FB38E', '#9C8FE0', '#E9A23B', '#5FA8D3']
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }

export default function HeroScene() {
  const ref = useRef(null)

  useEffect(() => {
    THREE.ColorManagement.enabled = false // keep hex colours identical to the shaders
    let R
    try { R = new THREE.WebGLRenderer({ canvas: ref.current, antialias: true }) } catch (e) { return }
    R.setPixelRatio(Math.min(devicePixelRatio, 2))
    R.setClearColor(0xf4efe5)

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

    const geo = new THREE.PlaneGeometry(2.1, 1.5)
    const grp = new THREE.Group()
    scene.add(grp)
    const cards = Array.from({ length: 9 }, (_, i) => {
      const u = { uB: { value: 0 }, uF: { value: 0 }, uC: { value: new THREE.Color(COLORS[i % 5]) } }
      const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: u, vertexShader: VS, fragmentShader: CARD_FS, transparent: true, depthWrite: false }))
      grp.add(m)
      return {
        m, u,
        ox: [-2.3, 0, 2.3][Math.floor(i / 3)], oy: [1.4, 0.2, -1][i % 3],
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

  return <canvas ref={ref} className="fixed inset-0 z-0 h-full w-full bg-[#F4EFE5]" />
}
