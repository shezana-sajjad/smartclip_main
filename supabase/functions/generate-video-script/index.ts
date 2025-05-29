
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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData = await req.json();
    const { 
      prompt, 
      mediaType, 
      audience, 
      platform,
      duration, 
      style,
      callToAction,
      existingContent 
    } = requestData;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct a comprehensive prompt for OpenAI
    let systemPrompt = "You are a professional video script writer with expertise in creating engaging, platform-optimized video content.";
    
    let userPrompt = `Create a video script about: "${prompt}".\n\n`;
    
    if (mediaType) {
      userPrompt += `The video will use ${mediaType} type of media.\n`;
    }
    
    if (audience) {
      userPrompt += `Target audience: ${audience}\n`;
    }
    
    if (platform) {
      userPrompt += `This video will be published on ${platform}, so optimize for that platform's best practices.\n`;
    }
    
    if (duration) {
      userPrompt += `The video should be approximately ${duration} in length.\n`;
    }
    
    if (style) {
      userPrompt += `Style tone: ${style}\n`;
    }
    
    if (callToAction) {
      userPrompt += `Include this call to action: ${callToAction}\n`;
    }
    
    if (existingContent) {
      userPrompt += `Incorporate or reference this existing content: ${existingContent}\n`;
    }
    
    userPrompt += `\nFormat the script in a professional way, with clear sections for:
1. INTRO - The attention-grabbing opening
2. BODY - The main content, structured in logical segments
3. CONCLUSION - Summarize key points
4. CTA - The call to action

Include visual directions [in brackets] to indicate what should be shown on screen.
`;

    // Make request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const script = data.choices[0].message.content;
    
    // Also generate suitable video scenes suggestions
    const scenesResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: "You are a professional video director specializing in creating engaging visual scenes."
          },
          {
            role: 'user',
            content: `Based on this script:\n\n${script}\n\nProvide a list of 5-7 key visual scenes that would work well for this video. For each scene, give a brief description of what should be shown visually.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    
    let scenes = [];
    if (scenesResponse.ok) {
      const scenesData = await scenesResponse.json();
      scenes = scenesData.choices[0].message.content;
    }

    return new Response(
      JSON.stringify({ 
        script: script,
        scenes: scenes
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in script generation:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
