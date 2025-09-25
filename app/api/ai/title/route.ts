import { NextRequest, NextResponse } from 'next/server'
import { generateNoteTitle } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, using fallback title generation')
      return NextResponse.json(
        { success: false, error: 'OpenAI API key is not configured' },
        { status: 503 }
      )
    }

    const { content } = await request.json()
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Content is required and must be a string' },
        { status: 400 }
      )
    }
    
    if (content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content cannot be empty' },
        { status: 400 }
      )
    }
    
    console.log('Generating title for content length:', content.length)
    
    const title = await generateNoteTitle(content)
    
    console.log('Generated title:', title)
    
    return NextResponse.json({ success: true, title })
  } catch (error) {
    console.error('Error generating title:', error)
    
    // Provide more specific error handling
    let errorMessage = 'Failed to generate title'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('OPENAI_API_KEY')) {
        errorMessage = 'OpenAI API key is not configured'
        statusCode = 503
      } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
        errorMessage = 'API rate limit exceeded. Please try again later.'
        statusCode = 429
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.'
        statusCode = 408
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    )
  }
}