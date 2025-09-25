import { NextRequest, NextResponse } from 'next/server'
import { createNote, updateNote, deleteNote } from '@/lib/cosmic'
import { CreateNoteData } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const noteData: CreateNoteData = await request.json()
    
    // Add detailed logging for debugging
    console.log('Creating note with data:', {
      title: noteData.title,
      contentLength: noteData.content?.length || 0,
      transcription_status: noteData.transcription_status,
      word_count: noteData.word_count,
      recording_duration: noteData.recording_duration,
      collection_id: noteData.collection_id,
      tag_ids: noteData.tag_ids,
      hasSummary: !!noteData.summary
    })
    
    const note = await createNote(noteData)
    
    console.log('Note created successfully:', {
      id: note.id,
      title: note.title,
      slug: note.slug
    })
    
    return NextResponse.json({ success: true, note })
  } catch (error) {
    console.error('Detailed error creating note:', error)
    
    // Provide more specific error handling
    let errorMessage = 'Failed to create note'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('COSMIC_')) {
        errorMessage = 'Cosmic CMS configuration error. Please check environment variables.'
        statusCode = 503
      } else if (error.message.includes('validation')) {
        errorMessage = 'Invalid note data provided'
        statusCode = 400
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        errorMessage = 'Network error. Please check your connection and try again.'
        statusCode = 503
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

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Note ID is required' },
        { status: 400 }
      )
    }
    
    const noteData: Partial<CreateNoteData> = await request.json()
    
    console.log('Updating note:', id, 'with data:', noteData)
    
    const note = await updateNote(id, noteData)
    
    console.log('Note updated successfully:', note.id)
    
    return NextResponse.json({ success: true, note })
  } catch (error) {
    console.error('Error updating note:', error)
    
    let errorMessage = 'Failed to update note'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Note ID is required' },
        { status: 400 }
      )
    }
    
    console.log('Deleting note:', id)
    
    await deleteNote(id)
    
    console.log('Note deleted successfully:', id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    
    let errorMessage = 'Failed to delete note'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}