import { createBucketClient } from '@cosmicjs/sdk';
import { Note, Collection, Tag, ChatSession, CosmicResponse, CreateNoteData, CreateChatSessionData, CosmicError, isCosmicError } from '@/types';

export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
});

// Helper function for error handling
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}

// Fetch all notes with collections and tags
export async function getNotes(): Promise<Note[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'notes' })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .depth(1);
    
    const notes = response.objects as Note[];
    
    // Sort by created date (newest first)
    return notes.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch notes');
  }
}

// Fetch single note by slug
export async function getNoteBySlug(slug: string): Promise<Note | null> {
  try {
    const response = await cosmic.objects
      .findOne({ type: 'notes', slug })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .depth(1);
    
    const note = response.object as Note;
    
    if (!note) {
      return null;
    }
    
    return note;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch note');
  }
}

// Create a new note
export async function createNote(noteData: CreateNoteData): Promise<Note> {
  try {
    const metadata: Record<string, any> = {
      title: noteData.title,
      content: noteData.content,
      transcription_status: noteData.transcription_status,
      summary: noteData.summary || "",
      word_count: noteData.word_count || 0,
      recording_duration: noteData.recording_duration || 0,
      priority: noteData.priority || 'Medium',
    };

    // Add collection if provided
    if (noteData.collection_id) {
      metadata.collection = noteData.collection_id;
    }

    // Add tags if provided
    if (noteData.tag_ids && noteData.tag_ids.length > 0) {
      metadata.tags = noteData.tag_ids;
    }

    const response = await cosmic.objects.insertOne({
      type: 'notes',
      title: noteData.title,
      metadata,
    });
    
    return response.object as Note;
  } catch (error) {
    console.error('Error creating note:', error);
    throw new Error('Failed to create note');
  }
}

// Update a note
export async function updateNote(id: string, noteData: Partial<CreateNoteData>): Promise<Note> {
  try {
    const metadata: Record<string, any> = {};

    if (noteData.title) metadata.title = noteData.title;
    if (noteData.content) metadata.content = noteData.content;
    if (noteData.transcription_status) metadata.transcription_status = noteData.transcription_status;
    if (noteData.summary !== undefined) metadata.summary = noteData.summary;
    if (noteData.word_count !== undefined) metadata.word_count = noteData.word_count;
    if (noteData.recording_duration !== undefined) metadata.recording_duration = noteData.recording_duration;
    if (noteData.priority) metadata.priority = noteData.priority;
    if (noteData.collection_id) metadata.collection = noteData.collection_id;
    if (noteData.tag_ids) metadata.tags = noteData.tag_ids;

    const response = await cosmic.objects.updateOne(id, {
      title: noteData.title,
      metadata,
    });
    
    return response.object as Note;
  } catch (error) {
    console.error('Error updating note:', error);
    throw new Error('Failed to update note');
  }
}

// Delete a note
export async function deleteNote(id: string): Promise<void> {
  try {
    await cosmic.objects.deleteOne(id);
  } catch (error) {
    console.error('Error deleting note:', error);
    throw new Error('Failed to delete note');
  }
}

// Fetch all collections
export async function getCollections(): Promise<Collection[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'collections' })
      .props(['id', 'title', 'slug', 'metadata']);
    
    return response.objects as Collection[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch collections');
  }
}

// Fetch all tags
export async function getTags(): Promise<Tag[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'tags' })
      .props(['id', 'title', 'slug', 'metadata']);
    
    return response.objects as Tag[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch tags');
  }
}

// Fetch notes by collection
export async function getNotesByCollection(collectionId: string): Promise<Note[]> {
  try {
    const response = await cosmic.objects
      .find({ 
        type: 'notes',
        'metadata.collection': collectionId
      })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .depth(1);
    
    const notes = response.objects as Note[];
    
    return notes.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch notes by collection');
  }
}

// Fetch notes by tag
export async function getNotesByTag(tagId: string): Promise<Note[]> {
  try {
    const response = await cosmic.objects
      .find({ 
        type: 'notes',
        'metadata.tags': tagId
      })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .depth(1);
    
    const notes = response.objects as Note[];
    
    return notes.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch notes by tag');
  }
}

// Fetch chat sessions
export async function getChatSessions(): Promise<ChatSession[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'chat-sessions' })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .depth(1);
    
    const sessions = response.objects as ChatSession[];
    
    return sessions.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch chat sessions');
  }
}

// Create a chat session
export async function createChatSession(sessionData: CreateChatSessionData): Promise<ChatSession> {
  try {
    const response = await cosmic.objects.insertOne({
      type: 'chat-sessions',
      title: sessionData.session_title,
      metadata: {
        session_title: sessionData.session_title,
        conversation_data: sessionData.conversation_data,
        session_summary: sessionData.session_summary || "",
        related_notes: sessionData.related_notes || [],
        last_activity: new Date().toISOString().split('T')[0],
      },
    });
    
    return response.object as ChatSession;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw new Error('Failed to create chat session');
  }
}

// Update a chat session
export async function updateChatSession(id: string, sessionData: Partial<CreateChatSessionData>): Promise<ChatSession> {
  try {
    const metadata: Record<string, any> = {
      last_activity: new Date().toISOString().split('T')[0],
    };

    if (sessionData.conversation_data) {
      metadata.conversation_data = sessionData.conversation_data;
    }
    if (sessionData.session_summary !== undefined) {
      metadata.session_summary = sessionData.session_summary;
    }
    if (sessionData.related_notes) {
      metadata.related_notes = sessionData.related_notes;
    }

    const response = await cosmic.objects.updateOne(id, {
      metadata,
    });
    
    return response.object as ChatSession;
  } catch (error) {
    console.error('Error updating chat session:', error);
    throw new Error('Failed to update chat session');
  }
}