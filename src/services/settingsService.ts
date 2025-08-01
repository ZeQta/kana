import type { AppSettings } from '../types';

const SETTINGS_KEY = 'cloaked_chat_settings';

const DEFAULT_SETTINGS: AppSettings = {
  customSystemPrompt: '',
  theme: 'dark',
  fontSize: 'medium',
  enableAnimations: true,
  autoSave: true,
  maxHistoryLength: 100
};

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to ensure all properties exist
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export function resetSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Error resetting settings:', error);
  }
}

export function updateSetting<K extends keyof AppSettings>(
  key: K, 
  value: AppSettings[K]
): AppSettings {
  const currentSettings = loadSettings();
  const newSettings = { ...currentSettings, [key]: value };
  saveSettings(newSettings);
  return newSettings;
}