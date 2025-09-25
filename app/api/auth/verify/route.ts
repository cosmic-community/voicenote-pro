import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessCode } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    
    if (!body || typeof body.accessCode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Access code is required' },
        { status: 400 }
      )
    }
    
    const { accessCode } = body
    
    if (!accessCode.trim()) {
      return NextResponse.json(
        { success: false, error: 'Access code cannot be empty' },
        { status: 400 }
      )
    }
    
    const isValid = verifyAccessCode(accessCode.trim())
    
    if (isValid) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid access code' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Error verifying access code:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}