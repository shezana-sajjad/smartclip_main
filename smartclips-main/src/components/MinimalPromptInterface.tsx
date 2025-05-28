
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, UploadIcon, Image } from "lucide-react";

interface MinimalPromptInterfaceProps {
  placeholder?: string;
  onSubmit: (prompt: string) => void;
  onVideoUpload?: (file: File) => void;
  onImageSelect?: () => void;
  suggestions?: string[];
  className?: string;
  disabled?: boolean;
  title?: string;
  description?: string;
}

const MinimalPromptInterface: React.FC<MinimalPromptInterfaceProps> = ({
  placeholder = "Describe what you want to do...",
  onSubmit,
  onVideoUpload,
  onImageSelect,
  suggestions = [],
  className = "",
  disabled = false,
  title,
  description
}) => {
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || disabled) return;

    setIsSubmitting(true);
    onSubmit(prompt);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onVideoUpload && !disabled) {
      onVideoUpload(file);
    }
  };

  const handleUploadClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (disabled) return;
    setPrompt(suggestion);
  };

  return (
    <div className={`w-full ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          placeholder={placeholder}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="resize-none min-h-[120px] pr-20 text-base bg-background border border-input focus-visible:ring-1 rounded-xl"
          disabled={disabled}
        />
        
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {onVideoUpload && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handleUploadClick}
              className="h-8 w-8"
              disabled={disabled}
            >
              <UploadIcon className="h-4 w-4" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                className="hidden"
                disabled={disabled}
              />
            </Button>
          )}
          
          {onImageSelect && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onImageSelect}
              className="h-8 w-8"
              disabled={disabled}
            >
              <Image className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !prompt.trim() || disabled}
            className="rounded-lg px-3 h-8"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="w-4 h-4 border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></span>
              </span>
            ) : (
              <SendIcon className="h-3 w-3" />
            )}
          </Button>
        </div>
      </form>

      {suggestions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="text-xs px-3 py-1.5 bg-secondary/50 hover:bg-secondary/80 rounded-full transition-colors disabled:opacity-50"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={disabled}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MinimalPromptInterface;
