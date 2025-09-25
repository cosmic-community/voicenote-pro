'use client'

import { useState } from 'react'
import { Note, Collection, Tag } from '@/types'
import NoteCard from '@/components/NoteCard'

interface NotesListProps {
  notes: Note[]
  collections: Collection[]
  tags: Tag[]
  onNoteUpdated: (note: Note) => void
  onNoteDeleted: (noteId: string) => void
}

export default function NotesList({
  notes,
  collections,
  tags,
  onNoteUpdated,
  onNoteDeleted
}: NotesListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'words'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const sortedNotes = [...notes].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case 'title':
        const titleA = a.metadata?.title || a.title || ''
        const titleB = b.metadata?.title || b.title || ''
        comparison = titleA.localeCompare(titleB)
        break
      case 'words':
        const wordsA = a.metadata?.word_count || 0
        const wordsB = b.metadata?.word_count || 0
        comparison = wordsA - wordsB
        break
      default:
        comparison = 0
    }

    return sortOrder === 'desc' ? -comparison : comparison
  })

  if (notes.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">🎤</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No voice notes yet
        </h3>
        <p className="text-gray-600 mb-6">
          Start by creating your first voice note using the recorder above.
        </p>
        <div className="text-sm text-gray-500">
          Your notes will appear here as you create them.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Your Notes ({notes.length})
        </h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'words')}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="date">Date Created</option>
              <option value="title">Title</option>
              <option value="words">Word Count</option>
            </select>
          </div>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {sortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 gap-4">
        {sortedNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            collections={collections}
            tags={tags}
            onNoteUpdated={onNoteUpdated}
            onNoteDeleted={onNoteDeleted}
          />
        ))}
      </div>
    </div>
  )
}