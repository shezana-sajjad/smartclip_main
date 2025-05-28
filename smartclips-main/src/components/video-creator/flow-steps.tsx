
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import VideoUploaderWithAPI from "@/components/VideoUploaderWithAPI";
import VideoPreview from "@/components/VideoPreview";
import { Button } from "@/components/ui/button";

// Steps for Video Generator flow
export const getVideoGeneratorSteps = (videoIdea: string, setVideoIdea: React.Dispatch<React.SetStateAction<string>>) => [
  {
    title: "Enter your video idea",
    component: (
      <div className="space-y-4">
        <Textarea
          placeholder="Describe what kind of video you want to generate..."
          className="min-h-[120px]"
          value={videoIdea}
          onChange={(e) => setVideoIdea(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Example: "Create a video explaining how cloud computing works"
        </p>
      </div>
    )
  },
  {
    title: "Choose video settings",
    component: (
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Target audience</p>
          <Select defaultValue="general">
            <SelectTrigger>
              <SelectValue placeholder="Select audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General audience</SelectItem>
              <SelectItem value="professionals">Professionals</SelectItem>
              <SelectItem value="students">Students</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-2">Duration</p>
          <Select defaultValue="medium">
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short (15-30s)</SelectItem>
              <SelectItem value="medium">Medium (30-90s)</SelectItem>
              <SelectItem value="long">Long (2-5 min)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }
];

// Steps for Smart Clipper flow
export const getSmartClipperSteps = (
  uploadedVideo: File | null, 
  setUploadedVideo: React.Dispatch<React.SetStateAction<File | null>>,
  handleVideoUpload: (file: File, urls?: string[]) => void
) => [
  {
    title: "Upload your video",
    component: (
      <div className="space-y-4">
        {!uploadedVideo ? (
          <VideoUploaderWithAPI 
            onUploadComplete={handleVideoUpload} 
            uploadToServer={true} 
            acceptedFormats="video/mp4,video/quicktime,video/webm,video/avi,video/mov"
            minDuration={10}
            maxDuration={60}
          />
        ) : (
          <div className="space-y-4">
            <VideoPreview file={uploadedVideo} />
            <p className="text-sm text-center">Video uploaded successfully!</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setUploadedVideo(null)}
            >
              Upload a different video
            </Button>
          </div>
        )}
      </div>
    )
  },
  {
    title: "Configure clipping",
    component: (
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">What to extract</p>
          <Select defaultValue="interesting">
            <SelectTrigger>
              <SelectValue placeholder="Select what to extract" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="interesting">Interesting moments</SelectItem>
              <SelectItem value="key">Key points</SelectItem>
              <SelectItem value="all">All segments</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Min duration (sec)</p>
            <Input type="number" min={3} defaultValue={10} />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Max duration (sec)</p>
            <Input type="number" min={5} defaultValue={30} />
          </div>
        </div>
        
        {uploadedVideo && (
          <div className="mt-2">
            <VideoPreview file={uploadedVideo} />
          </div>
        )}
      </div>
    )
  }
];

// Steps for Avatar Creator flow
export const getAvatarCreatorSteps = () => [
  {
    title: "Choose your avatar",
    component: (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="aspect-square bg-secondary/30 rounded cursor-pointer hover:border-primary hover:border"
            />
          ))}
        </div>
      </div>
    )
  },
  {
    title: "Write your script",
    component: (
      <div className="space-y-4">
        <Textarea
          placeholder="Write or generate a script for your avatar..."
          className="min-h-[120px]"
        />
        <p className="text-xs text-muted-foreground">
          Keep it concise and clear for the best results
        </p>
      </div>
    )
  }
];
