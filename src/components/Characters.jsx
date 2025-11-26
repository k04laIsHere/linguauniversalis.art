import React from 'react'
import { motion } from 'framer-motion'

export default function Characters({characters}){
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20" id="characters">
      <div className="w-full max-w-6xl">
        <div className="characters-row">
          {characters.map((c,i)=> (
            <motion.article key={i} className="character-card bg-black/20 rounded overflow-hidden" initial={{opacity:0, y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.7, delay:i*0.12}}>
              <img src={c.img} alt={c.name} className="w-full h-56 md:h-auto" />
              <div className="p-6">
                <h3 className="font-serif text-2xl mb-2">{c.name}</h3>
                <div className="text-sm opacity-80 mb-4">{c.role}</div>
                <p className="text-sm opacity-80">{c.desc}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
