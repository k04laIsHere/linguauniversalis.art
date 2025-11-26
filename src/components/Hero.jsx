import React from 'react'
import { motion } from 'framer-motion'

export default function Hero({hero}){
  return (
    <section className="h-screen relative flex items-center justify-center overflow-hidden" aria-label="hero">
      <div className="absolute inset-0 -z-10">
        <motion.div initial={{scale:1}} animate={{scale:1.06}} transition={{duration:40, ease:'linear'}} className="w-full h-full bg-center bg-cover" style={{backgroundImage:`url(${hero.image})`}} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/70" />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="overlay-note font-serif">Lingua</div>
      </div>

      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:1}} className="text-center px-6">
        <h1 className="font-serif display-title text-5xl md:text-7xl">{hero.title}</h1>
        <p className="mt-6 text-lg md:text-xl display-sub max-w-2xl mx-auto">{hero.subtitle}</p>
      </motion.div>

      <a href="#manifesto" className="absolute bottom-8 left-6 text-xs opacity-80">→ manifesto</a>
    </section>
  )
}
