import { NextRequest, NextResponse } from 'next/server';
import { Deepgram } from '@deepgram/sdk';

// Initialize Deepgram with API key
const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    // Check if Deepgram API key is configured
    if (!deepgramApiKey) {
      return NextResponse.json(
        { error: 'Deepgram API key is not configured' },
        { status: 500 }
      );
    }

    // Initialize Deepgram client
    const deepgram = new Deepgram(deepgramApiKey);

    // Get form data from request
    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set transcription options
    const options = {
      punctuate: true,
      model: 'nova-2',
      language: 'en',
      smart_format: true,
      utterances: true,
    };

    // Send request to Deepgram
    const response = await deepgram.transcription.preRecorded(
      { buffer },
      options
    );

    // Extract transcript from response
    const transcript = response.results?.channels[0]?.alternatives[0]?.transcript || '';

    return NextResponse.json({ text: transcript });
  } catch (error) {
    console.error('Error in transcription:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}