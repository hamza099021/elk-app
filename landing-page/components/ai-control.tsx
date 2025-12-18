"use client"

export default function AIControl() {
  const providers = [
    {
      name: "OpenAI",
      models: "GPT-4, GPT-4o",
      color: "from-green-400/20 to-green-900/20",
    },
    {
      name: "Anthropic Claude",
      models: "Claude Sonnet & Opus",
      color: "from-purple-400/20 to-purple-900/20",
    },
    {
      name: "Google Gemini",
      models: "Gemini Pro & Ultra",
      color: "from-blue-400/20 to-blue-900/20",
    },
    {
      name: "xAI Grok",
      models: "Grok-1 & Grok-2",
      color: "from-red-400/20 to-red-900/20",
    },
    {
      name: "Mistral AI",
      models: "Large, Medium, Small",
      color: "from-orange-400/20 to-orange-900/20",
    },
    {
      name: "Groq",
      models: "Llama, Mixtral, Gemma",
      color: "from-pink-400/20 to-pink-900/20",
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-yellow-400/5 to-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 data-animate">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Complete Control Over AI</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Connect to any AI provider using simple curl commands. Switch providers anytime without losing your chat
            history or configuration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider, index) => (
            <div
              key={index}
              className={`glass-effect rounded-xl p-6 border border-white/10 hover:border-yellow-400/30 transition-all group cursor-pointer data-animate bg-gradient-to-br ${provider.color}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="text-lg font-semibold mb-2">{provider.name}</h3>
              <p className="text-gray-400 text-sm">{provider.models}</p>
            </div>
          ))}
        </div>

        <div
          className="mt-12 glass-effect rounded-xl p-8 border border-white/10 data-animate"
          style={{ animationDelay: "0.3s" }}
        >
          <h3 className="text-xl font-semibold mb-4">Pluely API (Optional)</h3>
          <p className="text-gray-400">
            Don't want to maintain your own API keys? Use our optional Pluely API for convenient access to 120+ premium
            AI models. Get faster responses with GPT-4, Claude, and Gemini without managing multiple API subscriptions.
          </p>
        </div>
      </div>
    </section>
  )
}
