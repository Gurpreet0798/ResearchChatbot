import { Pinecone } from '@pinecone-database/pinecone';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MemorySchema = z.object({
  userId: z.string(),
  content: z.string(),
  metadata: z.object({
    timestamp: z.string(),
    type: z.enum(['research_topic', 'favorite_author', 'discussed_paper']),
    paperId: z.string().optional(),
    author: z.string().optional(),
    topic: z.string().optional(),
  }),
});

export type Memory = z.infer<typeof MemorySchema>;

export class MemoryManager {
  private pinecone: Pinecone;
  private indexName: string;
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string, environment: string, indexName: string, geminiApiKey: string) {
    this.pinecone = new Pinecone({
      apiKey,
      environment,
    });
    this.indexName = indexName;
    this.genAI = new GoogleGenerativeAI(geminiApiKey);
  }

  async storeMemory(memory: Memory): Promise<void> {
    const index = this.pinecone.index(this.indexName);
    
    const vector = await this.generateEmbedding(memory.content);
    
    await index.upsert([{
      id: `${memory.userId}-${Date.now()}`,
      values: vector,
      metadata: {
        ...memory.metadata,
        content: memory.content,
      },
    }]);
  }

  async retrieveMemories(userId: string, query: string, limit: number = 5): Promise<Memory[]> {
    const index = this.pinecone.index(this.indexName);
    
    const queryVector = await this.generateEmbedding(query);
    
    const results = await index.query({
      vector: queryVector,
      filter: { userId },
      topK: limit,
      includeMetadata: true,
    });

    return results.matches.map(match => ({
      userId,
      content: match.metadata?.content as string,
      metadata: {
        timestamp: match.metadata?.timestamp as string,
        type: match.metadata?.type as Memory['metadata']['type'],
        paperId: match.metadata?.paperId as string | undefined,
        author: match.metadata?.author as string | undefined,
        topic: match.metadata?.topic as string | undefined,
      },
    }));
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({ model: 'embedding-001' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }
} 