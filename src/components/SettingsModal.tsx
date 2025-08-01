import React, { useState } from 'react';
import { X, Settings, Save, Moon, Sun, Monitor, Type, Zap, Database, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSettingsChange }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: AppSettings = {
      customSystemPrompt: '',
      theme: 'dark',
      fontSize: 'medium',
      enableAnimations: true,
      autoSave: true,
      maxHistoryLength: 100
    };
    setLocalSettings(defaultSettings);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Settings size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Theme Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', icon: Sun, label: 'Light' },
                    { value: 'dark', icon: Moon, label: 'Dark' },
                    { value: 'auto', icon: Monitor, label: 'Auto' }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => setLocalSettings({ ...localSettings, theme: theme.value as any })}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                        localSettings.theme === theme.value
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <theme.icon size={16} />
                      <span className="text-sm font-medium">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Font Size
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' }
                  ].map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setLocalSettings({ ...localSettings, fontSize: size.value as any })}
                      className={`p-3 rounded-lg border transition-colors ${
                        localSettings.fontSize === size.value
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="text-sm font-medium">{size.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Enable Animations
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Smooth transitions and animations
                    </p>
                  </div>
                  <button
                    onClick={() => setLocalSettings({ ...localSettings, enableAnimations: !localSettings.enableAnimations })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.enableAnimations ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.enableAnimations ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Auto Save
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically save conversations
                    </p>
                  </div>
                  <button
                    onClick={() => setLocalSettings({ ...localSettings, autoSave: !localSettings.autoSave })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.autoSave ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.autoSave ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* History Length */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Max History Length
                </label>
                <select
                  value={localSettings.maxHistoryLength}
                  onChange={(e) => setLocalSettings({ ...localSettings, maxHistoryLength: parseInt(e.target.value) })}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={50}>50 messages</option>
                  <option value={100}>100 messages</option>
                  <option value={200}>200 messages</option>
                  <option value={500}>500 messages</option>
                </select>
              </div>

              {/* Custom System Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Custom System Prompt
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Add custom instructions to modify CloakedChat's behavior
                </p>
                <textarea
                  value={localSettings.customSystemPrompt}
                  onChange={(e) => setLocalSettings({ ...localSettings, customSystemPrompt: e.target.value })}
                  placeholder="Enter your custom instructions here..."
                  className="w-full h-24 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
              </div>

              {/* Tips */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h3 className="text-blue-700 dark:text-blue-300 font-medium mb-2 text-sm">💡 Tips</h3>
                <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• Custom prompts help personalize your AI experience</li>
                  <li>• Use "Auto" theme to follow your system preference</li>
                  <li>• Adjust font size for better readability</li>
                  <li>• Enable animations for a smoother experience</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <RotateCcw size={16} />
                <span className="text-sm">Reset to Defaults</span>
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Save size={16} />
                  Save Settings
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}