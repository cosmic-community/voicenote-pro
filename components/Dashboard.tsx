'use client'

import { useState, useEffect } from 'react'
import { Note, Collection, Tag, RecordingState } from '@/types'
import VoiceRecorder from '@/components/VoiceRecorder'
import NotesList from '@/components/NotesList'
import ChatAssistant from '@/components/ChatAssistant'
import FilterBar from '@/components/FilterBar'
import Header from '@/components/Header'

interface DashboardProps {
  initialNotes: Note[]
  collections: Collection[]
  tags: Tag[]
}

export default function Dashboard({ initialNotes, collections, tags }: DashboardProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [filteredNotes, setFilteredNotes] = useState<Note[]>(initialNotes)
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [selectedCollection, setSelectedCollection] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showChat, setShowChat] = useState(false)

  // Filter notes based on current filters
  useEffect(() => {
    let filtered = notes

    // Filter by collection
    if (selectedCollection) {
      filtered = filtered.filter(note => 
        note.metadata?.collection?.id === selectedCollection
      )
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note => 
        note.metadata?.tags?.some(tag => selectedTags.includes(tag.id))
      )
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(note => {
        const title = (note.metadata?.title || note.title).toLowerCase()
        const content = (note.metadata?.content || '').toLowerCase()
        const summary = (note.metadata?.summary || '').toLowerCase()
        
        return title.includes(query) || content.includes(query) || summary.includes(query)
      })
    }

    setFilteredNotes(filtered)
  }, [notes, selectedCollection, selectedTags, searchQuery])

  const handleNoteCreated = (newNote: Note) => {
    setNotes(prev => [newNote, ...prev])
  }

  const handleNoteUpdated = (updatedNote: Note) => {
    setNotes(prev => prev.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    ))
  }

  const handleNoteDeleted = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Voice Recorder */}
            <div className="card">
              <VoiceRecorder
                recordingState={recordingState}
                onStateChange={setRecordingState}
                onNoteCreated={handleNoteCreated}
                collections={collections}
                tags={tags}
              />
            </div>

            {/* Filters */}
            <FilterBar
              collections={collections}
              tags={tags}
              selectedCollection={selectedCollection}
              selectedTags={selectedTags}
              searchQuery={searchQuery}
              onCollectionChange={setSelectedCollection}
              onTagsChange={setSelectedTags}
              onSearchChange={setSearchQuery}
            />

            {/* Notes List */}
            <NotesList
              notes={filteredNotes}
              collections={collections}
              tags={tags}
              onNoteUpdated={handleNoteUpdated}
              onNoteDeleted={handleNoteDeleted}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Notes</span>
                  <span className="font-semibold text-gray-900">{notes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Collections</span>
                  <span className="font-semibold text-gray-900">{collections.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tags</span>
                  <span className="font-semibold text-gray-900">{tags.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Words</span>
                  <span className="font-semibold text-gray-900">
                    {notes.reduce((sum, note) => sum + (note.metadata?.word_count || 0), 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Chat Toggle */}
            <div className="card">
              <button
                onClick={() => setShowChat(!showChat)}
                className={`w-full p-4 rounded-lg font-medium transition-colors ${
                  showChat
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>🤖</span>
                  <span>{showChat ? 'Hide AI Assistant' : 'Ask AI About Your Notes'}</span>
                </div>
              </button>
            </div>

            {/* Chat Assistant */}
            {showChat && (
              <div className="card">
                <ChatAssistant notes={notes} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}