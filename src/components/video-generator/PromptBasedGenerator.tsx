import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader, ArrowRight, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PromptBasedGeneratorProps {
  onGenerateComplete: (videoUrl: string) => void;
}

const PromptBasedGenerator: React.FC<PromptBasedGeneratorProps> = ({
  onGenerateComplete,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a description for your video",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Make the API call to your FastAPI endpoint
      const response = await fetch(
        "https://smartclips.onrender.com/generate-from-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate video: ${response.statusText}`);
      }

      const data = await response.json();

      // Pass the video URL back to the parent component
      onGenerateComplete(data.video_url);

      toast({
        title: "Video generated successfully",
        description: "Your video is ready to watch",
      });
    } catch (error) {
      console.error("Error generating video:", error);
      toast({
        title: "Failed to generate video",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Generate with a Simple Prompt
          </h2>
          <p className="text-muted-foreground">
            Describe the video you want, and our AI will handle the rest -
            script, visuals, and audio.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-lg">
              What video would you like to create?
            </Label>
            <Textarea
              id="prompt"
              placeholder="e.g., Create a promotional video for a new smartphone with sleek design and advanced features"
              className="min-h-[180px] text-base"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Be specific about content, style, tone, and target audience for
              best results
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PromptBasedGenerator;
