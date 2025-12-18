"use client"

import Link from "next/link"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "How do I cancel my plan?",
    answer:
      "You can cancel your plan anytime from your account settings. Your access will continue until the end of your billing period.",
  },
  {
    question: "How many license keys do I get with my purchase?",
    answer:
      "Each purchase includes one license key that can be used across multiple machines for the same user account.",
  },
  {
    question: "What is the refund policy?",
    answer: "We offer a 30-day money-back guarantee if you are not satisfied with Pluely.",
  },
  {
    question: "How is Pluely invisible in video calls?",
    answer:
      "Pluely uses a translucent overlay window that is not captured by screen sharing protocols, making it invisible in Zoom, Teams, Google Meet, and other video conferencing platforms.",
  },
  {
    question: "How is my data handled?",
    answer:
      "All your data stays local on your machine. Pluely does not send any personal data to our servers. Only API calls to your chosen AI provider are made.",
  },
  {
    question: "Which AI providers can I use?",
    answer:
      "You can use any AI provider including OpenAI, Claude, Gemini, Grok, Mistral, Cohere, Perplexity, Groq, or Ollama. You can also set up custom endpoints.",
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 data-animate">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-400">
            Can't find what you're looking for?{" "}
            <Link href="mailto:support@pluely.com" className="text-yellow-400 hover:text-yellow-300">
              Contact support
            </Link>{" "}
            for further assistance.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="glass-effect rounded-xl border border-white/10 overflow-hidden data-animate"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-semibold text-left">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 border-t border-white/10 text-gray-400 animate-fade-in-up">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
