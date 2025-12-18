#!/usr/bin/env node
// Test script for Perplexity Deep Research model using the REST endpoint
// Requires: npm i axios

const axios = require('axios')

async function main() {
  const apiKey = process.env.PERPLEXITY_API_KEY || ""
  const model = process.env.PERPLEXITY_DEEP_MODEL || "sonar-deep-research"

  if (!apiKey) {
    console.error('PERPLEXITY_API_KEY is not set. Set environment variable and retry.')
    process.exit(1)
  }
  if (!model) {
    console.error('PERPLEXITY_DEEP_MODEL is not set. Set the model name to test (env var) and retry.')
    console.error('Example: set PERPLEXITY_DEEP_MODEL=sonar-deep-research && node test_perplexity_deep.js')
    process.exit(1)
  }

  console.log('Checking Perplexity Deep Research model:', model)

  try {
    // Research prompt: electric cars effect on global warming
    const res = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert research assistant. Provide concise, sourced answers with citations and structured results.'
          },
          {
            role: 'user',
            content: `Please research the effect of electric cars on global warming.
- Provide a concise summary (3-5 sentences).
- Provide key findings and quantitative results where available (lifecycle emissions, manufacturing vs usage, battery production impact, estimated emissions reductions vs ICE vehicles).
- Include citations for each major claim and list full source details (title and URL) at the end.
- Note major uncertainties and assumptions.

Return a structured section containing: summary, key_findings (array), quantitative_estimates (with numbers and units), citations (array of {title, url, snippet}).`
          }
        ],
        max_tokens: 1500,
        // Perplexity-specific options (if supported)
        return_citations: true,
        return_images: false,
        search_recency_filter: 'year'
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000
      }
    )

    console.log('Status:', res.status)
    if (res.data) {
      console.log('\n--- Response Keys ---')
      console.log(Object.keys(res.data))

      // Print main answer if present
      const answer = res.data.answer || res.data.choices?.[0]?.message?.content || res.data.choices?.[0]?.message
      if (answer) {
        console.log('\n--- Answer / Content ---')
        console.log(typeof answer === 'string' ? answer : JSON.stringify(answer, null, 2))
      }

      // Print citations if provided
      const citations = res.data.citations || res.data.citations?.results || res.data?.citations
      if (citations) {
        console.log('\n--- Citations ---')
        try {
          console.log(JSON.stringify(citations, null, 2))
        } catch (e) {
          console.log(citations)
        }
      }
    }
    console.log('\nSUCCESS: Perplexity Deep Research responded')
    process.exit(0)
  } catch (err) {
    console.error('Perplexity Deep Research test failed')
    if (err.response) {
      console.error('Status:', err.response.status)
      console.error('Body:', JSON.stringify(err.response.data, null, 2))
    } else if (err.message) {
      console.error('Error message:', err.message)
    } else {
      console.error(err)
    }
    process.exit(2)
  }
}

main()
