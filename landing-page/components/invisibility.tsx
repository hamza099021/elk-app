"use client"

export default function Invisibility() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-yellow-400/5 to-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative group order-2 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-transparent rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-slate-900/50 to-black/50 rounded-xl p-8 border border-white/10 glass-effect h-96 flex items-center justify-center data-animate">
              <div className="text-center">
                <div className="text-6xl mb-4">👁️</div>
                <p className="text-gray-300">Completely Invisible</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 data-animate">Complete Invisibility</h2>
            <p className="text-gray-400 text-lg mb-6 data-animate" style={{ animationDelay: "0.1s" }}>
              Pluely's translucent overlay window sits above all applications, invisible in video calls, screen shares,
              and recordings. Perfect stealth for meetings on Zoom, Google Meet, Microsoft Teams, and Slack Huddles.
            </p>
            <ul className="space-y-3 data-animate" style={{ animationDelay: "0.2s" }}>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Undetectable in video calls
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Hidden from screen shares
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Not visible in recordings
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
