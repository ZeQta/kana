import type { ArtifactType } from '../types';

export class ContentSanitizer {
  async sanitize(content: string, type: ArtifactType): Promise<string> {
    switch (type) {
      case 'text/html':
        return this.sanitizeHTML(content);
      case 'application/vnd.kana.react':
        return this.sanitizeJavaScript(content);
      case 'application/vnd.kana.code':
        return content; // Code is displayed, not executed
      case 'image/svg+xml':
        return this.sanitizeSVG(content);
      case 'text/markdown':
        return content; // Markdown is safe when rendered properly
      default:
        return content;
    }
  }

  private sanitizeHTML(content: string): string {
    // Remove dangerous elements and attributes
    const dangerousElements = ['script', 'object', 'embed', 'form'];
    const dangerousAttributes = ['onclick', 'onload', 'onerror'];
    
    let sanitized = content;
    
    // Remove dangerous HTML elements
    dangerousElements.forEach(element => {
      const regex = new RegExp(`<${element}[^>]*>.*?</${element}>`, 'gis');
      sanitized = sanitized.replace(regex, '');
    });
    
    // Remove dangerous attributes
    dangerousAttributes.forEach(attr => {
      const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    return sanitized;
  }

  private sanitizeJavaScript(code: string): string {
    const forbiddenPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /document\.write/gi,
      /window\.(location|open)/gi,
      /fetch\s*\(/gi,
      /XMLHttpRequest/gi
    ];
    
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(code)) {
        throw new Error(`Forbidden pattern detected: ${pattern}`);
      }
    }
    
    return code;
  }

  private sanitizeSVG(content: string): string {
    // Remove script tags from SVG
    return content.replace(/<script[^>]*>.*?<\/script>/gis, '');
  }
}