import React from 'react'

export default function Footer({contact}){
  return (
    <footer className="py-10 px-6 border-t border-white/6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm">© Lingua Universalis</div>
        <div className="text-sm opacity-90">{contact.email}</div>
      </div>
    </footer>
  )
}
