import React, { useState, useEffect } from 'react'
import data from './data'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Manifesto from './components/Manifesto'
import Characters from './components/Characters'
import Journey from './components/Journey'
import Gallery from './components/Gallery'
import Footer from './components/Footer'
import { AnimatePresence, motion } from 'framer-motion'

export default function App(){
  const [lang, setLang] = useState('ru') // default Russian

  useEffect(()=>{
    document.documentElement.lang = lang
  },[lang])

  const locale = data[lang]

  return (
    <div className="min-h-screen">
      <Nav lang={lang} setLang={setLang} label={locale.langLabel} />

      <main>
        <AnimatePresence mode="wait">
          <motion.div key={lang} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.6}}>
            <Hero hero={locale.hero} />
            <Manifesto manifesto={locale.manifesto} />
            <Characters characters={locale.characters} />
            <Journey items={locale.journey} />
            <Gallery images={locale.gallery} />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer contact={locale.contact} />
    </div>
  )
}
