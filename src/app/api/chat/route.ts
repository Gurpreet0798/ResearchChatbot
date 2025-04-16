import { NextResponse } from 'next/server';
import { AcademicResearchAgent } from '@/lib/agent';

if (!process.env.PINECONE_API_KEY) {
  throw new Error('Missing Pinecone API key');
}

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing Gemini API key');
}

// Initialize the agent with environment variables
const agent = new AcademicResearchAgent(
  'default-user', // In production, this would come from user authentication
  process.env.PINECONE_API_KEY,
  process.env.PINECONE_ENVIRONMENT || '',
  process.env.PINECONE_INDEX_NAME || 'academic-research',
  process.env.GEMINI_API_KEY
);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || !lastMessage.content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    const response = await agent.processQuery(lastMessage.content);

    return NextResponse.json({ role: 'assistant', content: response });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 