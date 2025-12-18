'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Download, Star, Check, Zap, Shield, Users } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full z-50 glass border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="text-2xl font-bold text-gradient"
              whileHover={{ scale: 1.05 }}
            >
              Elk AI
            </motion.div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Pricing</a>
              <a href="#download" className="text-white/80 hover:text-white transition-colors">Download</a>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login">
                <motion.button 
                  className="glass-button text-white/80 hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </motion.button>
              </Link>
              <Link href="/auth/register">
                <motion.button 
                  className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">AI-Powered</span>
              <br />
              <span className="text-white">Desktop Assistant</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Real-time AI assistance for interviews, meetings, and presentations. 
              Screen analysis, live conversation support, and web research - all in one elegant desktop app.
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link href="/auth/register">
              <motion.button 
                className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg px-8 py-4 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <motion.button 
              className="glass-button text-white font-semibold text-lg px-8 py-4 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-5 h-5" />
              Download Now
            </motion.button>
          </motion.div>

          {/* Hero Image/Demo */}
          <motion.div 
            className="glass-card max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center">
              <motion.div 
                className="text-white/60 text-lg"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Demo Video Coming Soon
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Three Powerful Features
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Everything you need for AI-powered assistance in one beautiful desktop application
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Live Conversation Listener",
                description: "Real-time audio transcription with AI responses. Perfect for interviews and meetings with speaker diarization.",
                features: ["Real-time transcription", "Speaker identification", "Contextual AI responses", "Multiple profiles"]
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Screen Q&A",
                description: "Ask questions about anything on your screen. AI analyzes screenshots and provides intelligent answers.",
                features: ["Screen capture analysis", "Visual Q&A", "Context understanding", "Privacy-focused"]
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Deep Web Research",
                description: "Powered by Perplexity AI for accurate, cited research on any topic with real-time information.",
                features: ["Live web search", "Cited sources", "Recent information", "Research assistance"]
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="glass-card h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="text-blue-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/80 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/70">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Start free, upgrade when you need more. No hidden fees, cancel anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                period: "/month",
                description: "Perfect for trying out Elk AI",
                features: [
                  "10 Screen Q&A queries/month",
                  "20 minutes audio processing/month", 
                  "Basic AI profiles",
                  "Desktop app access",
                ],
                cta: "Start Free",
                popular: false
              },
              {
                name: "Pro",
                price: "$9.99",
                period: "/month",
                description: "For power users and professionals",
                features: [
                  "900 Screen Q&A queries/month",
                  "10 hours audio processing/month",
                  "100 web research queries/month",
                  "All AI profiles",
                  "Priority support",
                ],
                cta: "Start Pro Trial",
                popular: true
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                className={`glass-card relative ${plan.popular ? 'border-blue-500/50 scale-105' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/60">{plan.period}</span>
                  </div>
                  <p className="text-white/80 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/80">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <motion.button 
                  className={`w-full glass-button font-semibold py-3 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {plan.cta}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to boost your productivity?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals using Elk AI to excel in interviews, 
              meetings, and presentations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <motion.button 
                  className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg px-8 py-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Your Free Trial
                </motion.button>
              </Link>
              <motion.button 
                className="glass-button text-white font-semibold text-lg px-8 py-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Demo
              </motion.button>
            </div>

            <div className="flex items-center justify-center gap-2 mt-6 text-white/60">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="ml-2">Trusted by 10,000+ professionals</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gradient mb-4">Elk AI</h3>
              <p className="text-white/60">
                AI-powered desktop assistant for professionals.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#download" className="hover:text-white transition-colors">Download</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/60">
            <p>&copy; 2024 Elk AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}