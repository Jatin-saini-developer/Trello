export default function Brand({ className = '' }) {
  return (
    <a href="#" className={`flex items-center gap-2 text-[17px] font-bold tracking-tight ${className}`}>
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#D97757]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1" fill="white" /><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
          <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" /><rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
        </svg>
      </span>
      Seiton
    </a>
  )
}
