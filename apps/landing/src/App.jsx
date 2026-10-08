import { useEffect } from 'react'
import { initScroll } from './lib/scroll'
import HeroScene from './components/HeroScene'
import Hero from './components/Hero'
import Features from './components/Features'
import Play from './components/Play'

export default function App() {
  useEffect(() => initScroll(), [])
  return (
    <>
      <HeroScene />
      <Hero />
      <main />
      <Features />
      <Play />
    </>
  )
}
