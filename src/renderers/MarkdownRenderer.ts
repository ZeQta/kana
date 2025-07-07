import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createRoot } from 'react-dom/client';
import React from 'react';

export class MarkdownRenderer {
  async render(content: string, containerId: string, options: any = {}): Promise<any> {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    // Clear existing content
    container.innerHTML = '';

    const MarkdownContent = React.createElement(ReactMarkdown, {
      remarkPlugins: [remarkGfm],
      className: 'prose prose-slate max-w-none dark:prose-invert p-4'
    }, content);

    const root = createRoot(container);
    root.render(MarkdownContent);

    return { root };
  }
}