"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import AnimatedHeading from './animated-heading'

export default function FaqVideos() {
    const [activeIndex, setActiveIndex] = useState(0)

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



    ]

    return (
        <section id="why" className="py-20 px-4 sm:px-6 lg:px-8 mx-6 my-6 rounded-3xl bg-white/40 backdrop-blur-md border border-gray-200/50 shadow-lg">
            <div className="mb-20 flex justify-center flex-col items-center text-center">
                <AnimatedHeading text="Enterprise-Grade Features Built for Privacy" className="text-5xl font-bold mb-12" />
                <p className="max-w-2xl text-center text-gray-600">Connect to any AI provider using simple curl commands. OpenAI, Anthropic, Google, xAI, Mistral, Cohere, Perplexity, Groq, Ollama, or your own custom endpoint. Switch providers anytime without losing your chat history or configuration. Full streaming and non-streaming support with complete flexibility.</p>
            </div>
            <div className="max-w-5xl mx-auto">


                <div className="grid lg:grid-cols-[2fr_3fr]">
                    {/* Accordion */}
                    <div className="flex flex-col">
                        <div className="space-y-4 w-[90%]">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 overflow-hidden transition-all duration-300"
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

                        <div className="mt-4 px-6">
                            <h2 className="font-medium text-xl text-gray-900">Custom STT Provider with cURL
                            </h2>
                            <div className="border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-md p-4 rounded-xl my-4 hover:bg-white/80 hover:shadow-lg transition-all" >
                                <p className="text-gray-600 text-sm">Any Speech API: Integrate any STT provider using curl commands with complete flexibility</p>
                            </div>
                            <div className="border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-md p-4 rounded-xl my-4 hover:bg-white/80 hover:shadow-lg transition-all" >
                                <p className="text-gray-600 text-sm">Dynamic Variables: AUDIO, API_KEY, LANGUAGE and custom variables for your workflow</p>
                            </div>
                            <div className="border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-md p-4 rounded-xl my-4 hover:bg-white/80 hover:shadow-lg transition-all" >
                                <p className="text-gray-600 text-sm">Instant Testing: Verify your custom STT configuration with real-time testing</p>
                            </div>

                        </div>
                    </div>

                    {/* Video Box */}
                    <div className="relative rounded-xl bg-red-500 backdrop-blur-sm border border-gray-200/50 shadow-xl p-2 w-full h-full">
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
                <div className="text-center mt-30 w-full">
                    <h2 className="text-gray-900 font-medium text-2xl mb-3">Pre-Configured Speech-to-Text Providers
                    </h2>
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
                        <div className="border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-md text-gray-600 p-4 rounded-xl hover:bg-white/80 hover:shadow-lg transition-all">
                            <h2 className="text-gray-600 text-left text-sm">Mistral AI: Access Mistral Large, Medium, and Small models with your API key</h2>
                        </div>
                        <div className="border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-md text-gray-600 p-4 rounded-xl hover:bg-white/80 hover:shadow-lg transition-all">
                            <h2 className="text-gray-600 text-left text-sm">Mistral AI: Access Mistral Large, Medium, and Small models with your API key</h2>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
