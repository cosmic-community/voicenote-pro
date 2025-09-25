import { NextRequest, NextResponse } from 'next/server'
import { generateNoteTitle } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key is not configured' },
        { status: 503 }
      )
    }

    const { content } = await request.json()
    
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      )
    }
    
    const title = await generateNoteTitle(content)
    
    return NextResponse.json({ success: true, title })
  } catch (error) {
    console.error('Error generating title:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate title' },
      { status: 500 }
    )
  }
}