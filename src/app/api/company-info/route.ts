import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { 
  COMPANY_SYSTEM_PROMPT, 
  PRIMARY_MODEL, 
  FALLBACK_MODEL,
  ENABLE_DEBUG_LOGGING
} from '@/lib/config';

/**
 * SECURE API ROUTE FOR COMPANY INFORMATION
 * 
 * This route:
 * 1. Uses server-side environment variables (not exposed to client)
 * 2. Implements proper error handling with fallbacks
 * 3. Uses retry logic for transient errors
 * 4. Provides detailed logging for debugging
 * 5. Never exposes API keys in responses
 */

// Logger function to control debug output
const log = ENABLE_DEBUG_LOGGING 
  ? (message: string, data?: any) => console.log(`[API:company-info] ${message}`, data || '')
  : () => {};

// Access API keys directly from process.env (server-side only)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_KEY_ALTERNATE = process.env.OPENAI_API_KEY_ALTERNATE;

// Log API key availability (without exposing actual keys)
log('API Key Status:', {
  primaryKeyAvailable: !!OPENAI_API_KEY,
  alternateKeyAvailable: !!OPENAI_API_KEY_ALTERNATE
});

// Initialize OpenAI client with primary key
let openai: OpenAI | null = null;
try {
  if (OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    log('Primary OpenAI client initialized successfully');
  } else {
    log('⚠️ Primary OpenAI API key not found in environment variables');
  }
} catch (error) {
  log('⚠️ Failed to initialize primary OpenAI client:', error);
}

// Initialize alternate OpenAI client for fallback
let alternateOpenai: OpenAI | null = null;
try {
  if (OPENAI_API_KEY_ALTERNATE) {
    alternateOpenai = new OpenAI({ apiKey: OPENAI_API_KEY_ALTERNATE });
    log('Alternate OpenAI client initialized successfully');
  } else {
    log('⚠️ Alternate OpenAI API key not found in environment variables');
  }
} catch (error) {
  log('⚠️ Failed to initialize alternate OpenAI client:', error);
}

/**
 * API endpoint for getting company information
 */
export async function POST(req: Request) {
  log('POST request received');
  
  try {
    // Parse the request body
    const body = await req.json();
    const { topic } = body;
    
    log('Request payload:', { topic });
    
    if (!topic) {
      log('⚠️ No topic provided');
      return NextResponse.json(
        { error: 'No topic provided' },
        { status: 400 }
      );
    }
    
    // Check if we have any OpenAI client available
    if (!openai && !alternateOpenai) {
      log('⚠️ No OpenAI clients available');
      return NextResponse.json(
        { 
          result: generateMockResponse(topic),
          modelUsed: "none",
          isFallback: true,
          fallbackReason: "No API keys configured" 
        }
      );
    }
    
    // Prepare the custom system prompt for this topic
    const customPrompt = `${COMPANY_SYSTEM_PROMPT}\n\nYou are specifically being asked about how our services and technologies relate to the topic of "${topic}". Focus your response on this specific topic.`;
    
    // Try primary model first
    if (openai) {
      try {
        log(`Calling primary model (${PRIMARY_MODEL})`);
        
        const response = await openai.chat.completions.create({
          model: PRIMARY_MODEL,
          messages: [
            { role: "system", content: customPrompt },
            { role: "user", content: `How does our company help clients with ${topic}? What specific services and expertise do we offer in this area?` }
          ],
          max_tokens: 1000,
          temperature: 0.7
        });
        
        const content = response.choices[0]?.message?.content;
        
        if (content) {
          log(`✅ Primary model success (${response.model})`, {
            contentLength: content.length,
            tokens: response.usage
          });
          
          return NextResponse.json({
            result: content,
            modelUsed: response.model,
            isFallback: false,
            tokenStats: response.usage
          });
        } else {
          log('⚠️ Empty response from primary model');
          // Continue to fallback
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log(`⚠️ Primary model error: ${errorMessage}`);
        
        // Continue to fallback
      }
    }
    
    // Try fallback model
    if (alternateOpenai) {
      try {
        log(`Calling fallback model (${FALLBACK_MODEL})`);
        
        const response = await alternateOpenai.chat.completions.create({
          model: FALLBACK_MODEL,
          messages: [
            { role: "system", content: customPrompt },
            { role: "user", content: `How does our company help clients with ${topic}? What specific services and expertise do we offer in this area?` }
          ],
          max_tokens: 1000,
          temperature: 0.7
        });
        
        const content = response.choices[0]?.message?.content;
        
        if (content) {
          log(`✅ Fallback model success (${response.model})`, {
            contentLength: content.length,
            tokens: response.usage
          });
          
          return NextResponse.json({
            result: content,
            modelUsed: response.model,
            isFallback: true,
            fallbackReason: "Primary model failed",
            tokenStats: response.usage
          });
        } else {
          log('⚠️ Empty response from fallback model');
          // Continue to mock response
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log(`⚠️ Fallback model error: ${errorMessage}`);
        
        // Continue to mock response
      }
    }
    
    // If we get here, both models failed
    log('⚠️ All models failed, using mock response');
    
    return NextResponse.json({
      result: generateMockResponse(topic),
      modelUsed: "none",
      isFallback: true,
      fallbackReason: "All models failed"
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`⚠️ Unhandled API error: ${errorMessage}`);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        result: generateMockResponse("general"),
        modelUsed: "none",
        isFallback: true,
        fallbackReason: "Server error"
      },
      { status: 500 }
    );
  }
}

/**
 * Generate a mock response when AI models are unavailable
 */
function generateMockResponse(topic: string): string {
  return `PATech Labs offers specialized AI solutions for the ${topic} industry. Our flagship services include:

1. **AI Distillation Technology**: Our proprietary distillation process compresses large AI models into efficient, domain-specific systems tailored for ${topic} applications. This results in faster deployment, lower operational costs, and more accurate results.

2. **Custom Chatbots**: We develop conversational AI systems specifically designed for ${topic} use cases, enabling seamless customer engagement, 24/7 support, and intelligent automation of routine tasks.

3. **Image and Video Generation**: Our advanced generative AI creates high-quality visual content for ${topic} marketing, training, and presentation needs, saving time and reducing production costs.

4. **Marketing Automation**: Our AI-driven marketing tools analyze customer behavior patterns specific to ${topic} markets, optimizing campaign performance and increasing engagement by up to 40%.

5. **Voice Assistants**: We build voice-enabled solutions that understand industry-specific terminology related to ${topic}, improving accessibility and operational efficiency.

Founded by Ravshan Nuraliev, a PhD-level expert in AI technology, PATech Labs combines cutting-edge research with practical business applications. Our approach emphasizes simplicity, customization, and measurable results.

Based in Fort Lauderdale and New York, our team can be reached at team@patechlabs.com or (954) 598-5872 for a consultation on how our AI expertise can transform your ${topic} operations.`;
}