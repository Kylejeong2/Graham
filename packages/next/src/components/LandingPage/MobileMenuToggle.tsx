'use client'

import React, { useState } from 'react'
import Image from 'next/image'

export function MobileMenuToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        className="ml-4 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image src="/svgs/ic_bars.svg" alt="Menu" width={24} height={24} />
      </button>
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#F5E6D3] border-b border-[#8B4513] md:hidden">
          {/* Add mobile menu items here */}
        </div>
      )}
    </>
  )
}