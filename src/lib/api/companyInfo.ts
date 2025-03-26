/**
 * Client-side function for getting company information
 * 
 * This module provides a secure way to call the server-side API
 * without exposing API keys to the client.
 */

// Response type for company information
export interface CompanyInfoResponse {
  result: string;
  modelUsed: string;
  isFallback: boolean;
  fallbackReason?: string;
  tokenStats?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
}

/**
 * Gets company information for a specific topic
 */
export async function getCompanyInfo(topic: string): Promise<CompanyInfoResponse> {
  try {
    console.log(`[getCompanyInfo] Requesting company info for topic: ${topic}`);
    
    // Call the server-side API endpoint
    const response = await fetch('/api/company-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topic })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log(`[getCompanyInfo] Response received:`, {
      modelUsed: data.modelUsed || 'unknown',
      isFallback: data.isFallback || false,
      contentLength: data.result?.length || 0
    });
    
    return {
      result: data.result || 'No information available',
      modelUsed: data.modelUsed || 'unknown',
      isFallback: data.isFallback || false,
      fallbackReason: data.fallbackReason,
      tokenStats: data.tokenStats
    };
  } catch (error) {
    console.error('[getCompanyInfo] Error:', error);
    
    // Return error information in a structured format
    return {
      result: `Error retrieving company information: ${error instanceof Error ? error.message : String(error)}`,
      modelUsed: 'error',
      isFallback: true,
      fallbackReason: 'API error',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}