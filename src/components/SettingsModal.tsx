import React, { useState } from 'react';
import { X, Settings, Save } from 'lucide-react';
import type { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSettingsChange }: SettingsModalProps) {
  const [customPrompt, setCustomPrompt] = useState(settings.customSystemPrompt || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSettingsChange({
      ...settings,
      customSystemPrompt: customPrompt
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="settings-modal bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Settings size={16} className="md:w-5 md:h-5 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
          >
            <X size={18} className="md:w-5 md:h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="settings-content p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto max-h-[60vh]">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 md:mb-3">
              Custom System Prompt
            </label>
            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
              Add your own instructions that will be included with Kana's default system prompt. This helps customize Kana's behavior and responses.
            </p>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter your custom instructions here..."
              className="w-full h-24 md:h-32 px-3 md:px-4 py-2 md:py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none text-sm md:text-base"
            />
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 md:p-4">
            <h3 className="text-blue-300 font-medium mb-2 text-sm md:text-base">💡 Tips</h3>
            <ul className="text-xs md:text-sm text-blue-200 space-y-1">
              <li>• Be specific about the tone and style you want</li>
              <li>• Include any domain expertise you need</li>
              <li>• Mention preferred response formats</li>
              <li>• Keep it concise but clear</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-gray-700/50">
          <button
            onClick={onClose}
            className="px-4 md:px-6 py-2 text-gray-400 hover:text-white transition-colors text-sm md:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 md:px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
          >
            <Save size={14} className="md:w-4 md:h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}