import React from 'react'
import { Menu } from 'lucide-react'

export default function Nav({lang,setLang,label}){
  return (
    <nav className="fixed top-6 left-6 right-6 z-40 flex justify-between items-center pointer-events-auto">
      <div className="text-sm font-serif opacity-95">Lingua Universalis</div>

      <div className="flex items-center gap-4">
        <button onClick={()=>setLang(lang==='ru'? 'en': 'ru')} aria-label="toggle-language" className="text-xs tracking-wider uppercase opacity-80 -rotate-0">
          {label}
        </button>
        <button className="md:hidden p-2 rounded bg-white/3" aria-label="menu">
          <Menu size={18} />
        </button>
      </div>
    </nav>
  )
}
