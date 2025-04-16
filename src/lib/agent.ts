import { GoogleGenerativeAI } from '@google/generative-ai';
import { MemoryManager, Memory } from './memory';
import { AcademicAPI, ArxivPaper } from './academic-api';

export class AcademicResearchAgent {
  private memoryManager: MemoryManager;
  private academicAPI: AcademicAPI;
  private genAI: GoogleGenerativeAI;
  private userId: string;

  constructor(
    userId: string,
    pineconeApiKey: string,
    pineconeEnvironment: string,
    pineconeIndexName: string,
    geminiApiKey: string
  ) {
    this.userId = userId;
    this.memoryManager = new MemoryManager(pineconeApiKey, pineconeEnvironment, pineconeIndexName, geminiApiKey);
    this.academicAPI = new AcademicAPI();
    this.genAI = new GoogleGenerativeAI(geminiApiKey);
  }

  async processQuery(query: string): Promise<string> {
    // 1. Retrieve relevant memories
    const memories = await this.memoryManager.retrieveMemories(this.userId, query);
    
    // 2. Search for relevant papers
    const papers = await this.academicAPI.searchPapers(query);
    
    // 3. Generate context from memories and papers
    const context = this.generateContext(memories, papers);
    
    // 4. Generate response using Gemini
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
      You are an academic research assistant. Use the following context to answer the user's query.
      
      Context from previous interactions:
      ${context.memories}
      
      Relevant research papers:
      ${context.papers}
      
      User query: ${query}
      
      Please provide a comprehensive answer based on the available information.
      If you cannot answer the question with the available information, say "I'm sorry, I don't know the answer to that."
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. Store the interaction in memory
    await this.storeInteraction(query, text, papers);

    return text;
  }

  private generateContext(memories: Memory[], papers: ArxivPaper[]): { memories: string; papers: string } {
    const memoriesContext = memories
      .map(memory => `- ${memory.content} (${memory.metadata.type})`)
      .join('\n');

    const papersContext = papers
      .map(paper => `- ${paper.title} by ${paper.authors.join(', ')}\n  Summary: ${paper.summary}`)
      .join('\n');

    return {
      memories: memoriesContext || 'No relevant memories found.',
      papers: papersContext || 'No relevant papers found.',
    };
  }

  private async storeInteraction(query: string, response: string, papers: ArxivPaper[]): Promise<void> {
    // Store the query and response
    await this.memoryManager.storeMemory({
      userId: this.userId,
      content: `Q: ${query}\nA: ${response}`,
      metadata: {
        timestamp: new Date().toISOString(),
        type: 'discussed_paper',
      },
    });

    // Store relevant papers
    for (const paper of papers) {
      await this.memoryManager.storeMemory({
        userId: this.userId,
        content: paper.title,
        metadata: {
          timestamp: new Date().toISOString(),
          type: 'discussed_paper',
          paperId: paper.id,
          authors: paper.authors.join(', '),
        },
      });
    }
  }
} 