import React from 'react'
import { motion } from 'framer-motion'

export default function Manifesto({manifesto}){
  return (
    <section id="manifesto" className="h-screen flex items-center justify-center px-6">
      <motion.div className="max-w-3xl prose prose-invert" initial={{opacity:0, y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.9}}>
        <h2 className="font-serif text-3xl">{manifesto.heading}</h2>
        <p className="mt-4 text-lg leading-relaxed">{manifesto.text}</p>
      </motion.div>
    </section>
  )
}
