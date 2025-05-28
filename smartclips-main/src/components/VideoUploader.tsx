
import React, { useState } from 'react';
import { UploadCloud, X, FileVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface VideoUploaderProps {
  onUploadComplete: (file: File, cloudinaryUrls?: string[]) => void;
  acceptedFormats?: string;
  uploadToServer?: boolean;
  maxSizeMB?: number;
  apiEndpoint?: string;
  title?: string;
  description?: string;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ 
  onUploadComplete,
  acceptedFormats = "video/mp4,video/quicktime,video/webm,video/avi,video/mov",
  uploadToServer = false,
  maxSizeMB = 500,
  apiEndpoint = "https://quikclips-server.onrender.com/upload",
  title = "Upload Video",
  description = "Drag and drop or click to upload"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file",
        variant: "destructive"
      });
      return;
    }

    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSizeMB}MB`,
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    
    if (uploadToServer) {
      uploadFileToServer(file);
    } else {
      simulateUpload(file);
    }
  };

  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            onUploadComplete(file);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const uploadFileToServer = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', apiEndpoint, true);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setIsUploading(false);
          
          toast({
            title: "Upload successful",
            description: `${response.video_urls.length} clips were generated`,
          });
          
          onUploadComplete(file, response.video_urls);
        } else {
          throw new Error('Upload failed');
        }
      };
      
      xhr.onerror = () => {
        throw new Error('Network error');
      };
      
      xhr.send(formData);
    } catch (error) {
      setIsUploading(false);
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleCancelUpload = () => {
    setIsUploading(false);
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-border'
      } ${isUploading ? 'bg-secondary/20' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={acceptedFormats}
        onChange={handleFileSelect}
      />
      
      {!isUploading && !selectedFile ? (
        <div className="flex flex-col items-center justify-center py-8">
          <UploadCloud className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            {description}
          </p>
          <Button onClick={triggerFileInput}>
            Select Video
          </Button>
        </div>
      ) : (
        <div className="py-4">
          <div className="flex items-center mb-4">
            <FileVideo className="h-8 w-8 text-primary mr-3" />
            <div className="flex-1">
              <p className="font-medium truncate">{selectedFile?.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile?.size ? (selectedFile.size / (1024 * 1024)).toFixed(2) : '0')} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancelUpload}
              disabled={uploadProgress === 100}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-sm text-right text-muted-foreground">
              {uploadProgress.toFixed(0)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
