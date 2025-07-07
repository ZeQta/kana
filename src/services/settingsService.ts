import type { AppSettings } from '../types';

const SETTINGS_KEY = 'kana_settings';

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { customSystemPrompt: '' };
  } catch {
    return { customSystemPrompt: '' };
  }
}