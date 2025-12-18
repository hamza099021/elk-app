// Perplexity Sonar Pro API integration for web queries with citations

import axios from 'axios'
import { rateLimiter } from './rate-limiter'

export interface PerplexityQuery {
  query: string
  userId: string
  maxResults?: number
  includeImages?: boolean
  includeDomains?: string[]
  excludeDomains?: string[]
}

export interface PerplexityResponse {
  answer: string
  citations: Citation[]
  images?: string[]
  relatedQueries?: string[]
  tokens: number
}

export interface Citation {
  title: string
  url: string
  snippet: string
  publishedDate?: string
}

class PerplexityProvider {
  private readonly apiKey: string
  private readonly baseURL = 'https://api.perplexity.ai'
  private readonly model = 'sonar' // Current Perplexity model

  constructor() {
    // Do not throw at import time; allow the provider to be constructed
    // without an API key so Next.js build/runtime that imports this
    // module doesn't fail. We validate the API key at request time.
    this.apiKey = process.env.PERPLEXITY_API_KEY || ''
  }

  // Perform a web search query with Perplexity Sonar Pro
  async search(queryData: PerplexityQuery): Promise<PerplexityResponse> {
    try {
      // Validate API key at request time
      if (!this.apiKey) {
        throw new Error('PERPLEXITY_API_KEY environment variable is required')
      }

      // Check rate limits first
      await rateLimiter.checkLimit(queryData.userId, 'web_queries', 1)

      const domainFilter = this.buildDomainFilter(queryData.includeDomains, queryData.excludeDomains)

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(),
            },
            {
              role: 'user',
              content: queryData.query,
            },
          ],
          max_tokens: 4000,
          temperature: 0.2,
          ...(domainFilter.length > 0 && { search_domain_filter: domainFilter }),
          return_citations: true,
          return_images: queryData.includeImages || false,
          search_recency_filter: 'month', // Focus on recent information
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      )

      const result = response.data

      // Extract answer and citations
      const answer = result.choices[0]?.message?.content || 'No answer available'
      const citations = this.extractCitations(result.citations || [])
      const images = result.images || []
      const tokens = result.usage?.total_tokens || 0

      // Record usage
      await rateLimiter.recordUsage(queryData.userId, 'web_queries', tokens)

      return {
        answer: this.formatAnswer(answer, citations),
        citations,
        images,
        tokens,
      }
    } catch (error) {
      console.error('Perplexity API error:', error)
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.')
        }
        if (error.response?.status === 401) {
          throw new Error('Invalid API key or unauthorized access.')
        }
        if (error.response?.status === 400) {
          throw new Error('Invalid query format or parameters.')
        }
      }
      
      throw new Error('Failed to perform web search. Please try again.')
    }
  }

  // Get system prompt for web queries
  private getSystemPrompt(): string {
    return `You are a research assistant that provides accurate, well-researched answers with proper citations. 

INSTRUCTIONS:
- Provide comprehensive, factual answers based on the most recent and reliable sources
- Include specific details, numbers, dates, and facts when available
- Structure your response with clear sections if the query is complex
- Always cite your sources with [number] format
- Focus on authoritative sources like news outlets, official websites, research papers
- If information is conflicting between sources, mention this and explain the differences
- For recent events, prioritize the most up-to-date information
- Keep the tone professional and informative

FORMAT:
- Start with a direct answer to the question
- Provide supporting details with citations
- End with additional context if relevant

Remember: Accuracy and recency of information are paramount.`
  }

  // Build domain filter for search
  private buildDomainFilter(includeDomains?: string[], excludeDomains?: string[]): string[] {
    const filters: string[] = []
    
    if (includeDomains && includeDomains.length > 0) {
      filters.push(...includeDomains)
    }
    
    if (excludeDomains && excludeDomains.length > 0) {
      // Perplexity uses negative domain filtering
      filters.push(...excludeDomains.map(domain => `-${domain}`))
    }
    
    return filters
  }

  // Extract and format citations from Perplexity response
  private extractCitations(rawCitations: any[]): Citation[] {
    return rawCitations.map((citation, index) => ({
      title: citation.title || `Source ${index + 1}`,
      url: citation.url || '',
      snippet: citation.text || citation.snippet || '',
      publishedDate: citation.published_date || citation.date,
    })).filter(citation => citation.url) // Only include citations with URLs
  }

  // Format answer with improved citation formatting
  private formatAnswer(answer: string, citations: Citation[]): string {
    let formattedAnswer = answer

    // Add citation reference numbers in the text
    citations.forEach((citation, index) => {
      const citationNumber = `[${index + 1}]`
      // This is a simple approach - in a more sophisticated version,
      // you'd parse the Perplexity response to get exact citation placement
    })

    // Add citations section at the end
    if (citations.length > 0) {
      formattedAnswer += '\n\n**Sources:**\n'
      citations.forEach((citation, index) => {
        formattedAnswer += `[${index + 1}] ${citation.title} - ${citation.url}\n`
        if (citation.publishedDate) {
          formattedAnswer += `   Published: ${citation.publishedDate}\n`
        }
      })
    }

    return formattedAnswer
  }

  // Get suggested follow-up questions based on the query
  async getSuggestedQueries(originalQuery: string, userId: string): Promise<string[]> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'llama-3.1-8b-instruct',
          messages: [
            {
              role: 'system',
              content: 'Generate 3 related follow-up questions that would provide additional useful information about the topic. Return only the questions, one per line, without numbering.',
            },
            {
              role: 'user',
              content: `Original query: "${originalQuery}"\n\nGenerate 3 related follow-up questions:`,
            },
          ],
          max_tokens: 300,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const suggestions = response.data.choices[0]?.message?.content || ''
      return suggestions
        .split('\n')
        .filter((line: string) => line.trim())
        .slice(0, 3) // Ensure we only return 3 suggestions
    } catch (error) {
      console.error('Error generating suggested queries:', error)
      return []
    }
  }

  // Validate query before sending to API
  validateQuery(query: string): { isValid: boolean; error?: string } {
    if (!query || query.trim().length === 0) {
      return { isValid: false, error: 'Query cannot be empty' }
    }

    if (query.length > 2000) {
      return { isValid: false, error: 'Query is too long (max 2000 characters)' }
    }

    // Check for potentially harmful content
    const bannedPatterns = [
      /how to (hack|crack|break into)/i,
      /illegal (download|streaming|drugs)/i,
      /how to make (bombs|explosives|weapons)/i,
    ]

    for (const pattern of bannedPatterns) {
      if (pattern.test(query)) {
        return { isValid: false, error: 'Query contains prohibited content' }
      }
    }

    return { isValid: true }
  }

  // Get API usage statistics
  async getApiStats(): Promise<{ status: string; model: string }> {
    return {
      status: 'active',
      model: this.model,
    }
  }
}

// Export singleton instance
export const perplexityProvider = new PerplexityProvider()