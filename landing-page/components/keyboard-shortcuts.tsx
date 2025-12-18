"use client"

export default function KeyboardShortcuts() {
  const shortcuts = [
    { keys: "Cmd + \\", action: "Toggle window" },
    { keys: "Cmd + Shift + D", action: "Dashboard" },
    { keys: "Cmd + Shift + M", action: "System Audio" },
    { keys: "Cmd + Shift + A", action: "Voice Input" },
    { keys: "Cmd + Shift + S", action: "Screenshot" },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 data-animate">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Keyboard Shortcuts</h2>
          <p className="text-gray-400">Fully customizable global shortcuts for instant access</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="glass-effect rounded-xl p-6 border border-white/10 hover:border-yellow-400/30 transition-all group cursor-pointer data-animate"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-400">{shortcut.action}</span>
                <kbd className="px-3 py-1 bg-yellow-400/10 text-yellow-400 rounded text-sm font-mono group-hover:bg-yellow-400/20 transition-colors">
                  {shortcut.keys}
                </kbd>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
