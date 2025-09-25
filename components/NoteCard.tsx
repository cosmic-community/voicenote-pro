'use client'

import { useState } from 'react'
import { Note, Collection, Tag, Priority, TranscriptionStatus } from '@/types'

interface NoteCardProps {
  note: Note
  collections: Collection[]
  tags: Tag[]
  onNoteUpdated: (note: Note) => void
  onNoteDeleted: (noteId: string) => void
}

export default function NoteCard({
  note,
  collections,
  tags,
  onNoteUpdated,
  onNoteDeleted
}: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editTitle, setEditTitle] = useState(note.metadata?.title || note.title)
  const [editContent, setEditContent] = useState(note.metadata?.content || '')
  const [editSummary, setEditSummary] = useState(note.metadata?.summary || '')

  const collection = note.metadata?.collection
  const noteTags = note.metadata?.tags || []
  const priority = note.metadata?.priority || 'Medium'
  const wordCount = note.metadata?.word_count || 0
  const duration = note.metadata?.recording_duration || 0
  const status = note.metadata?.transcription_status || 'Completed'

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/notes?id=${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          summary: editSummary,
          word_count: editContent.split(/\s+/).filter(word => word.length > 0).length,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onNoteUpdated(data.note)
        setIsEditing(false)
      } else {
        alert('Failed to update note')
      }
    } catch (error) {
      console.error('Error updating note:', error)
      alert('Failed to update note')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/notes?id=${note.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        onNoteDeleted(note.id)
      } else {
        alert('Failed to delete note')
        setIsDeleting(false)
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note')
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200'
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'Low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: TranscriptionStatus) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-50 border-green-200'
      case 'Processing': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'Failed': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTagColorClass = (color?: { key: string; value: string }) => {
    if (!color || !color.key) return 'color-blue'
    return `color-${color.key}`
  }

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-lg font-semibold w-full input"
              placeholder="Note title..."
            />
          ) : (
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {note.metadata?.title || note.title}
            </h3>
          )}
          
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span>{formatDate(note.created_at)}</span>
            <span>•</span>
            <span>{wordCount} words</span>
            {duration > 0 && (
              <>
                <span>•</span>
                <span>{formatDuration(duration)}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Edit note"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Delete note"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tags and Collection */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {collection && (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTagColorClass(collection.metadata?.color)}`}>
            📁 {collection.metadata?.name || collection.title}
          </span>
        )}
        
        {noteTags.map((tag) => (
          <span
            key={tag.id}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTagColorClass(tag.metadata?.color)}`}
          >
            🏷️ {tag.metadata?.name || tag.title}
          </span>
        ))}
        
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority)}`}>
          {priority}
        </span>
        
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      {/* Summary */}
      {(note.metadata?.summary || isEditing) && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Summary:</h4>
          {isEditing ? (
            <textarea
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              className="textarea"
              rows={2}
              placeholder="Note summary..."
            />
          ) : (
            <p className="text-sm text-gray-600 italic">
              {note.metadata?.summary}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Content:</h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
        
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="textarea"
            rows={8}
            placeholder="Note content..."
          />
        ) : (
          <div className={`text-sm text-gray-800 whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''}`}>
            {note.metadata?.content || 'No content available'}
          </div>
        )}
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
          <button
            onClick={() => {
              setIsEditing(false)
              setEditTitle(note.metadata?.title || note.title)
              setEditContent(note.metadata?.content || '')
              setEditSummary(note.metadata?.summary || '')
            }}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}