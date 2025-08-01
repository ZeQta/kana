# CloakedChat - AI Chatbot

A powerful AI chatbot powered by Horizon Alpha, featuring advanced artifacts, multimodal analysis, and a beautiful ChatGPT-like interface.

## 🚀 Features

### 🤖 AI Capabilities
- **Horizon Alpha Model**: Powered by the most advanced Cloaked AI model
- **Function Calling**: Advanced tool calling for creating interactive artifacts
- **Multimodal Support**: Analyze images, PDFs, and various file types
- **Streaming Responses**: Real-time streaming with typing indicators

### 🎨 Interactive Artifacts
- **HTML Applications**: Create interactive web apps and games
- **React Components**: Build reusable React components
- **Python Scripts**: Generate executable Python code
- **Data Visualizations**: Create charts and dashboards
- **Markdown Documents**: Rich formatted documents
- **Code Examples**: Syntax-highlighted code in multiple languages

### 📁 File Upload & Analysis
- **Image Analysis**: Upload and analyze images
- **PDF Processing**: Extract and analyze PDF content
- **Document Support**: Handle text files, CSV, JSON, and more
- **Drag & Drop**: Intuitive file upload interface

### 🎯 User Experience
- **ChatGPT-like Design**: Familiar and intuitive interface
- **Dark/Light Themes**: Multiple theme options with auto-detection
- **Mobile Optimized**: Fully responsive design
- **PWA Support**: Install as a native app
- **Conversation History**: Persistent chat sessions
- **Export/Import**: Backup and restore conversations

### ⚙️ Advanced Features
- **Model Selection**: Choose between different Cloaked models
- **Custom System Prompts**: Personalize AI behavior
- **Settings Management**: Comprehensive app configuration
- **Keyboard Shortcuts**: Efficient navigation
- **Auto-save**: Automatic conversation persistence

## 🛠️ Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenRouter API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cloaked-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
   VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   VITE_APP_NAME=CloakedChat
   VITE_APP_VERSION=1.0.0
   VITE_DEFAULT_MODEL=openrouter/horizon-alpha
   ```

4. **Get your OpenRouter API key**
   - Visit [OpenRouter](https://openrouter.ai/)
   - Sign up and get your API key
   - Add it to the `.env` file

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 🎮 Usage

### Starting a Conversation
1. Open CloakedChat in your browser
2. Type your message or use suggested prompts
3. Upload files for analysis if needed
4. Watch as the AI responds with text and interactive artifacts

### Creating Artifacts
Ask the AI to create interactive content:
- "Create a Flappy Bird game"
- "Build a React todo app"
- "Generate a data visualization dashboard"
- "Write a Python script to analyze data"

### File Analysis
Upload files to get AI analysis:
- Images: Get descriptions and insights
- PDFs: Extract and summarize content
- Documents: Analyze text and data
- Code files: Get code reviews and improvements

### Customization
- **Settings**: Access via the gear icon
- **Theme**: Choose light, dark, or auto themes
- **Model**: Switch between different Cloaked models
- **System Prompt**: Customize AI behavior

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **File Handling**: React Dropzone
- **PWA**: Vite PWA Plugin
- **AI Integration**: OpenRouter API

### Project Structure
```
src/
├── components/          # React components
│   ├── ChatInput.tsx   # Message input with file upload
│   ├── ChatMessage.tsx # Message display
│   ├── WelcomeScreen.tsx # Landing page
│   └── ...
├── services/           # API and utility services
│   ├── aiService.ts   # OpenRouter integration
│   ├── fileService.ts # File processing
│   └── ...
├── types/             # TypeScript definitions
└── utils/             # Helper functions
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_OPENROUTER_API_KEY` | Your OpenRouter API key | Required |
| `VITE_OPENROUTER_BASE_URL` | OpenRouter API endpoint | `https://openrouter.ai/api/v1` |
| `VITE_APP_NAME` | Application name | `CloakedChat` |
| `VITE_DEFAULT_MODEL` | Default AI model | `openrouter/horizon-alpha` |

### Available Models
- `openrouter/horizon-alpha` - Most powerful (recommended)
- `openrouter/horizon-beta` - Fast and efficient
- `openrouter/horizon-gamma` - Balanced performance

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
The app can be deployed to any static hosting service:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Cloaked AI** for providing the powerful Horizon models
- **OpenRouter** for the API infrastructure
- **OpenAI** for the ChatGPT interface inspiration
- **Vercel** for the deployment platform

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our community discussions

---

**Note**: CloakedChat is free to use during the development period. The Horizon Alpha model is rumored to be a development version of GPT-5 mini, making it one of the most powerful AI models available.