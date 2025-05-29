
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Upload, X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { mockTranscribeAudio } from "@/services/transcriptionService";

interface AudioTranscriberProps {
  onTranscriptionComplete: (text: string) => void;
}

const AudioTranscriber: React.FC<AudioTranscriberProps> = ({ 
  onTranscriptionComplete 
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.addEventListener('dataavailable', (e) => {
        chunksRef.current.push(e.data);
      });

      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], "recording.webm", { type: 'audio/webm' });
        setAudioFile(file);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Access Error",
        description: "Could not access your microphone. Please ensure you've granted permission.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setAudioFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const transcribeAudio = async () => {
    if (!audioFile) return;
    
    setIsProcessing(true);
    
    try {
      // Use mock service for development, in production would use actual API
      const result = await mockTranscribeAudio(audioFile);
      
      if (result.status === 'success') {
        setTranscription(result.text);
        onTranscriptionComplete(result.text);
        toast({
          title: "Transcription Complete",
          description: "Your audio has been successfully transcribed.",
        });
      } else {
        toast({
          title: "Transcription Failed",
          description: result.message || "An error occurred during transcription.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Transcription error:", error);
      toast({
        title: "Transcription Error",
        description: error instanceof Error ? error.message : "Failed to transcribe audio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranscriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscription(e.target.value);
  };

  const handleUseTranscription = () => {
    onTranscriptionComplete(transcription);
  };

  return (
    <Card className="bg-card/40 backdrop-blur-md border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Audio Transcription</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-4">
          {!audioFile ? (
            <div className="flex space-x-2">
              <Button 
                variant={isRecording ? "destructive" : "secondary"} 
                onClick={isRecording ? stopRecording : startRecording}
                className="flex-1"
              >
                <Mic className="h-4 w-4 mr-2" />
                {isRecording ? "Stop Recording" : "Record Audio"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleUploadClick}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Audio
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="audio/*"
                  className="hidden"
                />
              </Button>
            </div>
          ) : (
            <div className="bg-secondary/30 rounded-md p-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <Mic className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm truncate max-w-[180px] sm:max-w-full">
                  {audioFile.name}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearFile} 
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {audioFile && !isProcessing && !transcription && (
            <Button onClick={transcribeAudio}>
              Transcribe Audio
            </Button>
          )}

          {isProcessing && (
            <div className="flex justify-center py-8">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Transcribing audio...</p>
              </div>
            </div>
          )}

          {transcription && (
            <div className="space-y-3">
              <Textarea
                value={transcription}
                onChange={handleTranscriptionChange}
                className="min-h-[120px] bg-background/50"
                placeholder="Transcription will appear here..."
              />
              
              <Button 
                onClick={handleUseTranscription} 
                variant="secondary" 
                className="w-full"
              >
                Use as Script
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioTranscriber;
