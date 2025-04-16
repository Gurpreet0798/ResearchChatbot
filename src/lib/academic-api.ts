import axios from 'axios';
import { z } from 'zod';
import { parseString } from 'xml2js';

const ArxivPaperSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  authors: z.array(z.string()),
  published: z.string(),
  updated: z.string(),
  pdf_url: z.string(),
});

export type ArxivPaper = z.infer<typeof ArxivPaperSchema>;

export class AcademicAPI {
  private readonly arxivBaseUrl = 'http://export.arxiv.org/api/query';

  async searchPapers(query: string, maxResults: number = 10): Promise<ArxivPaper[]> {
    try {
      const response = await axios.get(this.arxivBaseUrl, {
        params: {
          search_query: query,
          max_results: maxResults,
          sortBy: 'relevance',
          sortOrder: 'descending',
        },
      });

      const papers = await this.parseArxivResponse(response.data);
      return papers.map(paper => ArxivPaperSchema.parse(paper));
    } catch (error) {
      console.error('Error fetching papers from arXiv:', error);
      return [];
    }
  }

  async getPaperDetails(paperId: string): Promise<ArxivPaper | null> {
    try {
      const response = await axios.get(this.arxivBaseUrl, {
        params: {
          id_list: paperId,
        },
      });

      const papers = await this.parseArxivResponse(response.data);
      if (papers.length === 0) return null;
      
      return ArxivPaperSchema.parse(papers[0]);
    } catch (error) {
      console.error('Error fetching paper details:', error);
      return null;
    }
  }

  private async parseArxivResponse(xmlData: string): Promise<Partial<ArxivPaper>[]> {
    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const entries = result.feed.entry || [];
          const papers = entries.map((entry: any) => ({
            id: entry.id[0].split('/').pop(),
            title: entry.title[0],
            summary: entry.summary[0],
            authors: entry.author.map((author: any) => author.name[0]),
            published: entry.published[0],
            updated: entry.updated[0],
            pdf_url: `https://arxiv.org/pdf/${entry.id[0].split('/').pop()}.pdf`,
          }));

          resolve(papers);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
} 