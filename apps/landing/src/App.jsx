import { useEffect } from 'react'
import { initScroll } from './lib/scroll'
import HeroScene from './components/HeroScene'
import Hero from './components/Hero'
import Features from './components/Features'
import Story from './components/Story'
import Closing from './components/Closing'

export default function App() {
  useEffect(() => initScroll(), [])
  return (
    <div className="font-sans text-[#1B1A17]">
      <HeroScene />
      <Hero />
      <main className="h-[240vh]" />
      <Features />
      <Story />
      <Closing />
    </div>
  )
}
