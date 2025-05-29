
import os
import tempfile
import logging
from typing import List, Dict, Any, Tuple
import speech_recognition as sr
from moviepy.editor import VideoFileClip, concatenate_videoclips, AudioFileClip
import openai

logger = logging.getLogger(__name__)

def transcribe_video(video_path: str, temp_dir: str) -> Tuple[str, List[Dict[str, float]]]:
    """Transcribe video and return transcript with timestamps"""
    try:
        # Extract audio from video
        video = VideoFileClip(video_path)
        audio_path = os.path.join(temp_dir, "audio_extract.wav")
        video.audio.write_audiofile(audio_path, codec='pcm_s16le')
        
        # Initialize recognizer
        r = sr.Recognizer()
        
        # Transcribe audio using Google Speech Recognition
        transcript = ""
        timestamps = []
        
        with sr.AudioFile(audio_path) as source:
            audio = r.record(source)
            # Using Google Speech Recognition
            try:
                result = r.recognize_google(audio, show_all=True)
                if result and 'alternative' in result:
                    transcript = result['alternative'][0]['transcript']
                    
                    # Simulate timestamps (in a real app, use a service that provides proper timestamps)
                    words = transcript.split()
                    total_duration = video.duration
                    time_per_word = total_duration / len(words) if words else 0
                    
                    current_time = 0
                    for word in words:
                        timestamps.append({
                            "word": word,
                            "start": current_time,
                            "end": current_time + time_per_word
                        })
                        current_time += time_per_word
            except sr.UnknownValueError:
                logger.error("Google Speech Recognition could not understand audio")
            except sr.RequestError as e:
                logger.error(f"Could not request results from Google Speech Recognition service; {e}")
        
        # Clean up
        os.remove(audio_path)
        video.close()
        
        return transcript, timestamps
    except Exception as e:
        logger.error(f"Error in transcribe_video: {str(e)}")
        raise

def segment_transcript(
    transcript: str, 
    timestamps: List[Dict[str, float]], 
    min_duration: float = 10.0, 
    max_duration: float = 60.0,
    refine_with_ai: bool = False
) -> List[Dict[str, Any]]:
    """Segment transcript into coherent parts"""
    try:
        if not transcript or not timestamps:
            return []
        
        # Basic segmentation by sentences/periods
        segments = []
        current_segment = {
            "text": "",
            "start": timestamps[0]["start"] if timestamps else 0,
            "end": 0
        }
        
        # Group words into segments based on punctuation
        for i, ts in enumerate(timestamps):
            word = ts["word"]
            current_segment["text"] += " " + word
            current_segment["end"] = ts["end"]
            
            # Check if this is the end of a segment (period, question mark, exclamation)
            if word.endswith(('.', '?', '!')) or i == len(timestamps) - 1:
                # Only add if segment is long enough
                segment_duration = current_segment["end"] - current_segment["start"]
                if segment_duration >= min_duration:
                    # If segment is too long, split it
                    if segment_duration > max_duration:
                        # Simple split based on duration
                        num_parts = int(segment_duration / max_duration) + 1
                        part_duration = segment_duration / num_parts
                        
                        for j in range(num_parts):
                            part_start = current_segment["start"] + (j * part_duration)
                            part_end = min(part_start + part_duration, current_segment["end"])
                            segments.append({
                                "text": current_segment["text"],  # Duplicate text for simplicity
                                "start": part_start,
                                "end": part_end
                            })
                    else:
                        segments.append(current_segment)
                
                # Start a new segment
                if i < len(timestamps) - 1:
                    current_segment = {
                        "text": "",
                        "start": ts["end"],
                        "end": 0
                    }
        
        # If enabled and OpenAI API key is available, refine segments with AI
        if refine_with_ai and os.getenv("OPENAI_API_KEY"):
            try:
                openai.api_key = os.getenv("OPENAI_API_KEY")
                
                # Prepare the transcript for AI processing
                prompt = (
                    "The following is a video transcript. Please identify the most interesting "
                    "and coherent segments that would make good standalone clips:\n\n"
                    f"{transcript}\n\n"
                    "For each segment, provide the start and end sentences that mark the boundaries "
                    "of an interesting clip. List 3-5 segments in order of appearance."
                )
                
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a video editor assistant that identifies the most interesting parts of a transcript."},
                        {"role": "user", "content": prompt}
                    ]
                )
                
                # Process AI response (simplified)
                ai_suggestions = response.choices[0].message.content
                logger.info(f"AI suggestions: {ai_suggestions}")
                
                # In a real implementation, parse the AI response and match with timestamps
                # For this example, we'll simply keep our time-based segments
            except Exception as e:
                logger.error(f"Error refining with AI: {str(e)}")
                # Continue with the basic segments if AI refinement fails
        
        return segments
    except Exception as e:
        logger.error(f"Error in segment_transcript: {str(e)}")
        raise

def clip_video_from_text(
    video_path: str, 
    segments: List[Dict[str, Any]], 
    output_dir: str
) -> List[str]:
    """Clip video based on transcript segments"""
    try:
        video = VideoFileClip(video_path)
        output_paths = []
        
        for i, segment in enumerate(segments):
            # Ensure start and end times are within video duration
            start_time = max(0, segment["start"])
            end_time = min(video.duration, segment["end"])
            
            # Skip invalid segments
            if end_time <= start_time or start_time >= video.duration:
                continue
                
            # Extract clip
            clip = video.subclip(start_time, end_time)
            
            # Save clip
            output_path = os.path.join(output_dir, f"clip_{i}_{os.path.basename(video_path)}")
            clip.write_videofile(output_path)
            output_paths.append(output_path)
            
            # Close clip to free resources
            clip.close()
        
        # Close video to free resources
        video.close()
        
        return output_paths
    except Exception as e:
        logger.error(f"Error in clip_video_from_text: {str(e)}")
        raise

def trim_video(input_path: str, output_path: str, start_time: float, end_time: float) -> str:
    """Trim video to specified start and end times"""
    try:
        video = VideoFileClip(input_path)
        trimmed = video.subclip(start_time, end_time)
        trimmed.write_videofile(output_path)
        
        video.close()
        trimmed.close()
        
        return output_path
    except Exception as e:
        logger.error(f"Error in trim_video: {str(e)}")
        raise

def adjust_speed(input_path: str, output_path: str, speed_factor: float) -> str:
    """Adjust video speed"""
    try:
        video = VideoFileClip(input_path)
        modified = video.fx(VideoFileClip.speedx, speed_factor)
        modified.write_videofile(output_path)
        
        video.close()
        modified.close()
        
        return output_path
    except Exception as e:
        logger.error(f"Error in adjust_speed: {str(e)}")
        raise

def crop_video(input_path: str, output_path: str, x1: int, y1: int, x2: int, y2: int) -> str:
    """Crop video to specified rectangle"""
    try:
        video = VideoFileClip(input_path)
        cropped = video.crop(x1=x1, y1=y1, x2=x2, y2=y2)
        cropped.write_videofile(output_path)
        
        video.close()
        cropped.close()
        
        return output_path
    except Exception as e:
        logger.error(f"Error in crop_video: {str(e)}")
        raise

def rotate_video(input_path: str, output_path: str, angle: int) -> str:
    """Rotate video by specified angle"""
    try:
        video = VideoFileClip(input_path)
        rotated = video.rotate(angle)
        rotated.write_videofile(output_path)
        
        video.close()
        rotated.close()
        
        return output_path
    except Exception as e:
        logger.error(f"Error in rotate_video: {str(e)}")
        raise

def merge_videos(input_paths: List[str], output_path: str) -> str:
    """Merge multiple videos"""
    try:
        clips = [VideoFileClip(path) for path in input_paths]
        final_clip = concatenate_videoclips(clips)
        final_clip.write_videofile(output_path)
        
        for clip in clips:
            clip.close()
        final_clip.close()
        
        return output_path
    except Exception as e:
        logger.error(f"Error in merge_videos: {str(e)}")
        raise
