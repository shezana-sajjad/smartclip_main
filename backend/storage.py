
import os
import logging
import boto3
import cloudinary
import cloudinary.uploader

logger = logging.getLogger(__name__)

# S3 client
s3_client = None

def initialize_s3():
    """Initialize S3 client"""
    global s3_client
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION", "us-east-1")
        )
        return True
    except Exception as e:
        logger.error(f"Error initializing S3: {str(e)}")
        return False

def upload_to_s3(file_path: str) -> str:
    """Upload file to S3 and return URL"""
    try:
        if not s3_client:
            raise Exception("S3 client not initialized")
        
        bucket_name = os.getenv("AWS_BUCKET_NAME")
        if not bucket_name:
            raise Exception("AWS_BUCKET_NAME environment variable not set")
        
        file_name = os.path.basename(file_path)
        object_name = f"uploads/{file_name}"
        
        s3_client.upload_file(file_path, bucket_name, object_name)
        
        # Generate URL
        url = f"https://{bucket_name}.s3.amazonaws.com/{object_name}"
        logger.info(f"Uploaded to S3: {url}")
        
        return url
    except Exception as e:
        logger.error(f"Error uploading to S3: {str(e)}")
        raise

def upload_to_cloudinary(file_path: str) -> str:
    """Upload file to Cloudinary and return URL"""
    try:
        # Check if Cloudinary is configured
        if not cloudinary.config().cloud_name:
            raise Exception("Cloudinary not configured")
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload_large(
            file_path,
            resource_type="video",
            folder="quikclips"
        )
        
        # Return the secure URL
        url = result.get('secure_url')
        logger.info(f"Uploaded to Cloudinary: {url}")
        
        return url
    except Exception as e:
        logger.error(f"Error uploading to Cloudinary: {str(e)}")
        raise
