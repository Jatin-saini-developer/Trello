// One shared requestAnimationFrame loop for everything (Lenis, WebGL, DOM effects).
const fns = new Set()
let on = false
function loop(t) {
  fns.forEach((f) => f(t))
  requestAnimationFrame(loop)
}
export function onTick(f) {
  fns.add(f)
  if (!on) { on = true; requestAnimationFrame(loop) }
  return () => { fns.delete(f) }
}
