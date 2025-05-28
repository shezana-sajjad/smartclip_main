
import React from "react";
import { Share2, Download, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoThumbnail {
  id: string;
  url: string;
  title: string;
  duration: string;
}

interface VideoGalleryProps {
  videos: VideoThumbnail[];
  onShare?: (id: string) => void;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({
  videos,
  onShare,
  onDownload,
  onDelete,
  onSelect
}) => {
  if (videos.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No videos available yet</p>
      </div>
    );
  }

  const isVideoUrl = (url: string) => {
    return url.includes('cloudinary.com') || url.includes('.mp4') || url.includes('.mov') || url.includes('.webm');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <div 
          key={video.id} 
          className="bg-card border rounded-lg overflow-hidden hover:shadow-md transition-all"
        >
          <div 
            className="aspect-video bg-background cursor-pointer relative"
            onClick={() => onSelect && onSelect(video.id)}
          >
            {isVideoUrl(video.url) ? (
              <div className="relative w-full h-full">
                <video 
                  src={video.url} 
                  className="w-full h-full object-cover" 
                  controls={false}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 transition-colors">
                  <Play className="h-12 w-12 text-white opacity-80" />
                </div>
              </div>
            ) : (
              <img 
                src={video.url} 
                alt={video.title} 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              {video.duration}
            </div>
          </div>
          
          <div className="p-3">
            <h3 className="font-medium truncate">{video.title}</h3>
            
            <div className="flex justify-end mt-2 gap-1">
              {onShare && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onShare(video.id)}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              )}
              
              {onDownload && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onDownload(video.id)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              )}
              
              {onDelete && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(video.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGallery;
