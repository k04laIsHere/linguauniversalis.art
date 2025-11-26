import React from 'react'
import { motion } from 'framer-motion'

export default function Characters({characters}){
  return (
    <section className="h-screen flex items-center justify-center px-6" id="characters">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {characters.map((c, i)=> (
          <motion.article key={i} className="rounded overflow-hidden bg-black/30" initial={{opacity:0, y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.7, delay:i*0.15}}>
            <div className="h-72 md:h-96 w-full relative">
              <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
              <div className="absolute left-4 bottom-4 text-white">
                <h3 className="font-serif text-2xl">{c.name}</h3>
                <div className="text-sm opacity-90">{c.role}</div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm opacity-90">{c.desc}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
