import { useEffect, useRef, useState } from 'react'

// true once the element has scrolled into view (used for reveal animations)
export default function useSeen(threshold = 0.2) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([x]) => { if (x.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [threshold])
  return [ref, seen]
}
