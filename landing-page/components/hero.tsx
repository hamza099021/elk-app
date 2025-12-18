"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"
import { motion } from "framer-motion"
import AnimatedHeading from "./animated-heading"

export default function Hero() {

  const cardWidth = 320;
  const cardHeight = 180;
  const snakeLength = 40;
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Light rounded box container - before header */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[100%] max-w-7xl min-h-[108vh] rounded-b-3xl bg-transparent/0 backdrop-blur-sm border-3 border-gray-200/60  z-[1]" />
  
      <section className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/video/bg-1-poster.jpg"
            className="w-full h-full object-cover"
          >
            <source src="/video/bg-1.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
        {/* Badge */}
        {/* <div className="flex justify-center mb-8">
          <Link
            href="https://github.com/iamsrikanthnani/pluely"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:bg-white/80 transition-all"
          >
            <span className="text-yellow-400">✨</span>
            <span className="text-sm text-gray-700">Open Source Alternative to Cluely</span>
            <ArrowRight size={16} className="text-gray-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div> */}

        {/* Main Heading */}
        <div className="text-center mb-12 space-y-4">
          <AnimatedHeading text="Your Invisible AI Assistant" className="text-5xl text-white sm:text-6xl lg:text-7xl font-medium leading-tight" />

          <p
            className="text-lg sm:text-xl text-white max-w-3xl font-light mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Pluely operates with complete stealth during meetings, interviews, and presentations. Undetectable in video
            calls, screen shares, and recordings. Built with Tauri and Rust for blazing-fast performance, ~10MB size,
            and absolute privacy. 
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
            style={{ animation: "fadeInUp 0.6s ease-out 0.2s both" }}
          >
            <Link
              href="#downloads"
              className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg"
            >
              Download Now
              <ArrowRight size={18} />
            </Link>
            <Link
              href="https://github.com/iamsrikanthnani/pluely"
              className="px-6 py-3 border-2 border-gray-300  text-white rounded-lg font-semibold hover:border-gray-400 hover:bg-white/50 backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <Star size={18} className="text-yellow-400" />
              <span className="text-white">1.2K stars on GitHub</span>
            </Link>
          </div>
        </div>

        {/* Hero Image/Demo */}

        <div className="rounded-xl relative bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-xl p-4 max-w-6xl mx-auto">
          <div
            className="absolute bottom-0 left-0 w-full h-1/2 rounded-b-2xl"
            style={{
              background: 'linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0))',
            }}
          />
          <img src="/app.png" alt="" className="rounded-xl" />
        </div>






        </div>
      </section>
    </>
  )
}
