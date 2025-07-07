import type { Artifact, ArtifactType, ArtifactMetadata, ArtifactRenderState } from '../types';
import { HTMLRenderer } from '../renderers/HTMLRenderer';
import { ReactRenderer } from '../renderers/ReactRenderer';
import { CodeRenderer } from '../renderers/CodeRenderer';
import { SVGRenderer } from '../renderers/SVGRenderer';
import { MarkdownRenderer } from '../renderers/MarkdownRenderer';
import { ContentSanitizer } from '../utils/ContentSanitizer';
import { LibraryLoader } from '../utils/LibraryLoader';

export class ArtifactManager {
  private artifacts = new Map<string, Artifact>();
  private renderers = new Map<ArtifactType, any>();
  private sanitizer = new ContentSanitizer();
  private libraryLoader = new LibraryLoader();
  private eventBus = new EventTarget();

  constructor() {
    this.initializeRenderers();
  }

  private initializeRenderers() {
    this.renderers.set('text/html', new HTMLRenderer());
    this.renderers.set('application/vnd.kana.react', new ReactRenderer());
    this.renderers.set('application/vnd.kana.code', new CodeRenderer());
    this.renderers.set('image/svg+xml', new SVGRenderer());
    this.renderers.set('text/markdown', new MarkdownRenderer());
  }

  async createArtifact(
    id: string,
    type: ArtifactType,
    content: string,
    metadata: Partial<ArtifactMetadata> = {}
  ): Promise<{ success: boolean; artifact?: Artifact; error?: string }> {
    try {
      // Detect language for code artifacts
      let detectedLanguage = metadata.language;
      if (type === 'application/vnd.kana.code' && !detectedLanguage) {
        detectedLanguage = this.detectLanguage(content);
      }

      // Sanitize content based on type
      const sanitizedContent = await this.sanitizer.sanitize(content, type);
      
      // Create artifact
      const artifact: Artifact = {
        id,
        type,
        content: sanitizedContent,
        metadata: {
          title: metadata.title || `Artifact ${id}`,
          description: metadata.description,
          language: detectedLanguage,
          libraries: metadata.libraries || [],
          created: Date.now(),
          lastModified: Date.now(),
          version: 1,
          ...metadata
        },
        history: [{
          version: 1,
          content: sanitizedContent,
          timestamp: Date.now(),
          changeType: 'create'
        }]
      };

      this.artifacts.set(id, artifact);
      
      // Emit creation event
      this.eventBus.dispatchEvent(new CustomEvent('artifactCreated', { 
        detail: { artifact } 
      }));

      return { success: true, artifact };
    } catch (error) {
      console.error('Error creating artifact:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private detectLanguage(content: string): string {
    const patterns: Record<string, RegExp> = {
      'javascript': /(?:function|const|let|var|=>|console\.|document\.|window\.)/,
      'typescript': /(?:interface|type|enum|as\s+\w+|:\s*(?:string|number|boolean))/,
      'python': /(?:def\s+\w+|import\s+\w+|from\s+\w+|print\(|if\s+__name__)/,
      'java': /(?:public\s+class|private\s+\w+|System\.out\.println)/,
      'cpp': /(?:#include|using\s+namespace|std::|cout\s*<<)/,
      'html': /<(?:html|head|body|div|span|p|h[1-6])\b/,
      'css': /(?:\{[^}]*:[^}]*\}|@media|@keyframes|\.[\w-]+\s*\{)/,
      'json': /^\s*[\{\[]/,
      'sql': /(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN)\s+/i,
      'bash': /(?:#!\/bin\/bash|echo\s+|ls\s+|cd\s+|mkdir\s+)/,
      'php': /<\?php|function\s+\w+\(|\$\w+\s*=/,
      'ruby': /(?:def\s+\w+|class\s+\w+|puts\s+|require\s+)/,
      'go': /(?:package\s+\w+|func\s+\w+|import\s+\(|fmt\.Print)/,
      'rust': /(?:fn\s+\w+|let\s+mut|use\s+std::|println!)/,
      'swift': /(?:func\s+\w+|var\s+\w+|let\s+\w+|import\s+\w+)/,
      'kotlin': /(?:fun\s+\w+|val\s+\w+|var\s+\w+|class\s+\w+)/
    };

    for (const [language, pattern] of Object.entries(patterns)) {
      if (pattern.test(content)) {
        return language;
      }
    }

    return 'text';
  }

  async updateArtifact(
    id: string,
    newContent: string,
    changeType: 'update' | 'rewrite' = 'update'
  ): Promise<{ success: boolean; artifact?: Artifact; error?: string }> {
    try {
      const artifact = this.artifacts.get(id);
      if (!artifact) {
        return { success: false, error: 'Artifact not found' };
      }

      // Sanitize new content
      const sanitizedContent = await this.sanitizer.sanitize(newContent, artifact.type);
      
      // Update artifact
      const updatedArtifact: Artifact = {
        ...artifact,
        content: sanitizedContent,
        metadata: {
          ...artifact.metadata,
          lastModified: Date.now(),
          version: artifact.metadata.version + 1
        },
        history: [
          ...(artifact.history || []),
          {
            version: artifact.metadata.version + 1,
            content: sanitizedContent,
            timestamp: Date.now(),
            changeType
          }
        ]
      };

      this.artifacts.set(id, updatedArtifact);

      // Re-render if currently rendered
      if (artifact.renderState?.status === 'ready') {
        await this.renderArtifact(id, artifact.renderState.containerId);
      }

      // Emit update event
      this.eventBus.dispatchEvent(new CustomEvent('artifactUpdated', { 
        detail: { artifact: updatedArtifact, changeType } 
      }));

      return { success: true, artifact: updatedArtifact };
    } catch (error) {
      console.error('Error updating artifact:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async renderArtifact(id: string, containerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const artifact = this.artifacts.get(id);
      if (!artifact) {
        return { success: false, error: 'Artifact not found' };
      }

      const renderer = this.renderers.get(artifact.type);
      if (!renderer) {
        return { success: false, error: `No renderer available for type ${artifact.type}` };
      }

      // Update render state
      artifact.renderState = {
        containerId,
        status: 'rendering'
      };

      // Load required libraries
      if (artifact.metadata.libraries && artifact.metadata.libraries.length > 0) {
        await Promise.all(
          artifact.metadata.libraries.map(lib => this.libraryLoader.loadLibrary(lib))
        );
      }

      // Render artifact
      const rendererInstance = await renderer.render(
        artifact.content,
        containerId,
        {
          libraries: artifact.metadata.libraries,
          language: artifact.metadata.language
        }
      );

      // Update render state
      artifact.renderState = {
        containerId,
        status: 'ready',
        rendererInstance
      };

      // Emit render event
      this.eventBus.dispatchEvent(new CustomEvent('artifactRendered', { 
        detail: { artifact } 
      }));

      return { success: true };
    } catch (error) {
      console.error('Error rendering artifact:', error);
      
      // Update render state with error
      const artifact = this.artifacts.get(id);
      if (artifact) {
        artifact.renderState = {
          containerId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  getArtifact(id: string): Artifact | undefined {
    return this.artifacts.get(id);
  }

  getAllArtifacts(): Artifact[] {
    return Array.from(this.artifacts.values());
  }

  // Artifacts are never deleted, only archived
  archiveArtifact(id: string): boolean {
    const artifact = this.artifacts.get(id);
    if (!artifact) return false;

    artifact.metadata.archived = true;
    artifact.metadata.lastModified = Date.now();

    this.eventBus.dispatchEvent(new CustomEvent('artifactArchived', { 
      detail: { artifactId: id } 
    }));

    return true;
  }

  addEventListener(type: string, listener: EventListener) {
    this.eventBus.addEventListener(type, listener);
  }

  removeEventListener(type: string, listener: EventListener) {
    this.eventBus.removeEventListener(type, listener);
  }
}

// Global artifact manager instance
export const artifactManager = new ArtifactManager();