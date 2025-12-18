"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Downloads", href: "#downloads" },
    { name: "Features", href: "#features" },
    { name: "Why Pluely?", href: "#why" },
    { name: "Pricing", href: "#pricing" },
    { name: "Affiliate", href: "#affiliate" },
  ]

  return (
 

   
    <header
      className={`fixed top-0 left-0 flex justify-evenly items-center my-4 right-0 mx-auto z-50 transition-all duration-300  ${
        isScrolled ? "h-20 w-[70%] border rounded-xl border-gray-200/50 bg-white/20 backdrop-blur-xl shadow-lg flex justify-center my-4": "h-20 w-full border-none bg-transparent"}`}
    >
       {/* <div className="absolute inset-0 z-0 top-0 flex items-center justify-center pointer-events-none">
        <div className="w-[100%] max-w-7xl h-[80%] rounded-3xl border border-gray-600/30 bg-[#1a1a1a]/70 backdrop-blur-sm" />
      </div> */}
     
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex justify-center items-center  font-bold text-black group-hover:scale-110 transition-transform">
              P
            </div>
            <span className="font-bold text-lg hidden sm:inline text-gray-900">Pluely</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 px-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 py-2 text-sm text-black hover:text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* <Link
              href="#billing"
              className={`px-4 py-2 text-sm bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-colors
                ${isScrolled ? "hidden" : "block"}`}
            >
              Billing
            </Link> */}
            <Link
              href="#license"
              className="px-4 py-2 text-sm bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              License
            </Link>
          </div>

          {/* Mobile Menu Button */}
          {/* <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button> */}
        
{/* 
        {}
        {isOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-4">
              <Link
                href="https://github.com/iamsrikanthnani/pluely"
                className="px-4 py-2 text-sm text-gray-300 border border-white/10 rounded-lg text-center"
              >
                GitHub
              </Link>
              <Link
                href="#billing"
                className="px-4 py-2 text-sm bg-white text-black rounded-lg font-semibold text-center hover:bg-gray-100 transition-colors"
              >
                Billing
              </Link>
              <Link
                href="#license"
                className="px-4 py-2 text-sm bg-white text-black rounded-lg font-semibold text-center hover:bg-gray-100 transition-colors"
              >
                License
              </Link>
            </div>
          </div>
        )}
      */}
    </header>
  
  )
}
