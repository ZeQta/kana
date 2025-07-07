import React from 'react';
import { User, Bot, Search, Globe, Image, Download, ExternalLink, Loader, Brain } from 'lucide-react';
import { MessageRenderer } from './MessageRenderer';
import { ArtifactRenderer } from './ArtifactRenderer';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  isThinking?: boolean;
}

export function ChatMessage({ message, isStreaming, isThinking }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const handleDownloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderThinkingAnimation = () => (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-4 md:p-6 border border-purple-500/30 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Brain size={16} className="md:w-5 md:h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-300 text-base md:text-lg">Agentic Mode Thinking...</h3>
            <p className="text-xs md:text-sm text-purple-200/80">
              Analyzing your request and planning the best approach
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-6">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-xs md:text-sm text-purple-300/80">
            🧠 Deep thinking in progress...
          </p>
        </div>
      </div>
    </div>
  );

  const renderImageGeneration = (toolResult: any) => {
    if (toolResult.name !== 'generate_image') return null;

    // Show loading state for image generation
    if (!toolResult.result.success && !toolResult.result.error) {
      return (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-4 md:p-6 border border-purple-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center animate-image-gen">
                <Image size={16} className="md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-300 text-base md:text-lg">Generating Image...</h3>
                <p className="text-xs md:text-sm text-purple-200/80">
                  Creating your image, this may take a moment
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center py-8">
              <div className="relative">
                <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-500/20 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs md:text-sm text-purple-300/80">
                ✨ Crafting your masterpiece with AI magic...
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (!toolResult.result.success) {
      return (
        <div className="mb-6">
          <div className="bg-red-900/30 rounded-2xl p-4 border border-red-500/30">
            <div className="flex items-center gap-3">
              <Image size={16} className="text-red-400" />
              <span className="text-sm font-medium text-red-300">Image Generation Failed</span>
            </div>
            <p className="text-sm text-red-400 mt-2">{toolResult.result.error}</p>
          </div>
        </div>
      );
    }

    const images = toolResult.result.data.images || [];
    
    return (
      <div className="mb-6">
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-4 md:p-6 border border-green-500/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Image size={16} className="md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-300 text-base md:text-lg">AI Image Generation</h3>
              <p className="text-xs md:text-sm text-green-200/80">
                Generated {images.length} image{images.length > 1 ? 's' : ''} from your prompt
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {images.map((img: any, idx: number) => (
              <div key={idx} className="bg-black/20 rounded-xl overflow-hidden border border-green-500/20">
                <div className="relative group">
                  <img 
                    src={img.url} 
                    alt={`Generated image ${idx + 1}`}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadImage(img.url, `kana-generated-${Date.now()}-${idx + 1}.png`)}
                        className="p-2 md:p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors shadow-lg"
                        title="Download image"
                      >
                        <Download size={16} className="md:w-5 md:h-5" />
                      </button>
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 md:p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg"
                        title="Open in new tab"
                      >
                        <ExternalLink size={16} className="md:w-5 md:h-5" />
                      </a>
                    </div>
                  </div>
                </div>
                
                {img.revised_prompt && (
                  <div className="p-3 md:p-4">
                    <p className="text-xs text-green-300/80 font-medium mb-1">Optimized Prompt:</p>
                    <p className="text-xs md:text-sm text-green-200/90 leading-relaxed">{img.revised_prompt}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderWebSearchResult = (toolResult: any) => {
    if (toolResult.name !== 'web_search') return null;

    return (
      <div className="bg-blue-900/30 rounded-2xl p-4 border border-blue-500/30 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <Search size={16} className="text-blue-400" />
          <span className="text-sm font-medium text-blue-300">Web Search</span>
          <span className="text-xs text-blue-400/80 truncate flex-1">
            "{toolResult.args.query}"
          </span>
        </div>
        {toolResult.result.success && (
          <div className="space-y-2">
            <div className="text-xs text-blue-300">
              Found {toolResult.result.data.results.length} results
            </div>
            {toolResult.result.data.results.slice(0, 3).map((result: any, idx: number) => (
              <div key={idx} className="bg-blue-800/20 rounded-lg p-3 border border-blue-600/20">
                <a 
                  href={result.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-200 hover:text-blue-100 line-clamp-2"
                >
                  {result.title}
                </a>
                <p className="text-xs text-blue-300/80 mt-1 line-clamp-2">{result.snippet}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderWebScrapeResult = (toolResult: any) => {
    if (toolResult.name !== 'web_scrape') return null;

    return (
      <div className="bg-green-900/30 rounded-2xl p-4 border border-green-500/30 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <Globe size={16} className="text-green-400" />
          <span className="text-sm font-medium text-green-300">Web Scrape</span>
          <span className="text-xs text-green-400/80 truncate flex-1">
            {toolResult.args.url}
          </span>
        </div>
        {toolResult.result.success && (
          <div className="space-y-2">
            <div className="text-xs text-green-300">
              Content scraped successfully
            </div>
            {toolResult.result.data.title && (
              <div className="bg-green-800/20 rounded-lg p-3 border border-green-600/20">
                <h4 className="text-sm font-medium text-green-200">{toolResult.result.data.title}</h4>
                <p className="text-xs text-green-300/80 mt-1 line-clamp-3">
                  {toolResult.result.data.content?.substring(0, 200)}...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`chat-message flex gap-3 md:gap-4 lg:gap-6 p-3 md:p-4 lg:p-6 xl:p-8 ${isUser ? 'bg-transparent' : 'bg-gray-900/30 backdrop-blur-sm'}`}>
      <div className={`chat-avatar flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-2xl flex items-center justify-center shadow-lg ${
        isUser 
          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
          : 'bg-white border-2 border-gray-700/30'
      }`}>
        {isUser ? (
          <User size={14} className="md:w-4 md:h-4" />
        ) : (
          <div className="w-4 h-4 md:w-6 md:h-6 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs md:text-sm">K</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="mb-2 md:mb-3">
          <span className="font-semibold text-white text-sm md:text-base lg:text-lg">
            {isUser ? 'You' : 'Kana'}
          </span>
          <span className="ml-2 md:ml-3 text-xs md:text-sm text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        
        <div className="text-gray-200 overflow-hidden">
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm md:text-base lg:text-lg leading-relaxed break-words">{message.content}</p>
          ) : (
            <div className={isStreaming ? 'streaming-text' : ''}>
              {/* Thinking Animation for Agentic Mode */}
              {isThinking && renderThinkingAnimation()}

              {/* Tool Results */}
              {message.toolResults && message.toolResults.length > 0 && (
                <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
                  {message.toolResults.map((toolResult, index) => {
                    // Special handling for different tool types
                    if (toolResult.name === 'generate_image') {
                      return (
                        <div key={index}>
                          {renderImageGeneration(toolResult)}
                        </div>
                      );
                    } else if (toolResult.name === 'web_search') {
                      return (
                        <div key={index}>
                          {renderWebSearchResult(toolResult)}
                        </div>
                      );
                    } else if (toolResult.name === 'web_scrape') {
                      return (
                        <div key={index}>
                          {renderWebScrapeResult(toolResult)}
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              )}

              <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">
                <MessageRenderer content={message.content} />
              </div>
              
              {/* Render artifacts */}
              {message.artifacts && message.artifacts.length > 0 && (
                <div className="mt-4 md:mt-6 space-y-4 md:space-y-6">
                  {message.artifacts.map((artifact) => (
                    <ArtifactRenderer
                      key={artifact.id}
                      artifact={artifact}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}