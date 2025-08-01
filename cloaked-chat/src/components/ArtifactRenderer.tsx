'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Artifact } from '@/types';
import { Button } from './ui/Button';
import { Copy, Check, Maximize2, Minimize2, Download, Play, RefreshCw } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ArtifactRendererProps {
  artifact: Artifact;
  className?: string;
}

const PythonRunner: React.FC<{ code: string }> = ({ code }) => {
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const runPython = async () => {
    setIsRunning(true);
    setOutput('Running Python code...\n');
    
    try {
      // Note: This is a mock implementation
      // In a real app, you'd need a Python execution environment
      setTimeout(() => {
        setOutput('Python execution not available in browser environment.\nTo run this code:\n1. Copy the code\n2. Save as a .py file\n3. Run with: python filename.py');
        setIsRunning(false);
      }, 1000);
    } catch (error) {
      setOutput(`Error: ${error}`);
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button onClick={runPython} disabled={isRunning} size="sm">
          {isRunning ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
          {isRunning ? 'Running...' : 'Run Code'}
        </Button>
      </div>
      
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{code}</code>
      </pre>
      
      {output && (
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
          <div className="text-gray-400 mb-2">Output:</div>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
};

const HTMLRenderer: React.FC<{ content: string }> = ({ content }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(content);
        doc.close();
      }
    }
  }, [content]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-96 border border-gray-300 rounded-lg bg-white"
      sandbox="allow-scripts allow-same-origin"
      title="HTML Preview"
    />
  );
};

const ReactRenderer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
          <strong>React Component:</strong> This code can be used in a React application. 
          Copy the code and save it as a .jsx or .tsx file.
        </p>
      </div>
      
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{content}</code>
      </pre>
    </div>
  );
};

export const ArtifactRenderer: React.FC<ArtifactRendererProps> = ({ 
  artifact, 
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions = {
      html: '.html',
      react: '.jsx',
      python: '.py',
      javascript: '.js',
      markdown: '.md',
      css: '.css',
      json: '.json'
    };

    const extension = extensions[artifact.type] || '.txt';
    const filename = `${artifact.name.replace(/\s+/g, '_')}${extension}`;
    
    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    switch (artifact.type) {
      case 'html':
        return <HTMLRenderer content={artifact.content} />;
      case 'react':
        return <ReactRenderer content={artifact.content} />;
      case 'python':
        return <PythonRunner code={artifact.content} />;
      case 'markdown':
        return <MarkdownRenderer content={artifact.content} />;
      case 'javascript':
      case 'css':
      case 'json':
      default:
        return (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{artifact.content}</code>
          </pre>
        );
    }
  };

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {artifact.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {artifact.type.charAt(0).toUpperCase() + artifact.type.slice(1)}
              {artifact.description && ` • ${artifact.description}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-8 w-8 p-0"
          >
            <Download size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 ${isExpanded ? 'min-h-96' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
};