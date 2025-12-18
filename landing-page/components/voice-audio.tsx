"use client"

export default function VoiceAudio() {
  const sttProviders = [
    "OpenAI Whisper",
    "ElevenLabs",
    "Groq Whisper",
    "Google Speech-to-Text",
    "Deepgram STT",
    "Azure Speech-to-Text",
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 data-animate">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Voice & Audio Capture</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Capture system audio in real-time during meetings and presentations. Advanced speech-to-text providers with
            voice activity detection.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sttProviders.map((provider, index) => (
            <div
              key={index}
              className="glass-effect rounded-xl p-6 border border-white/10 hover:border-blue-400/30 transition-all group cursor-pointer data-animate"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full group-hover:scale-150 transition-transform"></div>
                <span className="font-semibold">{provider}</span>
              </div>
            </div>
          ))}
        </div>

        <div
          className="glass-effect rounded-xl p-8 border border-white/10 data-animate"
          style={{ animationDelay: "0.3s" }}
        >
          <h3 className="text-xl font-semibold mb-4">Custom STT Provider with cURL</h3>
          <p className="text-gray-400 mb-4">
            Integrate any STT provider using curl commands with complete flexibility. Use dynamic variables like{" "}
            {"{{AUDIO}}"}, {"{{API_KEY}}"}, and {"{{LANGUAGE}}"} for your workflow.
          </p>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Instant testing and verification
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Real-time streaming support
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Voice activity detection
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
