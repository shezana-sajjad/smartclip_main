
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Film, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { VideoData } from "@/services/videoProcessingService";

interface VideoLibraryProps {
  videos: VideoData[];
  isLoading: boolean;
  onBack: () => void;
  onChangeMode: (mode: string) => void;
  onEdit: (videoUrl: string) => void;
  onDelete: (videoId: string | number) => void;
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({
  videos,
  isLoading,
  onBack,
  onChangeMode,
  onEdit,
  onDelete
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Video Library</h1>
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          Create New
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-10 h-10 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No videos yet</h3>
          <p className="text-muted-foreground mb-6">
            Upload your first video to get started
          </p>
          <Button onClick={() => onChangeMode("clipper")}>
            Upload Video
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(video => (
            <Card key={video.id} className="overflow-hidden">
              {video.clips && video.clips.length > 0 ? (
                <div className="aspect-video bg-black">
                  <video 
                    src={video.clips[0].url}
                    className="w-full h-full object-cover"
                    poster="/placeholder.svg"
                  />
                </div>
              ) : video.original_url ? (
                <div className="aspect-video bg-black">
                  <video 
                    src={video.original_url}
                    className="w-full h-full object-cover"
                    poster="/placeholder.svg"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-secondary flex items-center justify-center">
                  <Film className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="font-medium truncate mb-1">{video.filename}</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Duration: {Math.round(video.duration || 0)}s • Clips: {video.clips?.length || 0}
                </p>
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (video.clips && video.clips.length > 0) {
                        onEdit(video.clips[0].url);
                      } else if (video.original_url) {
                        onEdit(video.original_url);
                      }
                    }}
                    disabled={!video.clips?.length && !video.original_url}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDelete(video.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                  
                  {video.original_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(video.original_url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoLibrary;
