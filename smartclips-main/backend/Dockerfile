
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
#RUN apt-get update && apt-get install -y \
 #   ffmpeg \
  #  libsm6 \
   # libxext6 \
   # && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create temporary directory for video processing
RUN mkdir -p temp

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
