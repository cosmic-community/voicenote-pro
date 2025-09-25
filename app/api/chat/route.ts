import { NextRequest, NextResponse } from 'next/server'
import { generateChatResponse } from '@/lib/openai'
import { getNotes, createChatSession, updateChatSession } from '@/lib/cosmic'
import { ChatMessage, CreateChatSessionData } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId, context } = await request.json()
    
    // Get all notes for context
    const notes = await getNotes()
    
    // Generate AI response
    const response = await generateChatResponse(messages, notes, context)
    
    // Add the AI response to messages
    const updatedMessages: ChatMessage[] = [
      ...messages,
      {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      }
    ]
    
    let chatSession;
    
    if (sessionId) {
      // Update existing session
      chatSession = await updateChatSession(sessionId, {
        conversation_data: { messages: updatedMessages },
        session_summary: `Chat session with ${updatedMessages.length} messages`,
      })
    } else {
      // Create new session
      const sessionTitle = `Chat Session - ${new Date().toLocaleDateString()}`
      const sessionData: CreateChatSessionData = {
        session_title: sessionTitle,
        conversation_data: { messages: updatedMessages },
        session_summary: `New chat session with ${updatedMessages.length} messages`,
      }
      
      chatSession = await createChatSession(sessionData)
    }
    
    return NextResponse.json({
      success: true,
      response,
      messages: updatedMessages,
      sessionId: chatSession.id,
    })
  } catch (error) {
    console.error('Error generating chat response:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate chat response' },
      { status: 500 }
    )
  }
}