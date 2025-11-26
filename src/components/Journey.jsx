import React from 'react'
import { motion } from 'framer-motion'

export default function Journey({items}){
  return (
    <section className="h-screen flex items-center justify-center px-6" id="journey">
      <div className="w-full max-w-3xl">
        {items.map((it, idx)=> (
          <motion.div key={idx} className="mb-6 p-6 bg-black/25 rounded" initial={{opacity:0, x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.6, delay:idx*0.12}}>
            <div className="text-sm opacity-80">{it.year}</div>
            <h4 className="font-serif text-xl mt-1">{it.title}</h4>
            <p className="mt-2 text-sm opacity-90">{it.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
