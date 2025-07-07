import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { createRoot } from 'react-dom/client';
import React from 'react';

export class CodeRenderer {
  async render(content: string, containerId: string, options: any = {}): Promise<any> {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    // Clear existing content
    container.innerHTML = '';

    const CodeBlock = React.createElement(() => {
      const [copied, setCopied] = React.useState(false);

      const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      };

      return React.createElement('div', { className: 'relative group' },
        React.createElement('div', { 
          className: 'flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg' 
        },
          React.createElement('span', { 
            className: 'text-gray-300 text-sm font-medium' 
          }, options.language || 'code'),
          React.createElement('button', {
            onClick: handleCopy,
            className: 'flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-gray-300 hover:text-white'
          },
            React.createElement('span', { className: 'text-sm' }, copied ? 'Copied!' : 'Copy')
          )
        ),
        React.createElement(SyntaxHighlighter, {
          language: options.language || 'javascript',
          style: oneDark,
          customStyle: {
            margin: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            fontSize: '14px',
            lineHeight: '1.5'
          }
        }, content)
      );
    });

    const root = createRoot(container);
    root.render(CodeBlock);

    return { root };
  }
}