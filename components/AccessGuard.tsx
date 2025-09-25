'use client'

import { useState, useEffect } from 'react'
import { isAuthenticated, setAccessVerification } from '@/lib/auth'

interface AccessGuardProps {
  children: React.ReactNode
}

export default function AccessGuard({ children }: AccessGuardProps) {
  const [isAuthed, setIsAuthed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add small delay to prevent hydration mismatch
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const authenticated = isAuthenticated()
        setIsAuthed(authenticated)
      } catch (error) {
        console.error('Error checking authentication:', error)
        setIsAuthed(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsVerifying(true)

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || 'Verification failed')
      }

      const data = await response.json()

      if (data.success) {
        setAccessVerification()
        setIsAuthed(true)
        setAccessCode('') // Clear the input
      } else {
        setError(data.error || 'Invalid access code. Please try again.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Verification failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccessCode(e.target.value)
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                🎤 VoiceNote Pro
              </h1>
              <p className="text-gray-600">
                Enter your access code to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={accessCode}
                  onChange={handleInputChange}
                  placeholder="Enter access code"
                  className="input"
                  required
                  disabled={isVerifying}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="text-sm text-danger-600 bg-danger-50 p-3 rounded-lg border border-danger-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || !accessCode.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </span>
                ) : (
                  'Access Application'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}