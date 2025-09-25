'use client'

import { useState, useRef, useEffect } from 'react'
import { RecordingState, Collection, Tag, CreateNoteData, Note } from '@/types'

// Web Speech API type definitions
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }
}

interface VoiceRecorderProps {
  recordingState: RecordingState
  onStateChange: (state: RecordingState) => void
  onNoteCreated: (note: Note) => void
  collections: Collection[]
  tags: Tag[]
}

export default function VoiceRecorder({
  recordingState,
  onStateChange,
  onNoteCreated,
  collections,
  tags
}: VoiceRecorderProps) {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [error, setError] = useState('')
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor()
        
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        
        recognition.onstart = () => {
          setIsListening(true)
          setError('')
          onStateChange('recording')
          
          // Start duration timer
          const startTime = Date.now()
          intervalRef.current = setInterval(() => {
            setRecordingDuration(Math.floor((Date.now() - startTime) / 1000))
          }, 1000)
        }
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            }
          }
          
          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript)
          }
        }
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error)
          setError('Speech recognition failed. Please try again.')
          setIsListening(false)
          onStateChange('error')
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
        }
        
        recognition.onend = () => {
          setIsListening(false)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
        }
        
        recognitionRef.current = recognition
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [onStateChange])

  const startRecording = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser.')
      return
    }
    
    setTranscript('')
    setRecordingDuration(0)
    setError('')
    recognitionRef.current.start()
  }

  const stopRecording = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      onStateChange('processing')
    }
  }

  const saveNote = async () => {
    if (!transcript.trim()) {
      setError('No transcript to save.')
      return
    }

    try {
      onStateChange('processing')
      
      // Generate title from content
      const titleResponse = await fetch('/api/ai/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: transcript }),
      })
      
      const titleData = await titleResponse.json()
      const title = titleData.success ? titleData.title : 'Voice Note'
      
      // Generate summary
      const summaryResponse = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: transcript }),
      })
      
      const summaryData = await summaryResponse.json()
      const summary = summaryData.success ? summaryData.summary : ''
      
      // Create note data
      const noteData: CreateNoteData = {
        title,
        content: transcript,
        transcription_status: 'Completed',
        word_count: transcript.split(/\s+/).filter(word => word.length > 0).length,
        recording_duration: recordingDuration,
        summary,
        priority: 'Medium',
      }
      
      if (selectedCollection) {
        noteData.collection_id = selectedCollection
      }
      
      if (selectedTags.length > 0) {
        noteData.tag_ids = selectedTags
      }
      
      // Save note
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData),
      })
      
      const data = await response.json()
      
      if (data.success) {
        onNoteCreated(data.note)
        
        // Reset form
        setTranscript('')
        setRecordingDuration(0)
        setSelectedCollection('')
        setSelectedTags([])
        onStateChange('completed')
        
        setTimeout(() => {
          onStateChange('idle')
        }, 2000)
      } else {
        throw new Error(data.error || 'Failed to save note')
      }
    } catch (error) {
      console.error('Error saving note:', error)
      setError('Failed to save note. Please try again.')
      onStateChange('error')
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    setRecordingDuration(0)
    setError('')
    onStateChange('idle')
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create Voice Note
        </h2>
        <p className="text-gray-600">
          Click the button below to start recording your voice note
        </p>
      </div>

      {/* Recording Button */}
      <div className="text-center">
        <div className="relative inline-block">
          {!isListening ? (
            <button
              onClick={startRecording}
              disabled={recordingState === 'processing'}
              className={`w-24 h-24 rounded-full text-white text-2xl transition-all duration-300 ${
                recordingState === 'processing'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 hover:scale-105 shadow-lg'
              }`}
            >
              {recordingState === 'processing' ? (
                <div className="animate-spin">⚙️</div>
              ) : (
                '🎤'
              )}
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-24 h-24 rounded-full bg-danger-600 hover:bg-danger-700 text-white text-2xl recording-pulse shadow-lg"
            >
              ⏹️
            </button>
          )}
          
          {isListening && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-600">
              {formatDuration(recordingDuration)}
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        {recordingState === 'idle' && (
          <p className="text-gray-600">Ready to record</p>
        )}
        {recordingState === 'recording' && (
          <p className="text-primary-600 font-medium">
            🔴 Recording... Speak clearly
          </p>
        )}
        {recordingState === 'processing' && (
          <p className="text-warning-600 font-medium">
            ⚙️ Processing and saving...
          </p>
        )}
        {recordingState === 'completed' && (
          <p className="text-success-600 font-medium">
            ✅ Note saved successfully!
          </p>
        )}
        {recordingState === 'error' && error && (
          <p className="text-danger-600 font-medium">
            ❌ {error}
          </p>
        )}
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Transcript:</h3>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-gray-800 whitespace-pre-wrap">{transcript}</p>
          </div>

          {/* Organization Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Collection Selector */}
            {collections.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection (Optional)
                </label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="input"
                >
                  <option value="">No collection</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.metadata?.name || collection.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tags Selector */}
            {tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTags(prev => [...prev, tag.id])
                          } else {
                            setSelectedTags(prev => prev.filter(id => id !== tag.id))
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">
                        {tag.metadata?.name || tag.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={saveNote}
              disabled={recordingState === 'processing'}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {recordingState === 'processing' ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </span>
              ) : (
                'Save Note'
              )}
            </button>
            <button
              onClick={clearTranscript}
              className="btn-secondary"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}