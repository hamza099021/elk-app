"use client"

export default function AlwaysReady() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-transparent rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-slate-900/50 to-black/50 rounded-xl p-8 border border-white/10 glass-effect h-96 flex items-center justify-center data-animate">
              <div className="text-center">
                <div className="text-6xl mb-4">⚡</div>
                <p className="text-gray-300">Always Ready & Accessible</p>
              </div>
            </div>
          </div>

          <div className="data-animate" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Always Ready & Accessible</h2>
            <p className="text-gray-400 text-lg mb-6">
              Position your AI assistant anywhere on screen with smooth drag-and-drop. Adjustable transparency,
              always-on-top mode, and instant keyboard access keep Pluely ready when you need it.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Smooth drag-and-drop positioning
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Adjustable transparency
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Always-on-top mode
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Instant keyboard access
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
