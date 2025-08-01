'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, File, Image, FileText } from 'lucide-react';
import { Button } from './ui/Button';
import { FileAttachment } from '@/types';
import { generateId, getFileType } from '@/lib/utils';

interface FileUploadProps {
  onFilesAdded: (files: FileAttachment[]) => void;
  onFileRemoved: (fileId: string) => void;
  files: FileAttachment[];
  className?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'application/json',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesAdded,
  onFileRemoved,
  files,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const validFiles: FileAttachment[] = [];
    const uploadingIds: string[] = [];

    Array.from(selectedFiles).forEach(async (file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`File type ${file.type} is not supported`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is too large. Maximum size is 10MB`);
        return;
      }

      const fileId = generateId();
      uploadingIds.push(fileId);

      try {
        const url = URL.createObjectURL(file);
        let content = '';

        // Read file content for text files
        if (file.type.startsWith('text/') || file.type === 'application/json') {
          const text = await file.text();
          content = text;
        }

        const fileAttachment: FileAttachment = {
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          url,
          content
        };

        validFiles.push(fileAttachment);
      } catch (error) {
        console.error('Error processing file:', error);
        alert(`Error processing file ${file.name}`);
      }
    });

    setUploading(uploadingIds);
    
    // Simulate upload delay
    setTimeout(() => {
      onFilesAdded(validFiles);
      setUploading([]);
    }, 1000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const getFileIcon = (file: FileAttachment) => {
    const type = getFileType(file.name);
    
    switch (type) {
      case 'image':
        return <Image size={16} className="text-blue-500" />;
      case 'document':
        return <FileText size={16} className="text-red-500" />;
      case 'code':
        return <File size={16} className="text-green-500" />;
      default:
        return <File size={16} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Drop files here or click to upload
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Supports images, PDFs, text files, and documents (max 10MB)
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          aria-label="File upload input"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              {getFileIcon(file)}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {uploading.includes(file.id) ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileRemoved(file.id);
                    URL.revokeObjectURL(file.url);
                  }}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};