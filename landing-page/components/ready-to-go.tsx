"use client"

import Link from "next/link"

export default function ReadyToGo() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-yellow-400/10">
      <div className="max-w-4xl mx-auto text-center data-animate">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Go Invisible?</h2>
        <p className="text-xl text-gray-400 mb-8">
          Experience AI assistance that operates with complete stealth. Built with Tauri and Rust for blazing-fast
          performance, absolute privacy, and professional-grade discretion.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#downloads"
            className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Download Pluely
          </Link>
          <Link
            href="https://github.com/iamsrikanthnani/pluely"
            className="px-8 py-3 border border-white/20 text-white rounded-lg font-semibold hover:border-white/40 transition-colors"
          >
            Contribute on GitHub
          </Link>
        </div>
      </div>
    </section>
  )
}
