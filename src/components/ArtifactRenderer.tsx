import React, { useEffect, useRef, useState } from 'react';
import { Play, Code, Eye, AlertCircle, Maximize2, Minimize2, Palette, Zap } from 'lucide-react';
import type { Artifact } from '../types';
import { artifactManager } from '../services/ArtifactManager';

interface ArtifactRendererProps {
  artifact: Artifact;
  onUpdate?: (artifact: Artifact) => void;
}

export function ArtifactRenderer({ artifact, onUpdate }: ArtifactRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const containerId = `artifact-${artifact.id}`;

  useEffect(() => {
    if (containerRef.current && !isRendered) {
      renderArtifact();
    }
  }, [artifact, isRendered]);

  const renderArtifact = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const result = await artifactManager.renderArtifact(artifact.id, containerId);
      
      if (result.success) {
        setIsRendered(true);
      } else {
        setError(result.error || 'Failed to render artifact');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = () => {
    switch (artifact.type) {
      case 'text/html':
        return <Eye size={16} className="text-blue-400" />;
      case 'application/vnd.kana.react':
        return <Play size={16} className="text-cyan-400" />;
      case 'application/vnd.kana.code':
        return <Code size={16} className="text-green-400" />;
      default:
        return <Zap size={16} className="text-yellow-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (artifact.type) {
      case 'text/html':
        return 'HTML';
      case 'application/vnd.kana.react':
        return 'React';
      case 'application/vnd.kana.code':
        return artifact.metadata.language?.toUpperCase() || 'Code';
      case 'image/svg+xml':
        return 'SVG';
      case 'text/markdown':
        return 'Markdown';
      default:
        return 'Artifact';
    }
  };

  return (
    <div className={`artifact-container ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'my-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-xl px-6 py-4 rounded-t-2xl border border-gray-700/50 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center shadow-lg border border-gray-600/50">
            {getTypeIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">
              {artifact.metadata.title}
            </h3>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-400">
                {getTypeLabel()} • v{artifact.metadata.version}
              </p>
              {artifact.metadata.language && (
                <span className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full border border-gray-600/30">
                  {artifact.metadata.language}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {artifact.type !== 'application/vnd.kana.code' && (
            <button
              onClick={() => setShowCode(!showCode)}
              className="p-3 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group border border-gray-600/30 hover:border-gray-500/50"
              title="Toggle code view"
            >
              <Code size={16} className="text-gray-400 group-hover:text-white transition-colors" />
            </button>
          )}
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-3 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group border border-gray-600/30 hover:border-gray-500/50"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 size={16} className="text-gray-400 group-hover:text-white transition-colors" />
            ) : (
              <Maximize2 size={16} className="text-gray-400 group-hover:text-white transition-colors" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="border-x border-b border-gray-700/50 rounded-b-2xl overflow-hidden bg-gray-900/50 backdrop-blur-xl shadow-2xl">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Rendering artifact...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-b-2xl">
            <div className="flex items-center gap-3 text-red-300">
              <AlertCircle size={20} />
              <div>
                <h4 className="font-semibold">Rendering Error</h4>
                <p className="text-sm mt-1 text-red-400">{error}</p>
              </div>
            </div>
            <button
              onClick={renderArtifact}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className={`${isFullscreen ? 'h-screen' : ''}`}>
            {showCode && artifact.type !== 'application/vnd.kana.code' ? (
              <div className="p-6 bg-gray-900 text-gray-100 overflow-auto max-h-96">
                <pre className="text-sm leading-relaxed">
                  <code className="language-javascript">{artifact.content}</code>
                </pre>
              </div>
            ) : (
              <div
                ref={containerRef}
                id={containerId}
                className={`artifact-content ${isFullscreen ? 'h-full' : 'min-h-[400px]'} bg-white rounded-b-2xl`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}