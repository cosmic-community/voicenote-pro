'use client'

import { clearAccessVerification } from '@/lib/auth'
import { useState } from 'react'

export default function Header() {
  const [showMenu, setShowMenu] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      clearAccessVerification()
      // Add small delay to prevent flash of content
      await new Promise(resolve => setTimeout(resolve, 100))
      window.location.reload()
    } catch (error) {
      console.error('Error during logout:', error)
      // Force reload even if there's an error
      window.location.reload()
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🎤</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">VoiceNote Pro</h1>
              <p className="text-xs text-gray-600 hidden sm:block">
                Intelligent Voice-to-Text Notes
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome to your voice notes workspace
              </span>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-600 hover:text-gray-900"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="sm:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 px-4">
                Welcome to your voice notes workspace
              </p>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}