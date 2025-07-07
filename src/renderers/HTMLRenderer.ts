export class HTMLRenderer {
  async render(content: string, containerId: string, options: any = {}): Promise<HTMLIFrameElement> {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    // Clear existing content
    container.innerHTML = '';

    // Create iframe for sandboxed execution
    const iframe = document.createElement('iframe');
    iframe.className = 'w-full border-0 rounded-lg bg-white';
    iframe.style.minHeight = '400px';
    iframe.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-forms');

    // Inject libraries and wrap content
    const enrichedContent = this.injectLibraries(content, options.libraries || []);
    iframe.srcdoc = this.wrapContent(enrichedContent);

    container.appendChild(iframe);

    // Wait for iframe to load
    return new Promise((resolve, reject) => {
      iframe.onload = () => resolve(iframe);
      iframe.onerror = () => reject(new Error('Failed to load iframe'));
    });
  }

  private injectLibraries(content: string, libraries: string[]): string {
    const libraryTags = libraries.map(lib => {
      const config = this.getLibraryConfig(lib);
      if (config.type === 'css') {
        return `<link rel="stylesheet" href="${config.url}">`;
      } else {
        return `<script src="${config.url}"></script>`;
      }
    }).join('\n');

    if (content.includes('<head>')) {
      return content.replace('<head>', `<head>\n${libraryTags}`);
    } else {
      return `<!DOCTYPE html><html><head>${libraryTags}</head><body>${content}</body></html>`;
    }
  }

  private wrapContent(content: string): string {
    if (content.includes('<!DOCTYPE') || content.includes('<html')) {
      return content;
    }

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kana Artifact</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
  }

  private getLibraryConfig(library: string): { url: string; type: string } {
    const configs: Record<string, { url: string; type: string }> = {
      'tailwindcss': {
        url: 'https://cdn.tailwindcss.com',
        type: 'js'
      },
      'bootstrap': {
        url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
        type: 'css'
      }
    };

    return configs[library] || { url: '', type: 'js' };
  }
}