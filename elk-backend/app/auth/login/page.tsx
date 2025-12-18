'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (data.success) {
        localStorage.setItem('token', data.data.accessToken)
        window.location.href = '/dashboard'
      } else {
        alert(data.error || 'Login failed')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div 
        className="glass-card max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <Link href="/">
            <motion.h1 
              className="text-3xl font-bold text-gradient mb-2"
              whileHover={{ scale: 1.05 }}
            >
              Elk AI
            </motion.h1>
          </Link>
          <p className="text-white/80">Welcome back! Sign in to your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                id="email"
                type="email"
                required
                className="glass-input pl-10 w-full text-white"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="glass-input pl-10 pr-10 w-full text-white"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500"
              />
              <span className="ml-2 text-sm text-white/80">Remember me</span>
            </label>
            <Link href="/auth/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
              Forgot password?
            </Link>
          </div>

          <motion.button
            type="submit"
            className="w-full glass-button bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/60">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <Link href="/" className="text-white/60 hover:text-white/80 text-sm">
            ← Back to homepage
          </Link>
        </div>
      </motion.div>
    </div>
  )
}