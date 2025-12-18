"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import AnimatedHeading from './animated-heading'

export default function WhyPluely() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const features = [
    {
      title: "Complete Invisibility",
      description:
        "Pluely's translucent overlay window sits above all applications, invisible in video calls, screen shares, and recordings. Perfect stealth for meetings on Zoom, Google Meet, Microsoft Teams, and Slack Huddles.",
      video: "/video/complete-1.mp4",
    },
    {
      title: "Keyboard Shortcuts",
      description:
        "Fully customizable global shortcuts for instant access. Toggle window, Dashboard, System Audio, Voice Input, Screenshot, and more with custom keybindings.",
      video: "/video/complete-2.mp4",
    },
    {
      title: "Always On Top",
      description:
        "Position your AI assistant anywhere on screen with smooth drag-and-drop. Adjustable transparency, always-on-top mode, and instant keyboard access keep Pluely ready when you need it.",
      video: "/video/complete-3.mp4",
    },
    {
      title: "AI-Powered Assistance",
      description:
        "Get intelligent suggestions and real-time help powered by advanced AI. From code completion to meeting summaries, Pluely understands context and delivers relevant assistance instantly.",
      video: "/video/complete-4.mp4",
    },
    {
      title: "Multi-Platform Support",
      description:
        "Seamlessly works across Windows, macOS, and Linux. Your AI assistant follows you everywhere, maintaining consistent experience across all your devices and workflows.",
      video: "/video/slide-1.mp4",
    },
  ]

  return (
    <section ref={sectionRef} id="why" className="py-10 px-4 sm:px-6 lg:px-8 mx-6 my-6 rounded-3xl bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg perspective-1000">
      <div className="mb-10 flex justify-center flex-col items-center text-center">
        <AnimatedHeading text="Enterprise-Grade Features Built for Privacy" className="text-5xl font-bold mb-4" />
        <p className="max-w-2xl text-center text-gray-600">Connect to any AI provider using simple curl commands. OpenAI, Anthropic, Google, xAI, Mistral, Cohere, Perplexity, Groq, Ollama, or your own custom endpoint. Switch providers anytime without losing your chat history or configuration.</p>
      </div>
      <div className="max-w-5xl mx-auto">


        <div className="grid lg:grid-cols-[2fr_3fr] gap-6">
          {/* Accordion */}
          <div 
            className={`space-y-4 w-full transition-all duration-1000 ease-out ${
              isVisible 
                ? "opacity-100 translate-x-0 rotate-y-0" 
                : "opacity-0 -translate-x-20 rotate-y-[-15deg]"
            }`}
            style={{ 
              transformStyle: 'preserve-3d',
              transform: isVisible ? 'perspective(1000px) rotateY(0deg)' : 'perspective(1000px) rotateY(-15deg)',
              transitionDelay: '0.2s'
            }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white/60 backdrop-blur-sm border-b border-gray-200/50 overflow-hidden transition-all duration-700 ease-out ${
                  isVisible 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-10"
                }`}
                style={{ 
                  transitionDelay: isVisible ? `${0.3 + index * 0.1}s` : '0s'
                }}
              >
                <button
                  onClick={() => setActiveIndex(index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${activeIndex === index ? "rotate-180" : ""
                      }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${activeIndex === index ? "max-h-48 pb-6 px-6" : "max-h-0"
                    }`}
                >
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Video Box */}
          <div 
            className={`relative rounded-xl bg-gray-100 backdrop-blur-xl border border-gray-200/50 p-2 w-full h-full transition-all duration-1000 ease-out ${
              isVisible 
                ? "opacity-100 translate-x-0" 
                : "opacity-0 translate-x-20"
            }`}
            style={{ 
              transformStyle: 'preserve-3d',
              transform: isVisible ? 'perspective(1000px) rotateY(0deg)' : 'perspective(1000px) rotateY(15deg)',
              transitionDelay: '0.4s'
            }}
          >
            <div className="relative rounded-xl overflow-hidden border border-gray-200/50 h-full bg-white/40">
              <video
                key={activeIndex}
                loop
                muted
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-xl"
              >
                <source src={features[activeIndex].video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>


        </div>
        {/* <div className="text-center mt-30 w-full">
          <h2 className="text-gray-900 font-medium text-2xl mb-3">Pre-Configured AI Providers</h2>
          <div className="grid-cols-3 grid-cols-2 grid  items-center  mx-auto  gap-4 w-full mt-4">
            <div className="border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-md text-gray-600 p-4 rounded-xl hover:bg-white/80 hover:shadow-lg transition-all">
              <h2 className="text-gray-600 text-left text-sm">Mistral AI: Access Mistral Large, Medium, and Small models with your API key</h2>
            </div>
            <div className="border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-md text-gray-600 p-4 rounded-xl hover:bg-white/80 hover:shadow-lg transition-all">
              <h2 className="text-gray-600 text-left text-sm">Mistral AI: Access Mistral Large, Medium, and Small models with your API key</h2>
            </div>
            <div className="border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-md text-gray-600 p-4 rounded-xl hover:bg-white/80 hover:shadow-lg transition-all">
              <h2 className="text-gray-600 text-left text-sm">Mistral AI: Access Mistral Large, Medium, and Small models with your API key</h2>
            </div>
            <div className="border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-md text-gray-600 p-4 rounded-xl hover:bg-white/80 hover:shadow-lg transition-all">
              <h2 className="text-gray-600 text-left text-sm">Mistral AI: Access Mistral Large, Medium, and Small models with your API key</h2>
            </div>
            <div className="border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-md text-gray-600 p-4 rounded-xl hover:bg-white/80 hover:shadow-lg transition-all">
              <h2 className="text-gray-600 text-left text-sm">Mistral AI: Access Mistral Large, Medium, and Small models with your API key</h2>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  )
}
