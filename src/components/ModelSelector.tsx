import React from 'react';
import { Zap, Brain } from 'lucide-react';

interface ModelSelectorProps {
  currentModel: 'gemini-2.0-flash-exp' | 'gemini-2.0-flash-thinking-exp-1219';
  onModelChange: (model: 'gemini-2.0-flash-exp' | 'gemini-2.0-flash-thinking-exp-1219') => void;
}

export function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1">
      <button
        onClick={() => onModelChange('gemini-2.0-flash-exp')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
          currentModel === 'gemini-2.0-flash-exp'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
        }`}
      >
        <Zap size={16} />
        Kana
      </button>
      
      <button
        onClick={() => onModelChange('gemini-2.0-flash-thinking-exp-1219')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
          currentModel === 'gemini-2.0-flash-thinking-exp-1219'
            ? 'bg-purple-600 text-white shadow-lg'
            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
        }`}
      >
        <Brain size={16} />
        Max Vibes
      </button>
    </div>
  );
}