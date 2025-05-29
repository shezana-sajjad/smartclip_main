
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PaperclipIcon, SendIcon } from "lucide-react";

interface AIPromptInterfaceProps {
  placeholder?: string;
  onSubmit: (prompt: string) => void;
  onUploadClick?: () => void;
  suggestions?: string[];
  includeUploadButton?: boolean;
}

const AIPromptInterface: React.FC<AIPromptInterfaceProps> = ({
  placeholder = "Describe what you want to do...",
  onSubmit = () => {},
  onUploadClick,
  suggestions = [],
  includeUploadButton = true,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsSubmitting(true);
    // Simulate processing
    setTimeout(() => {
      onSubmit(prompt);
      setIsSubmitting(false);
      setPrompt("");
    }, 800);
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          placeholder={placeholder}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="pr-24 resize-none min-h-[100px] text-base"
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          {includeUploadButton && onUploadClick && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onUploadClick}
              title="Upload content"
            >
              <PaperclipIcon className="h-5 w-5" />
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !prompt.trim()}
            className="bg-gradient-purple-blue hover:opacity-90"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                Processing
                <span className="animate-pulse-opacity">...</span>
              </span>
            ) : (
              <>
                <SendIcon className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
      </form>

      {suggestions.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {suggestions.map((suggestion, index) => (
            <SuggestionChip
              key={index}
              text={suggestion}
              onClick={() => setPrompt(suggestion)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Suggestion Chip Component
const SuggestionChip = ({ 
  text, 
  onClick 
}: { 
  text: string; 
  onClick: () => void 
}) => {
  return (
    <button
      type="button"
      className="text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-full transition-colors"
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default AIPromptInterface;
