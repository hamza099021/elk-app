import { NextRequest, NextResponse } from 'next/server'
import { perplexityProvider } from '@/lib/ai-providers/perplexity'
import { auth } from '@/lib/auth'
import { createApiResponse } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await auth.getAuthenticatedUser(request)
    const body = await request.json()
    
    const { query, maxResults, includeImages, includeDomains, excludeDomains } = body
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Query is required and must be a non-empty string'),
        { status: 400 }
      )
    }
    
    // Validate query
    const validation = perplexityProvider.validateQuery(query)
    if (!validation.isValid) {
      return NextResponse.json(
        createApiResponse(false, null, '', validation.error || 'Invalid query'),
        { status: 400 }
      )
    }
    
    // Perform web search
    const result = await perplexityProvider.search({
      query: query.trim(),
      userId: user.id,
      maxResults: maxResults || 10,
      includeImages: includeImages || false,
      includeDomains,
      excludeDomains,
    })
    
    // Get suggested follow-up queries
    const suggestedQueries = await perplexityProvider.getSuggestedQueries(query, user.id)
    
    return NextResponse.json(
      createApiResponse(true, {
        ...result,
        suggestedQueries,
      }, 'Web search completed successfully')
    )
    
  } catch (error) {
    console.error('Web search error:', error)
    
    let errorMessage = 'Failed to perform web search'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('Rate limit exceeded')) {
        errorMessage = error.message
        statusCode = 429
      } else if (error.message.includes('limit exceeded')) {
        errorMessage = error.message
        statusCode = 429
      } else if (error.message.includes('Invalid') || error.message.includes('prohibited')) {
        errorMessage = error.message
        statusCode = 400
      }
    }
    
    return NextResponse.json(
      createApiResponse(false, null, '', errorMessage),
      { status: statusCode }
    )
  }
}