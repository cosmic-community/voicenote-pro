# 🎤 VoiceNote Pro

![VoiceNote Pro](https://images.unsplash.com/photo-1589254065878-42c9da997008?w=1200&h=300&fit=crop&auto=format)

A modern, intelligent voice-to-text note-taking application that transforms your spoken thoughts into organized, searchable content. Features AI-powered chat assistance, smart organization, and secure access control.

## ✨ Features

- 🎤 **One-Click Voice Recording** - Instant voice capture with visual feedback
- 📝 **Real-Time Transcription** - Automatic speech-to-text conversion
- 🤖 **AI Chat Assistant** - Ask questions about your notes and get intelligent responses
- 📁 **Smart Collections** - Organize notes into color-coded collections
- 🏷️ **Tag System** - Categorize notes with multiple tags for easy filtering
- 🔍 **Powerful Search** - Full-text search across all your transcribed content
- 📊 **Rich Metadata** - Track word count, recording duration, and transcription status
- 🔒 **Access Control** - Secure application with access code protection
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- ⚡ **Real-Time Updates** - Live transcription status and instant note creation

## Clone this Project

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Project](https://img.shields.io/badge/Clone%20this%20Project-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmicjs.com/projects/new?clone_bucket=68d54f88e4b13704227fb48c&clone_repository=68d552bee4b13704227fb4a6)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> "I want to build an application that i can click a button to talk to it and it will take my recording and transcribe it into a text and then I want to be able to store, save, edit, organize these notes. Essentially a personal notion site that allows me to do voice to text for making my notes. I also want an AI chat bot on the pages that allows me to ask AI questions about my notes"

### Code Generation Prompt

> "Based on the content model I created for "I want to build an application that i can click a button to talk to it and it will take my recording and transcribe it into a text and then I want to be able to store, save, edit, organize these notes. Essentially a personal notion site that allows me to do voice to text for making my notes. I also want an AI chat bot on the pages that allows me to ask AI questions about my notes", now build a complete web application that showcases this content. Include a modern, responsive design with proper navigation, content display, and user-friendly interface. And I want to add an access code to the environments to allow me to be the only one to use this application."

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## 🛠️ Technologies Used

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Content Management**: Cosmic CMS
- **Authentication**: Access code protection
- **Voice Processing**: Web Speech API
- **AI Integration**: OpenAI GPT for chat assistance
- **TypeScript**: Full type safety
- **Responsive Design**: Mobile-first approach

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun runtime
- A Cosmic account with the VoiceNote content model
- OpenAI API key (for AI chat features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voicenote-pro
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   COSMIC_BUCKET_SLUG=your-bucket-slug
   COSMIC_READ_KEY=your-read-key
   COSMIC_WRITE_KEY=your-write-key
   ACCESS_CODE=your-secure-access-code
   OPENAI_API_KEY=your-openai-api-key
   ```

4. **Run the development server**
   ```bash
   bun run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` and enter your access code

## 📡 Cosmic SDK Examples

### Fetching Notes with Collections and Tags
```typescript
const notes = await cosmic.objects
  .find({ type: 'notes' })
  .props(['id', 'title', 'slug', 'metadata'])
  .depth(1)
```

### Creating a New Voice Note
```typescript
const newNote = await cosmic.objects.insertOne({
  type: 'notes',
  title: noteTitle,
  metadata: {
    title: noteTitle,
    content: transcribedText,
    transcription_status: 'completed',
    word_count: wordCount,
    recording_duration: duration,
    priority: 'Medium'
  }
})
```

### Managing Chat Sessions
```typescript
const chatSession = await cosmic.objects.insertOne({
  type: 'chat-sessions',
  title: sessionTitle,
  metadata: {
    session_title: sessionTitle,
    conversation_data: { messages },
    session_summary: summary,
    last_activity: new Date().toISOString().split('T')[0]
  }
})
```

## 🌟 Cosmic CMS Integration

This application is built on a robust content model with four main object types:

- **Notes**: Core voice notes with transcription, metadata, and organization
- **Collections**: Grouped note organization with color coding
- **Tags**: Flexible categorization system with visual identification
- **Chat Sessions**: AI conversation history and context

The app leverages Cosmic's depth parameter to efficiently fetch related objects and uses the object metafields for seamless note organization.

## 📱 Deployment Options

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Netlify
1. Connect repository to Netlify
2. Set build command: `bun run build`
3. Add environment variables in site settings

### Self-Hosted
1. Build the application: `bun run build`
2. Start the production server: `bun run start`
3. Configure reverse proxy (nginx/Apache) as needed

Remember to set your environment variables in your hosting platform's dashboard for production deployment.

<!-- README_END -->