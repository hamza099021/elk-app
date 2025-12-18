"use client"

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-gray-200/50 py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-gray-100/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-black">
                P
              </div>
              <span className="font-bold text-gray-900">Pluely</span>
            </div>
            <p className="text-gray-600 text-sm">
              Your invisible AI assistant for meetings, interviews, and presentations.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors">
                  Download
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Connect</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="https://github.com/iamsrikanthnani/pluely" className="hover:text-gray-900 transition-colors">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors">
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors">
                  Discord
                </Link>
              </li>
              <li>
                <Link href="mailto:support@pluely.com" className="hover:text-gray-900 transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200/50 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
            <p>© 2025 Pluely. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
