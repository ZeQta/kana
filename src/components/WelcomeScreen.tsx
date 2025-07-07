import React from 'react';
import { Sparkles, Code, MessageCircle, ExternalLink, Zap, Palette, Database, Globe, Brain, Search, Image, Newspaper, Users, Cpu } from 'lucide-react';

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void;
  currentModel: 'gemini-2.5-flash' | 'gemini-2.5-pro';
}

const suggestions = [
  {
    icon: <Code className="w-5 h-5 md:w-6 md:h-6" />,
    title: "Build a React component",
    description: "Create interactive UI components with modern React",
    prompt: "Create a beautiful todo list component with React",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: <Palette className="w-5 h-5 md:w-6 md:h-6" />,
    title: "Design a webpage",
    description: "Build responsive HTML pages with modern CSS",
    prompt: "Create a modern landing page for a tech startup",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: <Image className="w-5 h-5 md:w-6 md:h-6" />,
    title: "Generate Images",
    description: "Create stunning AI-generated images",
    prompt: "Generate a beautiful landscape image with mountains and a lake",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: <Brain className="w-5 h-5 md:w-6 md:h-6" />,
    title: "Learn something new",
    description: "Explain complex topics with interactive examples",
    prompt: "Explain how machine learning works with examples",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: <Database className="w-5 h-5 md:w-6 md:h-6" />,
    title: "Code solutions",
    description: "Write, debug, and explain code in any language",
    prompt: "Write a Python function to analyze CSV data",
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    icon: <Globe className="w-5 h-5 md:w-6 md:h-6" />,
    title: "Creative projects",
    description: "Build games, animations, and interactive content",
    prompt: "Create a simple memory card game",
    gradient: "from-teal-500 to-blue-500"
  }
];

const quickActions = [
  { icon: <Search className="w-4 h-4 md:w-5 md:h-5" />, label: "DeepSearch", action: "search", color: "text-blue-400" },
  { icon: <Brain className="w-4 h-4 md:w-5 md:h-5" />, label: "Think", action: "think", color: "text-purple-400" },
  { icon: <Image className="w-4 h-4 md:w-5 md:h-5" />, label: "Create Images", action: "images", color: "text-green-400" },
  { icon: <Palette className="w-4 h-4 md:w-5 md:h-5" />, label: "Edit Image", action: "edit", color: "text-pink-400" },
  { icon: <Newspaper className="w-4 h-4 md:w-5 md:h-5" />, label: "Latest News", action: "news", color: "text-orange-400" },
  { icon: <Users className="w-4 h-4 md:w-5 md:h-5" />, label: "Personas", action: "personas", color: "text-cyan-400" }
];

export function WelcomeScreen({ onSendMessage, currentModel }: WelcomeScreenProps) {
  return (
    <div className="welcome-screen flex-1 flex items-center justify-center p-4 md:p-8 bg-black min-h-screen overflow-y-auto">
      <div className="max-w-6xl w-full text-center space-y-8 md:space-y-12">
        {/* Logo and Title */}
        <div className="space-y-6 md:space-y-8">
          <div className="relative">
            {/* Animated background circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full animate-pulse delay-1000"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full animate-pulse delay-500"></div>
            </div>
            
            {/* Main logo */}
            <div className="relative w-16 h-16 md:w-24 md:h-24 mx-auto bg-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl border-2 md:border-4 border-gray-800/50">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-black rounded-xl md:rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg md:text-2xl">K</span>
              </div>
            </div>
          </div>
          
          <div>
            <h1 className="welcome-title text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 md:mb-6 tracking-tight">
              Kana
            </h1>
            <p className="welcome-subtitle text-lg md:text-2xl lg:text-3xl text-gray-400 mb-3 md:mb-4 font-light">
              Know More • Be More
            </p>
            <p className="text-sm md:text-lg lg:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed px-4">
              India's first Intelligent AI Chatbot with{' '}
              <span className="font-semibold text-blue-400 bg-blue-400/10 px-2 md:px-3 py-1 rounded-full">
                Interactive Artifacts
              </span>
              {' '}and{' '}
              <span className="font-semibold text-purple-400 bg-purple-400/10 px-2 md:px-3 py-1 rounded-full">
                Advanced Tool Calling
              </span>
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="max-w-3xl mx-auto px-4">
          <div className="relative">
            <input
              type="text"
              placeholder="What do you want to know?"
              className="w-full px-6 md:px-8 py-4 md:py-6 bg-gray-900/80 border border-gray-700/50 rounded-2xl md:rounded-3xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-base md:text-xl backdrop-blur-xl shadow-2xl transition-all duration-300 hover:bg-gray-900/90"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  onSendMessage(e.currentTarget.value.trim());
                  e.currentTarget.value = '';
                }
              }}
            />
            <div className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2">
              <span className="text-gray-500 text-xs md:text-sm bg-gray-800/50 px-2 md:px-3 py-1 rounded-full border border-gray-700/30">
                {currentModel === 'gemini-2.5-pro' ? 'Agentic' : 'Kana'} 2.5
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions flex flex-wrap justify-center gap-2 md:gap-3 max-w-4xl mx-auto px-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quick-action-btn flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-3 bg-gray-900/80 hover:bg-gray-800/80 border border-gray-700/50 rounded-xl md:rounded-2xl text-gray-300 hover:text-white transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-105 group text-sm md:text-base"
              onClick={() => {
                if (action.action === 'search') {
                  onSendMessage('Help me search for information about the latest technology trends');
                } else if (action.action === 'think') {
                  onSendMessage('Help me think through a complex problem step by step');
                } else if (action.action === 'images') {
                  onSendMessage('Generate a beautiful landscape image with mountains and a lake');
                } else {
                  onSendMessage(`Help me with ${action.label.toLowerCase()}`);
                }
              }}
            >
              <span className={`${action.color} group-hover:scale-110 transition-transform duration-200`}>
                {action.icon}
              </span>
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Suggestion Grid */}
        <div className="welcome-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto px-4">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSendMessage(suggestion.prompt)}
              className="welcome-card group p-4 md:p-6 lg:p-8 bg-gray-900/50 hover:bg-gray-900/80 rounded-2xl md:rounded-3xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 text-left transform hover:-translate-y-2 backdrop-blur-xl shadow-xl hover:shadow-2xl"
            >
              <div className="flex items-start gap-4 md:gap-6">
                <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${suggestion.gradient} rounded-xl md:rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {suggestion.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2 md:mb-3 group-hover:text-blue-400 transition-colors text-base md:text-xl">
                    {suggestion.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Branding */}
        <div className="pt-8 md:pt-12 space-y-3 md:space-y-4 px-4">
          <p className="text-gray-600 text-xs md:text-sm">
            Made with ❤️ in India
          </p>
          <a
            href="https://zeqta.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 md:gap-3 text-blue-400 hover:text-blue-300 transition-colors font-medium group text-base md:text-lg"
          >
            <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Singularity
            </span>
            <ExternalLink size={14} className="md:w-4 md:h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
}