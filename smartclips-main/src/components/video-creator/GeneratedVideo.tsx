
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Download, Film } from "lucide-react";

interface GeneratedVideoProps {
  video: {
    id: string;
    title: string;
    thumbnail: string;
    url: string;
    duration: string;
  };
  onEdit: () => void;
  onCreateNew: () => void;
}

const GeneratedVideo: React.FC<GeneratedVideoProps> = ({
  video,
  onEdit,
  onCreateNew
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Generated Video</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Video
          </Button>
          <Button 
            variant="outline" 
            onClick={onCreateNew}
          >
            Create New
          </Button>
        </div>
      </div>
      
      <Card>
        <div className="aspect-video bg-black relative">
          <img
            src={video.thumbnail}
            alt="Generated video"
            className="w-full h-full object-cover"
          />
          <Button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full w-16 h-16">
            <Film className="h-6 w-6" />
          </Button>
        </div>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-2">{video.title}</h2>
          <p className="text-sm text-muted-foreground mb-4">Duration: {video.duration}</p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneratedVideo;
