import { APP_URL } from '../lib/appUrl'
import useSeen from '../lib/useSeen'
import Brand from './Brand'

export default function Closing() {
  const [ref, seen] = useSeen(0.25)
  return (
    <>
      <section className="relative z-[4] bg-[#F4EFE5] px-[3vw] pb-[10vh]">
        <div ref={ref} className={`overflow-hidden rounded-[2rem] bg-[#D97757] px-[6vw] py-[12vh] text-[#FFF6EE] transition-all duration-[900ms] ease-out ${seen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="m-0 max-w-[14ch] font-serif text-[clamp(48px,9vw,140px)] leading-[.95] tracking-[-.02em]">Ready to put things in order?</h2>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[#FFE6D8]">Create an organisation, add your first board, and see where everything stands.</p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a href={APP_URL + '/signup'} className="group relative isolate overflow-hidden rounded-xl bg-[#FBF8F1] px-7 py-4 text-[15px] font-bold text-[#1B1A17] transition-colors duration-500 hover:text-white">
              <span className="absolute inset-0 -z-10 translate-y-full bg-[#1B1A17] transition-transform duration-500 ease-out group-hover:translate-y-0" />
              Start a board
            </a>
            <a href={APP_URL + '/login'} className="text-[15px] font-bold underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white">Log in</a>
          </div>
        </div>
      </section>

      <footer className="relative z-[4] bg-[#F4EFE5] px-[3vw] pb-10">
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-[#1b1a1726] pt-8 text-sm text-[#7A756B]">
          <Brand className="text-[#1B1A17]" />
          <nav className="flex gap-6 font-medium">
            <a href={APP_URL + '/login'} className="transition-colors hover:text-[#1B1A17]">Log in</a>
            <a href={APP_URL + '/signup'} className="transition-colors hover:text-[#1B1A17]">Sign up</a>
          </nav>
          <p className="m-0">© 2026 Seiton</p>
        </div>
      </footer>
    </>
  )
}
