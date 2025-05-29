
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import VideoGallery from "@/components/VideoGallery";

interface VideoClip {
  id: string;
  url: string;
  title: string;
  duration: string;
}

interface GeneratedClipsProps {
  clips: VideoClip[];
  onEdit: () => void;
  onCreateNew: () => void;
  onShare: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

const GeneratedClips: React.FC<GeneratedClipsProps> = ({
  clips,
  onEdit,
  onCreateNew,
  onShare,
  onDownload,
  onDelete
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Generated Clips</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Clips
          </Button>
          <Button 
            variant="outline" 
            onClick={onCreateNew}
          >
            Create New
          </Button>
        </div>
      </div>
      
      <VideoGallery 
        videos={clips} 
        onShare={onShare}
        onDownload={onDownload}
        onDelete={onDelete}
      />
    </div>
  );
};

export default GeneratedClips;
