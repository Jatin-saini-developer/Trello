import useSeen from '../lib/useSeen'

const FIVE_S = [['Seiri', 'Sort'], ['Seiton', 'Set in order'], ['Seiso', 'Shine'], ['Seiketsu', 'Standardise'], ['Shitsuke', 'Sustain']]

export default function Story() {
  const [ref, seen] = useSeen(0.25)
  const rise = (i) => ({ transitionDelay: `${i * 90}ms` })
  const cls = `transition-all duration-700 ease-out ${seen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`

  return (
    <section ref={ref} className="relative z-[4] bg-[#F4EFE5] px-[3vw] py-[16vh]">
      <p className="mb-[4vh] font-serif text-[clamp(16px,1.5vw,22px)] italic text-[#7A756B]">The name</p>
      <div className="grid gap-[6vh] lg:grid-cols-[1.1fr_1fr] lg:gap-[6vw]">
        <h2 style={rise(0)} className={`m-0 font-serif text-[clamp(72px,14vw,240px)] leading-[.9] tracking-[-.03em] ${cls}`}>Seiton</h2>
        <div style={rise(1)} className={`self-end ${cls}`}>
          <div className="mb-6 flex flex-wrap gap-2 text-sm font-bold">
            {['SAY-ton', '整頓', 'set in order'].map((c) => <span key={c} className="rounded-full bg-[#fde6dc] px-3 py-1 text-[#C4603F]">{c}</span>)}
          </div>
          <p className="mb-5 max-w-[34rem] text-[17px] leading-relaxed text-[#4a463e]">
            Seiton is the second of the 5S, a workplace method from Japanese manufacturing. The idea is simple: a place for everything, and everything in its place.
          </p>
          <p className="max-w-[34rem] text-[17px] leading-relaxed text-[#4a463e]">
            Kanban boards come from the same Toyota-era tradition. We built Seiton to give your team's work that same calm: every issue in a section, every section on a board, every board in an organisation.
          </p>
        </div>
      </div>
      <ol className="m-0 mt-[10vh] grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-5">
        {FIVE_S.map(([n, m], i) => (
          <li key={n} style={rise(i + 2)} className={`rounded-2xl border p-5 ${i === 1 ? 'border-transparent bg-[#D97757] text-white' : 'border-[#E4DDCD] bg-white/60'} ${cls}`}>
            <p className="font-serif text-3xl leading-none">{n}</p>
            <p className={`mt-2 text-sm ${i === 1 ? 'text-[#FFE6D8]' : 'text-[#7A756B]'}`}>{m}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
