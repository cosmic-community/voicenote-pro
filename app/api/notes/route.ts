import { NextRequest, NextResponse } from 'next/server'
import { createNote, updateNote, deleteNote } from '@/lib/cosmic'
import { CreateNoteData } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const noteData: CreateNoteData = await request.json()
    
    const note = await createNote(noteData)
    
    return NextResponse.json({ success: true, note })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create note' },
      { status: 500 }
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
    
    const note = await updateNote(id, noteData)
    
    return NextResponse.json({ success: true, note })
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update note' },
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
    
    await deleteNote(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete note' },
      { status: 500 }
    )
  }
}