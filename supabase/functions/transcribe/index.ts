
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check if we should use OpenAI or Google
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    
    // Default to OpenAI if Google API key is not available
    const useGoogle = !!googleApiKey;
    
    if (!openAIApiKey && !googleApiKey) {
      return new Response(
        JSON.stringify({ error: 'Neither OpenAI nor Google API keys are configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the form data
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    
    if (!audioFile || !(audioFile instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let transcriptionText = "";

    if (useGoogle) {
      console.log("Using Google Speech-to-Text API for transcription");
      // Convert audio file to base64
      const arrayBuffer = await audioFile.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Make request to Google Speech-to-Text API
      const googleResponse = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
            enableAutomaticPunctuation: true,
            model: 'video',
            useEnhanced: true
          },
          audio: {
            content: base64Audio
          }
        })
      });

      if (!googleResponse.ok) {
        const errorData = await googleResponse.json();
        throw new Error(`Google API error: ${JSON.stringify(errorData)}`);
      }

      const googleData = await googleResponse.json();
      
      // Extract transcript from Google's response
      transcriptionText = googleData.results
        .map((result: any) => result.alternatives[0].transcript)
        .join(' ');
    } else {
      console.log("Using OpenAI Whisper API for transcription");
      // Create a new FormData instance for the OpenAI API request
      const openAIFormData = new FormData();
      openAIFormData.append('file', audioFile);
      openAIFormData.append('model', 'whisper-1');

      // Make request to OpenAI Whisper API
      const openAIResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`
          // Don't set Content-Type as it will be set automatically with the correct boundary
        },
        body: openAIFormData,
      });

      if (!openAIResponse.ok) {
        const errorData = await openAIResponse.json();
        throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
      }

      const openAIData = await openAIResponse.json();
      transcriptionText = openAIData.text;
    }

    return new Response(
      JSON.stringify({ text: transcriptionText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in transcription:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
