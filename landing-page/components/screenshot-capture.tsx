"use client"

export default function ScreenshotCapture() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-blue-400/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="data-animate">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Screenshot Capture - Manual Mode</h2>
            <p className="text-gray-400 text-lg mb-6">
              Capture multiple screenshots and attach them to your conversation. Full-screen or selection mode with
              intelligent file management. Perfect for visual analysis and documentation.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Multiple screenshot capture
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Full-screen or selection mode
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Intelligent file management
              </li>
            </ul>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-transparent rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div
              className="relative bg-gradient-to-br from-slate-900/50 to-black/50 rounded-xl p-8 border border-white/10 glass-effect h-96 flex items-center justify-center data-animate"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">📸</div>
                <p className="text-gray-300">Screenshot Capture</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
