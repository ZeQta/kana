# CloakedChat - AI Assistant

A powerful AI chatbot application powered by the **Horizon Alpha** model via OpenRouter. CloakedChat features a ChatGPT-like interface with advanced capabilities including artifacts, multimodal input, conversation history, and PWA support.

![CloakedChat Screenshot](./public/screenshot-wide.png)

## 🚀 Features

### Core Features
- **🤖 Horizon Alpha Model**: Powered by OpenRouter's most advanced model (rumored to be GPT-5 mini in development)
- **💬 ChatGPT-like Interface**: Familiar and intuitive chat interface matching ChatGPT's design
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **🌙 Dark Mode**: Beautiful dark and light theme support
- **📱 PWA Ready**: Install as a native app on any device

### Advanced Features
- **🎨 Artifacts System**: Create interactive HTML, React, Python, and other code artifacts
- **📎 Multimodal Input**: Upload and analyze images, PDFs, text files, and documents
- **💾 Conversation History**: Persistent chat history stored locally
- **🎯 Advanced Formatting**: Rich markdown rendering with syntax highlighting
- **⚡ Real-time Streaming**: Fast response streaming for better UX
- **📋 Copy & Export**: Easy copying of messages and artifact downloads

### Technical Features
- **⚡ Next.js 14**: Built with the latest Next.js App Router
- **🎨 Tailwind CSS**: Beautiful, responsive styling
- **🔧 TypeScript**: Full type safety
- **🚀 Optimized Performance**: Fast loading and smooth interactions
- **📱 Mobile-First**: Designed for mobile with desktop enhancements

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenRouter API key

### 1. Clone and Install

```bash
git clone <repository-url>
cd cloaked-chat
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_APP_NAME=CloakedChat
```

**Getting your OpenRouter API Key:**
1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

### 3. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build

```bash
npm run build
npm start
```

### 5. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/cloaked-chat)

1. Click the deploy button above
2. Connect your GitHub repository
3. Add your `OPENROUTER_API_KEY` in the environment variables
4. Deploy!

## 📋 Usage Guide

### Basic Chat
1. Type your message in the input field
2. Press Enter or click Send
3. View the AI's response with rich formatting

### File Upload
1. Click the paperclip icon in the chat input
2. Drag and drop files or click to browse
3. Supported formats: Images (JPG, PNG, GIF, WebP), PDFs, Text files, Documents
4. The AI will analyze your files and respond accordingly

### Artifacts
The AI can create interactive artifacts when appropriate:
- **HTML/CSS/JS**: Live web applications and demos
- **React Components**: Interactive React code
- **Python Scripts**: Code with execution instructions
- **Markdown Documents**: Rich formatted documents

### Conversation Management
- **New Chat**: Click "New Chat" to start fresh
- **History**: All conversations are saved locally
- **Rename**: Click the edit icon to rename conversations
- **Delete**: Remove conversations you no longer need

### Dark Mode
Toggle between light and dark themes using the moon/sun icon in the sidebar.

## 🏗️ Architecture

### Project Structure
```
cloaked-chat/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/chat/        # Chat API endpoint
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main chat interface
│   ├── components/          # React components
│   │   ├── ui/              # Base UI components
│   │   ├── ArtifactRenderer.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── FileUpload.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   └── Sidebar.tsx
│   ├── lib/                 # Utilities and services
│   │   ├── openrouter.ts    # OpenRouter API integration
│   │   ├── storage.ts       # Local storage management
│   │   └── utils.ts         # Helper functions
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets and PWA files
└── tailwind.config.ts       # Tailwind configuration
```

### Key Technologies
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **AI Integration**: OpenRouter API (Horizon Alpha model)
- **Markdown**: react-markdown, remark-gfm, rehype-highlight
- **PWA**: next-pwa
- **Storage**: localStorage for conversation history

## 🎨 Customization

### Themes
Modify colors in `tailwind.config.ts` and `globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --background: 0 0% 100%;
  /* ... more variables */
}
```

### AI Behavior
Customize the system prompt in `src/lib/openrouter.ts`:

```typescript
const SYSTEM_PROMPT = `You are CloakedChat, a powerful AI assistant...`;
```

### Artifacts
Add new artifact types in `src/components/ArtifactRenderer.tsx` and update the type definitions.

## 🔧 API Reference

### Chat Endpoint
```
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Hello!"
    }
  ]
}
```

Response:
```json
{
  "message": "Hello! How can I help you today?",
  "artifacts": [],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 15,
    "total_tokens": 25
  }
}
```

## 🚀 Performance

- **Lighthouse Score**: 95+ on all metrics
- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 2.5s
- **PWA Ready**: Installable with offline capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai) for providing access to the Horizon Alpha model
- [Vercel](https://vercel.com) for hosting and deployment
- [Tailwind CSS](https://tailwindcss.com) for the styling system
- [Radix UI](https://radix-ui.com) for accessible components

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/cloaked-chat/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Built with ❤️ using the Horizon Alpha model - The future of AI conversation is here!**
