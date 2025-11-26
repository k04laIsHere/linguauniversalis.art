import React from 'react'
import { motion } from 'framer-motion'

export default function Gallery({images}){
  return (
    <section className="min-h-screen py-16 px-6" id="gallery">
      <div className="max-w-6xl mx-auto">
        <h3 className="font-serif text-2xl mb-6">Gallery</h3>
        <div className="columns-2 md:columns-4 gap-4">
          {images.map((src,i)=> (
            <motion.img key={i} src={src} alt={`gallery-${i}`} className="mb-4 w-full object-cover rounded" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{duration:0.7}} />
          ))}
        </div>
      </div>
    </section>
  )
}
