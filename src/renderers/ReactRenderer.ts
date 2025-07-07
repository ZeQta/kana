import React from 'react';
import { createRoot } from 'react-dom/client';

export class ReactRenderer {
  private babel: any;

  constructor() {
    // Only need to load Babel for JSX transformation
  }

  async render(componentCode: string, containerId: string, options: any = {}): Promise<any> {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    // Load Babel if not already loaded
    await this.loadBabel();

    // Clear existing content
    container.innerHTML = '';

    try {
      // Transform JSX to executable JavaScript
      const transformedCode = this.babel.transform(componentCode, {
        presets: ['react', 'env'],
        plugins: ['transform-modules-commonjs']
      }).code;

      // Create isolated module scope
      const module = { exports: {} };
      const require = this.createRequireFunction();

      // Execute component code using the application's React instances
      const componentFunction = new Function(
        'module', 
        'exports', 
        'require', 
        'React', 
        'createRoot',
        transformedCode
      );
      
      // Pass the imported React and createRoot directly
      componentFunction(module, module.exports, require, React, createRoot);

      // Get the component
      const Component = module.exports.default || module.exports;

      // Ensure we have a valid component
      if (!Component || typeof Component !== 'function') {
        throw new Error('Component is not a valid React component function');
      }

      // Create React root and render using the application's React instances
      const root = createRoot(container);
      root.render(React.createElement(Component, options.props || {}));

      return { root, Component };
    } catch (error) {
      // Show error in container
      container.innerHTML = `
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 class="text-red-800 font-semibold mb-2">React Component Error</h3>
          <pre class="text-red-600 text-sm overflow-auto">${error instanceof Error ? error.message : 'Unknown error'}</pre>
        </div>
      `;
      throw error;
    }
  }

  private async loadBabel() {
    if (!this.babel) {
      // Only load Babel standalone for JSX transformation
      await this.loadScript('https://unpkg.com/@babel/standalone@7.23.6/babel.min.js');
      this.babel = (window as any).Babel;
    }
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

  private createRequireFunction() {
    return (moduleName: string) => {
      const modules: Record<string, any> = {
        'react': React,
        'react-dom/client': { createRoot },
        'react-dom': { createRoot }
      };
      
      if (modules[moduleName]) {
        return modules[moduleName];
      }
      
      throw new Error(`Module ${moduleName} not found`);
    };
  }
}