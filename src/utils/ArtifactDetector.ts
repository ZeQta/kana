import type { ArtifactType } from '../types';

export class ArtifactDetector {
  static shouldCreateArtifact(userRequest: string, content: string): boolean {
    const contentAnalysis = {
      lines: content.split('\n').length,
      chars: content.length
    };

    const triggers = {
      longContent: contentAnalysis.lines > 15 || contentAnalysis.chars > 800,
      interactive: /\b(button|click|hover|input|form|game|chart|graph|interactive)\b/i.test(userRequest),
      visual: /\b(visualize|chart|graph|diagram|plot|draw|design|create|build)\b/i.test(userRequest),
      code: /\b(function|class|component|script|program|algorithm|code)\b/i.test(userRequest),
      buildIntent: /\b(build|create|make|develop|design|generate)\b/i.test(userRequest),
      iterativeIntent: /\b(modify|update|change|improve|fix|enhance)\b/i.test(userRequest)
    };

    let score = 0;
    if (triggers.longContent) score += 3;
    if (triggers.interactive) score += 4;
    if (triggers.visual) score += 3;
    if (triggers.code) score += 2;
    if (triggers.buildIntent) score += 2;
    if (triggers.iterativeIntent) score += 1;

    return score >= 4;
  }

  static detectContentType(content: string, userIntent: string): { type: ArtifactType; language?: string } {
    // HTML Detection
    if (/<html|<head|<body|<!DOCTYPE/i.test(content)) {
      return { type: 'text/html' };
    }

    // React Component Detection
    if (/import.*React|export default|JSX\.Element|useState|useEffect|function.*\(\)|const.*=.*=>/i.test(content)) {
      return { type: 'application/vnd.kana.react' };
    }

    // SVG Detection
    if (/<svg|<g |<path |<circle |<rect /i.test(content)) {
      return { type: 'image/svg+xml' };
    }

    // Code Detection with Language
    const codePatterns: Record<string, RegExp> = {
      'python': /def |import |class |if __name__|print\(|\.py$/,
      'javascript': /function |const |let |var |=>|console\./,
      'typescript': /interface |type |enum |as |: string|: number/,
      'css': /\{[^}]*:[^}]*\}|@media|@keyframes/,
      'json': /^\s*[\{\[]/,
      'html': /<[^>]+>/,
      'sql': /SELECT|INSERT|UPDATE|DELETE|FROM|WHERE/i,
      'bash': /#!/bin/bash|echo |ls |cd |mkdir/
    };

    for (const [lang, pattern] of Object.entries(codePatterns)) {
      if (pattern.test(content)) {
        return { type: 'application/vnd.kana.code', language: lang };
      }
    }

    // Markdown Detection
    if (/^#+ |^\* |\*\*|\[.*\]\(|```/m.test(content)) {
      return { type: 'text/markdown' };
    }

    // Default to code if it looks like code
    if (content.includes('{') && content.includes('}') || content.includes('function')) {
      return { type: 'application/vnd.kana.code', language: 'javascript' };
    }

    return { type: 'text/markdown' };
  }
}