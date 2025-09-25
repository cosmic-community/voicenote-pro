import OpenAI from 'openai';
import { Note, ChatMessage } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateChatResponse(
  messages: ChatMessage[],
  notes: Note[],
  context?: string
): Promise<string> {
  try {
    // Build context from notes
    const notesContext = notes.map(note => {
      const title = note.metadata?.title || note.title;
      const content = note.metadata?.content || '';
      const summary = note.metadata?.summary || '';
      
      return `Title: ${title}\nContent: ${content}\nSummary: ${summary}`;
    }).join('\n\n---\n\n');

    // System message to provide context about the notes
    const systemMessage = `You are an AI assistant helping a user with their voice notes. You have access to their personal notes and can answer questions about them.

Available Notes:
${notesContext}

Additional Context: ${context || 'No additional context provided.'}

Please provide helpful, concise responses based on the user's notes. If asked about something not in their notes, let them know you don't see that information in their current notes.`;

    // Convert ChatMessage format to OpenAI format
    const openaiMessages = [
      { role: 'system' as const, content: systemMessage },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openaiMessages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
  } catch (error) {
    console.error('Error generating chat response:', error);
    return 'I encountered an error while processing your request. Please try again later.';
  }
}

export async function generateNoteSummary(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise summaries of voice notes. Create a brief, clear summary that captures the key points and main themes.',
        },
        {
          role: 'user',
          content: `Please create a brief summary of this note:\n\n${content}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || 'Unable to generate summary.';
  } catch (error) {
    console.error('Error generating note summary:', error);
    return 'Summary generation failed.';
  }
}

export async function generateNoteTitle(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise, descriptive titles for voice notes. Create a short title (2-6 words) that captures the main topic or theme.',
        },
        {
          role: 'user',
          content: `Please create a short, descriptive title for this note:\n\n${content.slice(0, 300)}`,
        },
      ],
      max_tokens: 20,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || 'New Voice Note';
  } catch (error) {
    console.error('Error generating note title:', error);
    return 'New Voice Note';
  }
}