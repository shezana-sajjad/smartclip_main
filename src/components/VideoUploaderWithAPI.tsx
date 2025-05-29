import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Upload, Video, X, Cloud, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { uploadVideo } from '@/services';
import VideoPreview from '@/components/VideoPreview';
import { useCloudinary } from '@/hooks/useCloudinary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

interface VideoUploaderProps {
  onUploadComplete?: (file: File, urls?: string[]) => void;
  uploadToServer?: boolean;
  acceptedFormats?: string;
  minDuration?: number;
  maxDuration?: number;
}

const VideoUploaderWithAPI: React.FC<VideoUploaderProps> = ({
  onUploadComplete,
  uploadToServer = true,
  acceptedFormats = 'video/mp4,video/quicktime,video/webm',
  minDuration = 10,
  maxDuration = 60,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { token, isAuthenticated } = useAuth();
  const { isConfigured: isCloudinaryConfigured } = useCloudinary();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a video file.',
        variant: 'destructive',
      });
      return;
    }

    setFile(file);
    
    if (!uploadToServer) {
      onUploadComplete?.(file);
    }
  };

  const processVideo = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a video file first.',
        variant: 'destructive',
      });
      return;
    }
    
    if (uploadToServer && !isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to process videos.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      if (uploadToServer && token) {
        // Call the uploadVideo function which now stores in Supabase
        const result = await uploadVideo(file, token, {
          min_duration: minDuration,
          max_duration: maxDuration,
          storage_type: 'supabase' // Force using Supabase storage
        });
        
        toast({
          title: 'Video processed successfully',
          description: `Generated ${result.video_urls?.length || 0} clips.`,
        });
        
        onUploadComplete?.(file, result.video_urls || []);
      } else {
        // Just pass the file if we're not uploading to server
        onUploadComplete?.(file);
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload video',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Drag and drop your video here</p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse your files
              </p>
            </div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept={acceptedFormats}
              onChange={handleFileChange}
            />
            <Button size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
              Select file
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Video className="h-5 w-5 text-primary" />
              <span className="font-medium truncate max-w-[200px]">
                {file.name}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={removeFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <VideoPreview file={file} />
          
          {uploadToServer && (
            <Button 
              className="w-full mt-4" 
              onClick={processVideo} 
              disabled={isUploading}
            >
              {isUploading ? 'Processing...' : 'Process Video'}
            </Button>
          )}
        </div>
      )}
      
      {!isAuthenticated && uploadToServer && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication required</AlertTitle>
          <AlertDescription>
            Please <Link to="/login" className="underline">log in</Link> to upload and process videos.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default VideoUploaderWithAPI;
