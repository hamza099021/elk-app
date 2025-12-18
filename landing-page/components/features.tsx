"use client"

import { Zap, Eye, Lock, Cpu, Headphones, Settings } from "lucide-react"
import AnimatedHeading from './animated-heading'

const features = [
  {
    icon: Eye,
    title: "Complete Invisibility",
    description: "Undetectable in video calls and screen shares",
  },
  {
    icon: Lock,
    title: "Privacy-First",
    description: "All data stored locally, zero telemetry",
  },
  {
    icon: Zap,
    title: "Blazing Fast",
    description: "~10MB size, 27x smaller than alternatives",
  },
  {
    icon: Cpu,
    title: "Instant Startup",
    description: "Launches in under 100ms",
  },
  {
    icon: Headphones,
    title: "Any AI Provider",
    description: "OpenAI, Claude, Gemini, Grok, or custom",
  },
  {
    icon: Settings,
    title: "Full Control",
    description: "Customize everything to your needs",
  },
  {
    icon: Settings,
    title: "Full Control",
    description: "Customize everything to your needs",
  },
  {
    icon: Settings,
    title: "Full Control",
    description: "Customize everything to your needs",
  },
  {
    icon: Settings,
    title: "Full Control",
    description: "Customize everything to your needs",
  },
  {
    icon: Settings,
    title: "Full Control",
    description: "Customize everything to your needs",
  },
  {
    icon: Settings,
    title: "Full Control",
    description: "Customize everything to your needs",
  },
  {
    icon: Settings,
    title: "Full Control",
    description: "Customize everything to your needs",
  },

]

export default function Features() {
  return (
    <section id="features" className="py-20 relative overflow-hidden">
      {/* Image 8 as background */}
      <div className="absolute inset-0">
        <img 
          src="/image 8.jpg" 
          alt="" 
          className="w-full h-full object-cover"
        />
        {/* Slight overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <AnimatedHeading text="Why Pluely?" className="text-3xl sm:text-4xl font-bold text-center mb-4 text-white drop-shadow-lg" />
        <p className="text-white/90 text-center max-w-2xl mx-auto mb-16 data-animate">
          Pluely redefines what an AI assistant can be. Built from the ground up with privacy, performance, and
          discretion in mind.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative overflow-hidden bg-white/10 backdrop-blur-lg border flex items-center gap-4 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-xl px-4 py-3 hover:bg-white/10 hover:border-white/40 transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >

              <feature.icon size={24} className="text-white relative z-10" />

              <div className="relative z-10">
                <h3 className="text-md text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/80 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
