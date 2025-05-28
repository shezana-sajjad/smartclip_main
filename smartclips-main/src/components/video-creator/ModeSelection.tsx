
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { VideoIcon, Film, Edit } from "lucide-react";

interface ModeSelectionProps {
  onModeSelect: (mode: string) => void;
}

const ModeSelection: React.FC<ModeSelectionProps> = ({ onModeSelect }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">What would you like to do?</h1>
      
      <div className="grid md:grid-cols-5 gap-6">
        <Card 
          className="cursor-pointer hover:border-primary transition-colors" 
          onClick={() => onModeSelect("clipper")}
        >
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <VideoIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Smart Clipper</h3>
            <p className="text-sm text-muted-foreground">
              Extract the best parts from your videos
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:border-primary transition-colors" 
          onClick={() => onModeSelect("avatar")}
        >
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <VideoIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Avatar Creator</h3>
            <p className="text-sm text-muted-foreground">
              Create AI avatar videos with scripts
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:border-primary transition-colors" 
          onClick={() => onModeSelect("generator")}
        >
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Film className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Video Generator</h3>
            <p className="text-sm text-muted-foreground">
              Generate videos from your ideas
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:border-primary transition-colors" 
          onClick={() => onModeSelect("editor")}
        >
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Edit className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Video Editor</h3>
            <p className="text-sm text-muted-foreground">
              Trim, merge, and enhance your videos
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:border-primary transition-colors" 
          onClick={() => onModeSelect("library")}
        >
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Film className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">My Library</h3>
            <p className="text-sm text-muted-foreground">
              Access your processed videos
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModeSelection;
