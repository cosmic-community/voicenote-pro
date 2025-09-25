import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessCode } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { accessCode } = await request.json()
    
    if (!accessCode) {
      return NextResponse.json(
        { success: false, error: 'Access code is required' },
        { status: 400 }
      )
    }
    
    const isValid = verifyAccessCode(accessCode)
    
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
      { success: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}