
import os
import shutil
import logging
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session
import cloudinary
import cloudinary.uploader
from moviepy.editor import VideoFileClip
import openai
from google.cloud import texttospeech
import requests
from fastapi.staticfiles import StaticFiles
import datetime
import shutil
import time

# Import our modules
from database import SessionLocal, engine, Base
import models
import video_processing
import storage
import subprocess 

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Google Cloud TTS Client
client = texttospeech.TextToSpeechClient()


# Initialize the app
app = FastAPI(title="QuikClips API", description="Backend API for QuikClips video processing")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")


# Create tables
Base.metadata.create_all(bind=engine)

# Directory for temporary files
TEMP_DIR = "temp"
os.makedirs(TEMP_DIR, exist_ok=True)

# Authentication configuration
SECRET_KEY = os.getenv("SECRET_KEY", "development_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# Initialize S3 storage if configured
s3_enabled = os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY")
if s3_enabled:
    storage.initialize_s3()

# --- Authentication Models ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    subscription: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    
class UserProfile(BaseModel):
    username: str
    email: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    subscription: str = "free"

# --- Video Processing Models ---
class VideoSegment(BaseModel):
    start_time: float
    end_time: float
    text: str

class ProcessedVideo(BaseModel):
    segments: List[VideoSegment]
    video_urls: List[str]

# --- Helper Functions ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

# --- Routes ---
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "subscription": user.subscription
    }

@app.post("/users/", response_model=UserProfile)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    email_exists = db.query(models.User).filter(models.User.email == user.email).first()
    if email_exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username, 
        email=user.email, 
        hashed_password=hashed_password,
        subscription="free"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {
        "username": db_user.username,
        "email": db_user.email,
        "avatar_url": db_user.avatar_url,
        "bio": db_user.bio,
        "subscription": db_user.subscription
    }

@app.get("/users/me/", response_model=UserProfile)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url,
        "bio": current_user.bio,
        "subscription": current_user.subscription
    }

@app.post("/upload", response_model=ProcessedVideo)
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    storage_type: str = Form("cloudinary"),
    min_duration: float = Form(10.0),
    max_duration: float = Form(60.0),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check subscription limits
    if current_user.subscription == "free" and db.query(models.Video).filter(models.Video.user_id == current_user.id).count() >= 5:
        raise HTTPException(status_code=402, detail="Free subscription limit reached (5 videos)")

    try:
        # Save the uploaded video temporarily
        temp_video_path = os.path.join(TEMP_DIR, file.filename)
        with open(temp_video_path, "wb") as temp_video:
            shutil.copyfileobj(file.file, temp_video)
        
        # Log video info
        try:
            clip = VideoFileClip(temp_video_path)
            duration = clip.duration
            resolution = f"{clip.size[0]}x{clip.size[1]}"
            clip.close()
        except Exception as e:
            logger.error(f"Error getting video info: {str(e)}")
            duration = 0
            resolution = "unknown"
        
        # Create video record
        db_video = models.Video(
            user_id=current_user.id,
            filename=file.filename,
            original_path=temp_video_path,
            duration=duration,
            resolution=resolution,
            status="processing"
        )
        db.add(db_video)
        db.commit()
        db.refresh(db_video)
        
        # Process the video
        transcript, timestamps = video_processing.transcribe_video(temp_video_path, TEMP_DIR)
        segments = video_processing.segment_transcript(
            transcript, 
            timestamps, 
            min_duration=min_duration, 
            max_duration=max_duration,
            refine_with_ai=current_user.subscription != "free"
        )
        clipped_videos = video_processing.clip_video_from_text(temp_video_path, segments, TEMP_DIR)
        
        # Upload to appropriate storage
        video_urls = []
        for clip_path in clipped_videos:
            if storage_type == "s3" and s3_enabled:
                url = storage.upload_to_s3(clip_path)
            else:
                url = storage.upload_to_cloudinary(clip_path)
            video_urls.append(url)
            
            # Create clip record
            db_clip = models.VideoClip(
                video_id=db_video.id,
                url=url,
                duration=VideoFileClip(clip_path).duration,
                status="completed"
            )
            db.add(db_clip)
        
        # Update video status
        db_video.status = "completed"
        db_video.processed_count = len(clipped_videos)
        db.commit()
        
        # Clean up in background
        def cleanup():
            try:
                os.remove(temp_video_path)
                for clip in clipped_videos:
                    if os.path.exists(clip):
                        os.remove(clip)
            except Exception as e:
                logger.error(f"Cleanup error: {str(e)}")
                
        background_tasks.add_task(cleanup)
        
        return {
            "segments": [
                {"start_time": s["start"], "end_time": s["end"], "text": s["text"]}
                for s in segments
            ],
            "video_urls": video_urls
        }

    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        if 'db_video' in locals():
            db_video.status = "failed"
            db_video.error_message = str(e)
            db.commit()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/edit/trim")
async def trim_video(
    file: UploadFile = File(...),
    start_time: float = Form(...),
    end_time: float = Form(...),
    current_user: models.User = Depends(get_current_user)
):
    try:
        # Save the uploaded video temporarily
        temp_video_path = os.path.join(TEMP_DIR, file.filename)
        with open(temp_video_path, "wb") as temp_video:
            shutil.copyfileobj(file.file, temp_video)
        
        # Trim the video
        output_path = os.path.join(TEMP_DIR, f"trimmed_{file.filename}")
        video_processing.trim_video(temp_video_path, output_path, start_time, end_time)
        
        # Upload to Cloudinary
        url = storage.upload_to_cloudinary(output_path)
        
        # Cleanup
        os.remove(temp_video_path)
        os.remove(output_path)
        
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/edit/speed")
async def adjust_speed(
    file: UploadFile = File(...),
    speed_factor: float = Form(...),
    current_user: models.User = Depends(get_current_user)
):
    try:
        # Save the uploaded video temporarily
        temp_video_path = os.path.join(TEMP_DIR, file.filename)
        with open(temp_video_path, "wb") as temp_video:
            shutil.copyfileobj(file.file, temp_video)
        
        # Adjust speed
        output_path = os.path.join(TEMP_DIR, f"speed_{file.filename}")
        video_processing.adjust_speed(temp_video_path, output_path, speed_factor)
        
        # Upload to Cloudinary
        url = storage.upload_to_cloudinary(output_path)
        
        # Cleanup
        os.remove(temp_video_path)
        os.remove(output_path)
        
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/edit/crop")
async def crop_video(
    file: UploadFile = File(...),
    x1: int = Form(...),
    y1: int = Form(...),
    x2: int = Form(...),
    y2: int = Form(...),
    current_user: models.User = Depends(get_current_user)
):
    try:
        # Save the uploaded video temporarily
        temp_video_path = os.path.join(TEMP_DIR, file.filename)
        with open(temp_video_path, "wb") as temp_video:
            shutil.copyfileobj(file.file, temp_video)
        
        # Crop the video
        output_path = os.path.join(TEMP_DIR, f"cropped_{file.filename}")
        video_processing.crop_video(temp_video_path, output_path, x1, y1, x2, y2)
        
        # Upload to Cloudinary
        url = storage.upload_to_cloudinary(output_path)
        
        # Cleanup
        os.remove(temp_video_path)
        os.remove(output_path)
        
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/edit/rotate")
async def rotate_video(
    file: UploadFile = File(...),
    angle: int = Form(...),
    current_user: models.User = Depends(get_current_user)
):
    try:
        # Save the uploaded video temporarily
        temp_video_path = os.path.join(TEMP_DIR, file.filename)
        with open(temp_video_path, "wb") as temp_video:
            shutil.copyfileobj(file.file, temp_video)
        
        # Rotate the video
        output_path = os.path.join(TEMP_DIR, f"rotated_{file.filename}")
        video_processing.rotate_video(temp_video_path, output_path, angle)
        
        # Upload to Cloudinary
        url = storage.upload_to_cloudinary(output_path)
        
        # Cleanup
        os.remove(temp_video_path)
        os.remove(output_path)
        
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/edit/merge")
async def merge_videos(
    files: List[UploadFile] = File(...),
    current_user: models.User = Depends(get_current_user)
):
    try:
        temp_paths = []
        for file in files:
            temp_path = os.path.join(TEMP_DIR, file.filename)
            with open(temp_path, "wb") as temp_video:
                shutil.copyfileobj(file.file, temp_video)
            temp_paths.append(temp_path)
        
        # Merge the videos
        output_path = os.path.join(TEMP_DIR, f"merged_{datetime.now().timestamp()}.mp4")
        video_processing.merge_videos(temp_paths, output_path)
        
        # Upload to Cloudinary
        url = storage.upload_to_cloudinary(output_path)
        
        # Cleanup
        for path in temp_paths:
            os.remove(path)
        os.remove(output_path)
        
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/videos/")
async def list_videos(
    skip: int = 0, 
    limit: int = 20,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    videos = db.query(models.Video).filter(
        models.Video.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    result = []
    for video in videos:
        clips = db.query(models.VideoClip).filter(models.VideoClip.video_id == video.id).all()
        result.append({
            "id": video.id,
            "filename": video.filename,
            "duration": video.duration,
            "created_at": video.created_at,
            "status": video.status,
            "clips": [{"id": clip.id, "url": clip.url, "duration": clip.duration} for clip in clips]
        })
    
    return result

@app.delete("/videos/{video_id}")
async def delete_video(
    video_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = db.query(models.Video).filter(
        models.Video.id == video_id,
        models.Video.user_id == current_user.id
    ).first()
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Delete associated clips
    clips = db.query(models.VideoClip).filter(models.VideoClip.video_id == video.id).all()
    for clip in clips:
        db.delete(clip)
    
    # Delete video record
    db.delete(video)
    db.commit()
    
    return {"detail": "Video deleted successfully"}

class GenerationRequest(BaseModel):
    prompt: str
    image: str
    platform: str
    duration: int  # Duration of the video in seconds
  

class GenerationResponse(BaseModel):
    script: str


# Set your OpenAI API Key
openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))




os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'angular-argon-452914-f1-17bffe088833.json'

@app.post("/generate", response_model=GenerationResponse)
async def generate_video_script(request: GenerationRequest):
    try:
       
        detailed_prompt = (
            f"Create a highly detailed video script for {request.platform} based on the following idea:\n\n"
            f"Idea: {request.prompt}\n"
            f"Target Duration: {request.duration} seconds.\n\n"
            "The script must be clearly structured, alternating between SCENE descriptions and NARRATOR speeches.\n"
            "Each SCENE should be labeled like 'SCENE 1:', 'SCENE 2:', etc., and be extremely vivid and visual and look like this {request.image}.\n"
            "Each NARRATOR line should be emotional, storytelling-style, and connected to the scene.\n\n"
            "FORMAT STRICTLY LIKE THIS:\n\n"
            "SCENE 1:\n"
            "[Detailed description of the first visual scene — colors, environment, emotions, action.]\n\n"
            "NARRATOR:\n"
            "[Narration for the first scene — short, impactful, and expressive.]\n\n"
            "SCENE 2:\n"
            "[Detailed description of the second visual scene.]\n\n"
            "NARRATOR:\n"
            "[Narration for the second scene.]\n\n"
            "Create at least 3 to 5 SCENE and NARRATOR pairs."
        )

        # New way of calling Chat Completions
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a creative video scriptwriter."},
                {"role": "user", "content": detailed_prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )

        script = response.choices[0].message.content

        return GenerationResponse(script=script)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    





# Define the request model for generating audio
class AudioGenerationRequest(BaseModel):
    script_text: str
    language_code: Optional[str] = "en-US"  # Default to English if not provided
    voice_name: Optional[str] = "en-US-Wavenet-D"  # Default voice option

# Define the response model
class AudioGenerationResponse(BaseModel):
    audio_url: str  # The URL or file path of the generated audio


# Request model for audio and image
class AudioRequest(BaseModel):
    script_text: str
    session_name: str
    scene_number: int
    voice_type: str
    platform: str

class ImageRequest(BaseModel):
    script: dict
    session_name: str
    scene_number: int
    mediaType: str
    platform: str
    


# Helper function to create the session folder and subfolder structure
def create_session_folder(session_name):
    base_folder = f"static/sessions/{session_name}"
    
    # Check if the base folder exists, if not create it
    if not os.path.exists(base_folder):
        os.makedirs(base_folder, exist_ok=True)
    
    # Subfolders for images and audio inside the session folder
    image_folder = os.path.join(base_folder, "images")
    audio_folder = os.path.join(base_folder, "audio")

    # Create subfolders if they don't exist
    os.makedirs(image_folder, exist_ok=True)
    os.makedirs(audio_folder, exist_ok=True)

    return base_folder, image_folder, audio_folder


# ElevenLabs config
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")  # set this securely
VOICE_ID = "EXAVITQu4vr4xnSDxMaL"  # Example voice ID (you can change this)


def create_session_folder(session_name):
    base_folder = f"static/sessions/{session_name}"
    image_folder = os.path.join(base_folder, "images")
    audio_folder = os.path.join(base_folder, "audio")

    os.makedirs(image_folder, exist_ok=True)
    os.makedirs(audio_folder, exist_ok=True)

    return base_folder, image_folder, audio_folder

@app.post("/generate-audio")
async def generate_audio(request: AudioRequest):
    try:
        session_name = request.session_name
        scene_number = request.scene_number
        script_text = request.script_text
        voice_type = request.voice_type
        
        print(voice_type)

        # Create folders
        base_folder, image_folder, audio_folder = create_session_folder(session_name)

        # ElevenLabs API call
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_type}"

        headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        }

        payload = {
            "text": script_text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }

        response = requests.post(url, headers=headers, json=payload)

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"ElevenLabs error: {response.text}")

        # Save audio file
        audio_filename = os.path.join(audio_folder, f"audio_{scene_number}.mp3")
        with open(audio_filename, "wb") as f:
            f.write(response.content)

        print(f"Audio content written to: {audio_filename}")
        return {"audio_path": audio_filename}

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating audio: {str(e)}")
    
# Audio request
@app.post("/generate-google-audio")
async def generate_audio(request: AudioRequest):
    try:
        session_name = request.session_name
        scene_number = request.scene_number
        script_text = request.script_text

        # Create session folder and subfolders
        base_folder, image_folder, audio_folder = create_session_folder(session_name)

        # Google Text to Speech setup
        client = texttospeech.TextToSpeechClient()

        synthesis_input = texttospeech.SynthesisInput(text=script_text)
        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        # Perform speech synthesis
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        # Ensure we get binary data and write it to a file
        audio_filename = os.path.join(audio_folder, f"audio_{scene_number}.mp3")

        # Write the binary audio content to a file
        with open(audio_filename, "wb") as out:
            out.write(response.audio_content)  # Ensure response.audio_content is a binary string

        print(f"Audio content written to: {audio_filename}")

        return {"audio_path": audio_filename}  # Return the path to the audio file

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating audio: {str(e)}")

            
@app.post("/generate-image")
async def generate_images(request: ImageRequest):
    try:
        session_name = request.session_name
        scene_number = request.scene_number
        prompt = request.script["script"]
    
        # Reuse the same session folder and subfolders for images
        base_folder, image_folder, audio_folder = create_session_folder(session_name)

        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise HTTPException(status_code=500, detail="Missing OpenAI API key")

        response = requests.post(
            "https://api.openai.com/v1/images/generations",
            headers={"Authorization": f"Bearer {openai_api_key}"},
            json={"prompt": prompt, "n": 1, "size": "1024x1024"}
        )

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Failed to generate images: {response.text}")

        data = response.json()
        image_url = data["data"][0]["url"]

        # Save image in the images subfolder with a unique name per scene
        image_filename = os.path.join(image_folder, f"image_{scene_number}.jpg")
        img_data = requests.get(image_url).content
        with open(image_filename, "wb") as img_file:
            img_file.write(img_data)

        return {"image_path": image_filename}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

def create_video_from_audio_and_image(audio_file, image_file, output_video, platform):
    try:
        # Define platform resolutions
        platform_resolutions = {
            "youtube": "1920x1080",  # YouTube 16:9
            "tiktok": "1080x1920",  # TikTok portrait
            "instagram": "1024x1024",  # Instagram square
            "linkedin": "1200x627",  # LinkedIn
            "twitter": "1200x675",  # Twitter
        }

        # Default resolution is 1024x1024
        resolution = platform_resolutions.get(platform.lower(), "1024x1024")

        # Get width and height from the resolution
        width, height = map(int, resolution.split('x'))

        # FFmpeg command to create a video with scaling and cropping
        cmd = [
            "ffmpeg",
            "-loop", "1",  # Loop image to match audio duration
            "-framerate", "1",  # 1 frame per second
            "-t", str(get_audio_duration(audio_file)),  # Duration of audio
            "-i", image_file,  # Input image file
            "-i", audio_file,  # Input audio file
            "-vf", f"scale={width}x{height}:force_original_aspect_ratio=increase,crop={width}:{height}",  # Scale and crop image
            "-c:v", "libx264",  # Video codec
            "-preset", "fast",  # Encoding speed preset
            "-c:a", "aac",  # Audio codec
            "-strict", "experimental",  # Experimental codecs
            "-shortest",  # Ensure video duration matches audio
            output_video  # Output video file
        ]

        # Run FFmpeg command
        subprocess.run(cmd, check=True)
        print(f"Video created: {output_video}")

    except subprocess.CalledProcessError as e:
        print(f"Error creating video: {e}")
        raise

def get_audio_duration(audio_file):
    """
    Gets the duration of the audio file using FFmpeg.
    """
    cmd = [
        "ffmpeg",
        "-i", audio_file,  # Input audio file
        "-f", "null",  # Discard output
        "-"
    ]
    result = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
    duration_line = next(line for line in result.stderr.splitlines() if "Duration" in line)
    duration_str = duration_line.split("Duration:")[1].split(",")[0].strip()
    h, m, s = map(float, duration_str.split(":"))
    return h * 3600 + m * 60 + s

class VideoRequest(BaseModel):
    session_name: str  # The session name for the video generation
    audio_files: List[str]  # List of audio file paths
    image_files: List[str]  # List of image file paths
    platform: str

@app.post("/generate-video")
async def generate_video(request: VideoRequest): 
    try:
        session_name = request.session_name
        audio_files = request.audio_files
        image_files = request.image_files
        platform = request.platform

        if len(audio_files) != len(image_files):
            raise HTTPException(status_code=400, detail="Audio files and image files must have the same length.")

        video_files = []
        for i in range(len(audio_files)):
            audio_file = audio_files[i]
            image_file = image_files[i]
            output_video = os.path.join(f"static/sessions/{session_name}", f"scene_{i+1}.mp4")

            # Create video from audio and image with platform aspect ratio
            create_video_from_audio_and_image(audio_file, image_file, output_video, platform)
            video_files.append(output_video)

        final_video = os.path.join(f"static/sessions/{session_name}", "final_video.mp4")
        concatenate_videos(video_files, final_video)

        return {"final_video_path": final_video}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating video: {str(e)}")
    
def concatenate_videos(video_files, final_output):
    """
    Concatenates multiple video files into one final video.
    """
    try:
        # Create a text file with all video file paths
        with open("video_list.txt", "w") as f:
            for video_file in video_files:
                f.write(f"file '{video_file}'\n")

        # FFmpeg command to concatenate videos
        cmd = ["ffmpeg", "-f", "concat", "-safe", "0", "-i", "video_list.txt", "-c", "copy", final_output]
        subprocess.run(cmd, check=True)

        print(f"Final video created: {final_output}")

        # Clean up the temporary video list file
        os.remove("video_list.txt")

    except subprocess.CalledProcessError as e:
        print(f"Error concatenating videos: {e}")
        raise
       

@app.get("/get-el-voices")
def get_el_voices():
    try:
        url = "https://api.elevenlabs.io/v1/voices"
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY
        }

        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            voices = response.json().get("voices", [])
            return {"voices": voices}
        else:
            raise HTTPException(status_code=response.status_code, detail=response.text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving voices: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
