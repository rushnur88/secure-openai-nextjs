'use client';

import { useState } from 'react';
import { getCompanyInfo, CompanyInfoResponse } from '@/lib/api/companyInfo';

export default function Home() {
  const [topic, setTopic] = useState('artificial intelligence');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompanyInfoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const data = await getCompanyInfo(topic);
      setResult(data);
      
      if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Secure OpenAI Next.js Demo</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Company Information Generator</h2>
        <p className="mb-4">
          Enter a topic to generate company information tailored to that topic.
          This demo uses a secure server-side API to call OpenAI without exposing API keys.
        </p>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label htmlFor="topic" className="block text-sm font-medium mb-1">Topic:</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Enter a topic..."
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Company Info'}
          </button>
        </form>
        
        {error && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-red-800 font-medium mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {result && (
          <div className="border rounded-md overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Company Information</h3>
                <div className="text-sm text-gray-500">
                  Model: {result.modelUsed}
                  {result.isFallback && (
                    <span className="ml-2 text-amber-600">(Fallback)</span>
                  )}
                </div>
              </div>
              
              {result.fallbackReason && (
                <p className="text-sm text-amber-600 mt-1">
                  Reason: {result.fallbackReason}
                </p>
              )}
              
              {result.tokenStats && (
                <div className="text-xs text-gray-500 mt-1">
                  Tokens: {result.tokenStats.total_tokens} (Prompt: {result.tokenStats.prompt_tokens}, Completion: {result.tokenStats.completion_tokens})
                </div>
              )}
            </div>
            
            <div className="p-4 whitespace-pre-wrap">{result.result}</div>
          </div>
        )}
      </div>
      
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">Secure API Design</h3>
          <ol className="list-decimal ml-5 space-y-2">
            <li>
              <strong>Client Side:</strong> The form sends the topic to a client-side function that calls the API route without exposing any secrets.
            </li>
            <li>
              <strong>Server Side:</strong> The API route securely accesses OpenAI using server-side environment variables that never reach the client.
            </li>
            <li>
              <strong>Primary/Fallback Models:</strong> The system tries a primary model first (gpt-4o), then falls back to a simpler model (gpt-4o-mini) if needed.
            </li>
            <li>
              <strong>Error Handling:</strong> If both API calls fail, the system provides a generated fallback response.
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}