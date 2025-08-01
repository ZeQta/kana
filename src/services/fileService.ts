import type { UploadedFile } from '../types';
import { analyzeFile } from './aiService';

export class FileService {
  private static instance: FileService;
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private supportedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json',
    'text/markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  async processFile(file: File): Promise<UploadedFile> {
    // Validate file
    this.validateFile(file);

    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      let content: string | undefined;
      let preview: string | undefined;
      let url: string | undefined;

      if (file.type.startsWith('image/')) {
        // Handle images
        const imageUrl = await this.createImageUrl(file);
        url = imageUrl;
        preview = imageUrl;
      } else if (file.type === 'application/pdf') {
        // Handle PDFs
        content = await this.extractPdfText(file);
        preview = await this.createPdfPreview(file);
      } else if (file.type.startsWith('text/') || file.type === 'application/json') {
        // Handle text files
        content = await this.readTextFile(file);
      } else {
        // For other file types, try to extract text if possible
        try {
          content = await this.readTextFile(file);
        } catch (error) {
          console.warn('Could not extract text from file:', file.name);
        }
      }

      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        url,
        content,
        preview,
        uploadedAt: Date.now()
      };

      return uploadedFile;
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error(`Failed to process file: ${file.name}`);
    }
  }

  private validateFile(file: File): void {
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    if (!this.supportedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported`);
    }
  }

  private async createImageUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private async extractPdfText(file: File): Promise<string> {
    // This would require a PDF.js implementation
    // For now, return a placeholder
    return `PDF file: ${file.name}\n\n[PDF content extraction not implemented in this version]`;
  }

  private async createPdfPreview(file: File): Promise<string> {
    // This would require PDF.js to create a preview
    // For now, return a placeholder
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f0f0f0"/>
        <text x="100" y="100" text-anchor="middle" fill="#666">PDF</text>
        <text x="100" y="120" text-anchor="middle" fill="#999" font-size="12">${file.name}</text>
      </svg>
    `)}`;
  }

  async analyzeFileContent(file: UploadedFile): Promise<string> {
    try {
      // Convert UploadedFile back to File for analysis
      const fileBlob = await this.uploadedFileToBlob(file);
      const fileForAnalysis = new File([fileBlob], file.name, { type: file.type });
      
      return await analyzeFile(fileForAnalysis);
    } catch (error) {
      console.error('Error analyzing file content:', error);
      return `Analysis failed for ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private async uploadedFileToBlob(file: UploadedFile): Promise<Blob> {
    if (file.url && file.url.startsWith('data:')) {
      const response = await fetch(file.url);
      return await response.blob();
    } else if (file.content) {
      return new Blob([file.content], { type: file.type });
    } else {
      throw new Error('No content available for file');
    }
  }

  getSupportedFileTypes(): string[] {
    return this.supportedTypes;
  }

  getMaxFileSize(): number {
    return this.maxFileSize;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.startsWith('text/')) return '📝';
    if (fileType === 'application/json') return '📋';
    if (fileType.includes('wordprocessingml')) return '📄';
    if (fileType.includes('spreadsheetml')) return '📊';
    return '📎';
  }
}

export const fileService = FileService.getInstance();