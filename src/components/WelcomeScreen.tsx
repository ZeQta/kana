import React from 'react';
import { Sparkles, Code, MessageCircle, ExternalLink, Zap, Palette, Database, Globe, Brain, Search, Image, Newspaper, Users, Cpu, FileText, Gamepad2, BarChart3, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { fileService } from '../services/fileService';
import type { UploadedFile } from '../types';

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void;
  currentModel: string;
  onModelChange: (model: string) => void;
  onFileUpload: (files: File[]) => void;
  uploadedFiles: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
}

const suggestions = [
  {
    icon: <Code className="w-5 h-5" />,
    title: "Create a React app",
    description: "Build interactive web applications",
    prompt: "Create a beautiful React todo app with modern UI",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: <Gamepad2 className="w-5 h-5" />,
    title: "Build a game",
    description: "Create interactive games and simulations",
    prompt: "Create a simple Flappy Bird game using HTML5 Canvas",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Data visualization",
    description: "Create charts and interactive dashboards",
    prompt: "Create an interactive dashboard showing sales data with charts",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: <Bot className="w-5 h-5" />,
    title: "AI assistant",
    description: "Build intelligent chatbots and tools",
    prompt: "Create a smart calculator that can solve complex equations",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: <Palette className="w-5 h-5" />,
    title: "Design system",
    description: "Create beautiful UI components",
    prompt: "Design a modern card component with hover effects",
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "Data analysis",
    description: "Analyze and process data",
    prompt: "Write a Python script to analyze CSV data and create visualizations",
    gradient: "from-teal-500 to-blue-500"
  }
];

const quickActions = [
  { icon: <FileText className="w-4 h-4" />, label: "Analyze files", action: "files", color: "text-blue-400" },
  { icon: <Brain className="w-4 h-4" />, label: "Learn AI", action: "ai", color: "text-purple-400" },
  { icon: <Code className="w-4 h-4" />, label: "Code review", action: "code", color: "text-green-400" },
  { icon: <Image className="w-4 h-4" />, label: "Image analysis", action: "image", color: "text-pink-400" },
  { icon: <Globe className="w-4 h-4" />, label: "Web scraping", action: "web", color: "text-orange-400" },
  { icon: <Sparkles className="w-4 h-4" />, label: "Creative writing", action: "writing", color: "text-cyan-400" }
];

export function WelcomeScreen({ 
  onSendMessage, 
  currentModel, 
  onModelChange,
  onFileUpload,
  uploadedFiles,
  onRemoveFile 
}: WelcomeScreenProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFileUpload,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md', '.csv', '.json'],
      'application/json': ['.json']
    },
    maxSize: fileService.getMaxFileSize(),
    multiple: true
  });

  const handleQuickAction = (action: string) => {
    const prompts = {
      files: "I have some files I'd like you to analyze. Can you help me understand their content?",
      ai: "Explain the latest developments in artificial intelligence and machine learning",
      code: "Can you review this code and suggest improvements for better performance and readability?",
      image: "I have an image I'd like you to analyze. Can you describe what you see?",
      web: "Can you help me gather information from the web about the latest technology trends?",
      writing: "Help me write a creative story with an engaging plot and interesting characters"
    };
    
    onSendMessage(prompts[action as keyof typeof prompts] || "Hello!");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen overflow-y-auto">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Logo and Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="relative">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">C</span>
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              CloakedChat
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-2">
              Powered by Horizon Alpha
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 max-w-2xl mx-auto">
              The most powerful AI chatbot with advanced artifacts, multimodal analysis, and interactive capabilities
            </p>
          </div>
        </motion.div>

        {/* File Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}>
            <input {...getInputProps()} />
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isDragActive ? 'Drop files here' : 'Upload files to analyze'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Images, PDFs, documents, and more
            </p>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
                >
                  <span className="text-lg">{fileService.getFileIcon(file.type)}</span>
                  <span className="text-gray-700 dark:text-gray-300 truncate max-w-32">
                    {file.name}
                  </span>
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    <span className="text-gray-500 dark:text-gray-400">×</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.action}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => handleQuickAction(action.action)}
                className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                <span className={action.color}>{action.icon}</span>
                <span className="text-gray-700 dark:text-gray-300">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Suggested Prompts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={() => onSendMessage(suggestion.prompt)}
                className="text-left p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${suggestion.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <span className="text-white">{suggestion.icon}</span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {suggestion.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {suggestion.description}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-gray-500 dark:text-gray-400 space-y-1"
        >
          <p>CloakedChat can make mistakes. Consider checking important information.</p>
          <p>Powered by Horizon Alpha • Free during development period</p>
        </motion.div>
      </div>
    </div>
  );
}