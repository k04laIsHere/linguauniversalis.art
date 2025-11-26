import React from 'react'
import { motion } from 'framer-motion'

export default function Manifesto({manifesto}){
  return (
    <section id="manifesto" className="min-h-screen flex items-center justify-center px-6 py-24">
      <motion.div className="manifesto-wrap text-center" initial={{opacity:0, y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.9}}>
        <h2 className="font-serif text-3xl mb-6">{manifesto.heading}</h2>
        <p className="mt-4">{manifesto.text}</p>
      </motion.div>
    </section>
  )
}
