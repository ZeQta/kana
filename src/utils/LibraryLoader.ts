import type { LibraryConfig } from '../types';

const AVAILABLE_LIBRARIES: Record<string, LibraryConfig> = {
  'react': {
    version: '18.2.0',
    url: 'https://unpkg.com/react@18.2.0/umd/react.production.min.js'
  },
  'react-dom': {
    version: '18.2.0',
    url: 'https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js',
    dependencies: ['react']
  },
  'tailwindcss': {
    version: '3.4.0',
    url: 'https://cdn.tailwindcss.com',
    type: 'js'
  },
  'lodash': {
    version: '4.17.21',
    url: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js'
  },
  'chart.js': {
    version: '4.4.0',
    url: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js'
  },
  'd3': {
    version: '7.8.5',
    url: 'https://d3js.org/d3.v7.min.js'
  },
  'three': {
    version: '0.158.0',
    url: 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js'
  }
};

export class LibraryLoader {
  private loadedLibraries = new Set<string>();
  private loadingPromises = new Map<string, Promise<void>>();

  async loadLibrary(libraryName: string): Promise<void> {
    if (this.loadedLibraries.has(libraryName)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(libraryName)) {
      return this.loadingPromises.get(libraryName)!;
    }

    const library = AVAILABLE_LIBRARIES[libraryName];
    if (!library) {
      throw new Error(`Library ${libraryName} not available`);
    }

    // Load dependencies first
    if (library.dependencies) {
      await Promise.all(
        library.dependencies.map(dep => this.loadLibrary(dep))
      );
    }

    const loadPromise = this.loadScript(library.url);
    this.loadingPromises.set(libraryName, loadPromise);

    await loadPromise;
    this.loadedLibraries.add(libraryName);
    this.loadingPromises.delete(libraryName);
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${url}`));
      document.head.appendChild(script);
    });
  }
}