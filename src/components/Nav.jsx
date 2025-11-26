import React from 'react'
import { Menu } from 'lucide-react'

export default function Nav({lang,setLang,label}){
  return (
    <nav className="fixed top-6 left-0 right-0 z-40 px-6 flex justify-between items-center">
      <div className="text-sm font-serif text-paper/90">Lingua Universalis</div>
      <div className="flex items-center gap-4">
        <button onClick={()=>setLang(lang==='ru'? 'en': 'ru')} className="px-3 py-1 border border-paper/20 rounded backdrop-blur-sm">
          {label}
        </button>
        <button className="md:hidden p-2 rounded bg-white/3">
          <Menu size={18} />
        </button>
      </div>
    </nav>
  )
}
