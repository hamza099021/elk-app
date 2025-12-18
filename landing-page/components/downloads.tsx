"use client"

import { Apple, ChevronLeft, ChevronRight, Download, DownloadCloud, DownloadIcon, Icon } from "lucide-react"
import { Button } from "./ui/button"
import AnimatedHeading from "./animated-heading"

const platforms = [
  {
    name: "macOS",
    desc: "Apple Silicon & Intel",
    icon: <Apple />,
  },
  {
    name: "Windows",
    desc: "x64 Architecture",
    icon: <Apple />,
  },
  {
    name: "Linux",
    desc: "Debian Package",
    icon: <Apple />,
  },
]

const platformsTwo = [
  {
    name: "macOS",
    desc: "Apple Silicon & Intel",
    icon: <Apple />,
  },
  {
    name: "Windows",
    desc: "x64 Architecture",
    icon: <Apple />,
  },
  {
    name: "Linux",
    desc: "Debian Package",
    icon: <Apple />,
  },
]

const platformsThree = [
  {
    name: "Ready to get started",
    desc: "Download Pluely now and experience the privacy-first AI assistant that works seamlessly in the background.",

  },

]

export default function Downloads() {
  return (
    <section id="downloads" className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Image 8 as background */}
      <div className="absolute inset-0">
        <img 
          src="/image 8.jpg" 
          alt="" 
          className="w-full h-full object-cover"
        />
        {/* Light overlay for glass effect */}
      
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center data-animate mb-12">
          <AnimatedHeading as="h2" text="Explore Pluely" className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800" />
          <p className="text-gray-600">
            Download for your platform, browse release history, or explore our development journey
          </p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <DownloadIcon className="text-sky-600" />
          <h3 className="text-xl font-semibold text-gray-800">Download Pluely</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">

          {platforms.map((platform, index) => (
            <div
              key={index}
              className="bg-transparent backdrop-blur-xl rounded-xl p-8 border border-white/70 shadow-lg hover:shadow-xl transition-all group cursor-pointer data-animate"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4 justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-6xl text-sky-600">{platform.icon}</div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800">{platform.name}</h3>
                    <p className="text-gray-500 text-sm">{platform.desc}</p>
                  </div>
                </div>
                <ChevronRight className="text-sky-500" />
              </div>
              <button className="flex items-center justify-center gap-2 w-full px-4 cursor-pointer hover:bg-sky-500 py-2 bg-sky-400 text-white rounded-3xl font-medium transition-colors shadow-md">
                <Download size={18} />
                Download for macOS
              </button>
            </div>
          ))}
        </div>



        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DownloadIcon className="text-sky-600" />
            <h3 className="text-xl font-semibold text-gray-800">Recent Releases</h3>
          </div>
          <Button className="border border-sky-200 rounded-xl text-sky-600 py-4 bg-white/70 backdrop-blur-xl hover:bg-white/90 shadow-lg flex items-center gap-2 cursor-pointer font-semibold">
            View Release History
            <DownloadCloud />
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-4 mb-8">

          {platformsTwo.map((platform, index) => (
            <div
              key={index}
              className="bg-transparent backdrop-blur-xl rounded-xl p-8 border border-white/70  hover:shadow-xl shadow-xl transition-all group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4 justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl mb-4 text-sky-600">{platform.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{platform.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">{platform.desc}</p>
                  </div>
                </div>
                <ChevronRight className="text-sky-500" />
              </div>
              <button className="flex items-center justify-center gap-2 w-full px-4 cursor-pointer hover:bg-sky-500 py-2 bg-sky-400 text-white rounded-3xl font-medium transition-colors shadow-md">
                <Download size={18} />
                View Release
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-4">
            <DownloadIcon className="text-sky-600" />
            <h3 className="text-xl font-semibold text-gray-800">Recent Releases</h3>
          </div>
          <Button className="border border-sky-200 rounded-xl text-sky-600 py-4 bg-white/70 backdrop-blur-xl hover:bg-white/90 shadow-lg flex items-center gap-2 cursor-pointer font-semibold">
            View Release History
            <DownloadCloud />
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-4">

          {platformsTwo.map((platform, index) => (
            <div
              key={index}
              className="bg-transparent backdrop-blur-xl rounded-xl p-8 border border-white/70 shadow-lg transition-all  cursor-pointer data-animate"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4 justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl mb-4 text-sky-600">{platform.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{platform.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">{platform.desc}</p>
                  </div>
                </div>
                <ChevronRight className="text-sky-500" />
              </div>
              <button className="flex items-center justify-center gap-2 w-full px-4 cursor-pointer hover:bg-sky-500 py-2 bg-sky-400 text-white rounded-3xl font-medium transition-colors shadow-md">
                <Download size={18} />
                View Release
              </button>
            </div>
          ))}
        </div>




      </div>
    </section>
  )
}
