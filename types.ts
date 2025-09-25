// Base Cosmic object interface
export interface CosmicObject {
  id: string;
  slug: string;
  title: string;
  content?: string;
  metadata: Record<string, any>;
  type: string;
  created_at: string;
  modified_at: string;
}

// Color option interface for select-dropdown values
export interface ColorOption {
  key: string;
  value: string;
}

// Note object with complete metadata structure
export interface Note extends CosmicObject {
  type: 'notes';
  metadata: {
    title?: string;
    content?: string;
    audio_file?: {
      url: string;
      name: string;
    };
    transcription_status?: TranscriptionStatus;
    collection?: Collection;
    tags?: Tag[];
    summary?: string;
    word_count?: number;
    recording_duration?: number;
    priority?: Priority;
  };
}

// Collection object
export interface Collection extends CosmicObject {
  type: 'collections';
  metadata: {
    name?: string;
    description?: string;
    color?: ColorOption;
    is_archived?: boolean;
  };
}

// Tag object
export interface Tag extends CosmicObject {
  type: 'tags';
  metadata: {
    name?: string;
    color?: ColorOption;
    description?: string;
  };
}

// Chat Session object
export interface ChatSession extends CosmicObject {
  type: 'chat-sessions';
  metadata: {
    session_title?: string;
    related_notes?: Note[];
    conversation_data?: {
      messages: ChatMessage[];
    };
    session_summary?: string;
    last_activity?: string;
  };
}

// Chat message structure
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Type literals for select-dropdown values (EXACT values from content model)
export type TranscriptionStatus = 'Processing' | 'Completed' | 'Failed';
export type Priority = 'High' | 'Medium' | 'Low';
export type TagColor = 'Blue' | 'Green' | 'Red' | 'Purple' | 'Yellow' | 'Orange';
export type CollectionColor = 'Blue' | 'Green' | 'Red' | 'Purple' | 'Orange' | 'Gray';

// API response types
export interface CosmicResponse<T> {
  objects: T[];
  total: number;
  limit: number;
  skip: number;
}

// Form data types
export interface CreateNoteData {
  title: string;
  content: string;
  transcription_status: TranscriptionStatus;
  collection_id?: string;
  tag_ids?: string[];
  summary?: string;
  word_count?: number;
  recording_duration?: number;
  priority?: Priority;
}

export interface CreateChatSessionData {
  session_title: string;
  conversation_data: {
    messages: ChatMessage[];
  };
  session_summary?: string;
  related_notes?: string[];
}

// Utility types
export type NoteWithRelations = Note & {
  metadata: Note['metadata'] & {
    collection: Collection;
    tags: Tag[];
  };
};

// Voice recording states
export type RecordingState = 'idle' | 'recording' | 'processing' | 'completed' | 'error';

// Access control
export interface AccessVerification {
  isAuthenticated: boolean;
  timestamp: number;
}

// Type guards for runtime validation
export function isNote(obj: CosmicObject): obj is Note {
  return obj.type === 'notes';
}

export function isCollection(obj: CosmicObject): obj is Collection {
  return obj.type === 'collections';
}

export function isTag(obj: CosmicObject): obj is Tag {
  return obj.type === 'tags';
}

export function isChatSession(obj: CosmicObject): obj is ChatSession {
  return obj.type === 'chat-sessions';
}

// Error handling types
export interface CosmicError extends Error {
  status?: number;
  code?: string;
}

export function isCosmicError(error: unknown): error is CosmicError {
  return error instanceof Error && 'status' in error;
}