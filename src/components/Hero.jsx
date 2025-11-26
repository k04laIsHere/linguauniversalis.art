import React from 'react'
import { motion } from 'framer-motion'

export default function Hero({hero}){
  return (
    <section className="h-screen relative flex items-center justify-center overflow-hidden" aria-label="hero">
      <div className="absolute inset-0 -z-10">
        <motion.div initial={{scale:1}} animate={{scale:1.08}} transition={{duration:30, ease:'linear'}} className="w-full h-full bg-center bg-cover" style={{backgroundImage:`url(${hero.image})`}} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/60" />
      </div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:1}} className="text-center px-6">
        <h1 className="font-serif text-5xl md:text-7xl leading-tight tracking-tight">{hero.title}</h1>
        <p className="mt-4 text-xl md:text-2xl opacity-90">{hero.subtitle}</p>
      </motion.div>

      <a href="#manifesto" className="absolute bottom-10 left-1/2 -translate-x-1/2 text-sm opacity-80">Scroll</a>
    </section>
  )
}
