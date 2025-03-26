# Secure OpenAI Next.js

A demonstration of secure OpenAI API integration with Next.js. This project shows how to properly handle API keys and environment variables in a Next.js application.

## Key Features

- ✅ **Secure Environment Variables**: Properly separated server-side and client-side environment variables
- ✅ **Fallback Mechanism**: Multi-tier fallback from primary model to alternate model to hardcoded responses
- ✅ **Comprehensive Error Handling**: Detailed error tracking and fallback mechanisms
- ✅ **Clean API Design**: Well-structured API routes with proper separation of concerns
- ✅ **TypeScript Throughout**: Full type safety across the codebase

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key(s)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/rushnur88/secure-openai-nextjs.git
   cd secure-openai-nextjs
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env.local` file using the template in `.env.example`
   ```
   cp .env.example .env.local
   ```

4. Add your OpenAI API key(s) to the `.env.local` file
   ```
   OPENAI_API_KEY=your-primary-api-key
   OPENAI_API_KEY_ALTERNATE=your-fallback-api-key
   ```

5. Start the development server
   ```
   npm run dev
   ```

6. Visit `http://localhost:3000` to see the application

## Architecture

### Security Best Practices

1. **Server-Only API Keys**: API keys are only used in server-side code and never exposed to the client
2. **Proper Environment Variables**: Using Next.js environment variable system correctly
3. **API Isolation**: Client-side code only interacts with safe API endpoints
4. **Enhanced Headers**: Security headers applied through Next.js config

### File Structure

```
src/
├── app/
│   ├── api/
│   │   └── company-info/      # Server-side API route
│   │       └── route.ts       # OpenAI integration with fallbacks
│   ├── globals.css            # Global CSS with Tailwind
│   ├── layout.tsx             # Root layout component
│   └── page.tsx               # Home page with demo interface
├── lib/
│   ├── api/
│   │   └── companyInfo.ts     # Client-side function for API calling
│   └── config.ts              # App configuration (no secrets)
```

## How It Works

### API Flow

1. **Client Request**: The client calls `getCompanyInfo()` with a topic
2. **Server Processing**:
   - The server-side API route accesses OpenAI with secure API keys
   - It tries the primary model first (gpt-4o)
   - If that fails, it tries a fallback model (gpt-4o-mini)
   - If all API calls fail, it generates a hardcoded response
3. **Response**: Returns data with model information and fallback status

### Error Handling

The application implements a multi-tier fallback system:
- Tier 1: Use primary OpenAI model (gpt-4o)
- Tier 2: Use fallback OpenAI model (gpt-4o-mini)
- Tier 3: Generate a reasonable mock response

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [OpenAI](https://openai.com/) - API provider
- [Tailwind CSS](https://tailwindcss.com/) - For styling