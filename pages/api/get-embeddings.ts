import { oneLine } from 'common-tags'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApplicationError, UserError } from '@/lib/errors'

const mistralKey = process.env.MISTRAL_KEY
const hasuraEndpoint = process.env.HASURA_GRAPHQL_ENDPOINT

interface QueryParams {
  messages?: string
  matchthreshold?: string
  extended?: string
  matchcount?: string
}

const matchQuery = `
  query MatchPageSections($args: geoexplorer_match_embeddings_args!) {
    geoexplorer_match_embeddings(args: $args) {
      id
      slug
      heading
      similarity
      dataset_info
    }
  }
`

async function fetchGraphQL(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(hasuraEndpoint as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  const result = await response.json()

  if (!response.ok || result.errors) {
    throw new ApplicationError('Failed to match page sections', result.errors ?? result)
  }

  return result.data
}

async function createMistralChatCompletion(prompt: string, query: string, apiKey: string) {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'open-mistral-7b',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: query },
      ],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new ApplicationError(`Mistral Chat Completion failed: ${response.status}`, { error: errText })
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content
}

async function createMistralEmbedding(input: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.mistral.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-embed',
      input: [input],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new ApplicationError(`Mistral Embedding failed: ${response.status}`, { error: errText })
  }

  const result = await response.json()
  const embedding = result?.data?.[0]?.embedding
  if (!embedding) {
    throw new ApplicationError('Mistral response did not contain embedding', { result })
  }
  return embedding
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let { messages, matchthreshold, extended, matchcount } = req.query as QueryParams
  let extendedQuery = ''

  try {
    if (!mistralKey) {
      throw new ApplicationError('Missing environment variable MISTRAL_KEY')
    }
    if (!hasuraEndpoint) {
      throw new ApplicationError('Missing environment variable HASURA_GRAPHQL_ENDPOINT')
    }
    if (!messages) {
      throw new UserError('Missing messages data')
    }
    // always get last user query from input
    let query = messages
    if (!query) {
      throw new UserError('Missing query in request data')
    }

    if (extended === '1') {
      try {
        const systemPrompt = oneLine`Deine Rolle ist es, im Geodatenportal der Stadt Berlin Datensätze zu finden. Nennen EIN Wort das die Eingabe des Users Thematisch beschreibt.`
        const result = await createMistralChatCompletion(systemPrompt, oneLine`${query}`, mistralKey)
        if (result) {
          extendedQuery = result
          console.log('extended search', extendedQuery)
          query = extendedQuery
        }
      } catch (error) {
        console.error('error in completion', error)
      }
    }

    const sanitizedQuery = query.trim()

    // Create embedding from query using Mistral
    const embedding = await createMistralEmbedding(sanitizedQuery.replaceAll('\n', ' '), mistralKey)

    const data = await fetchGraphQL(matchQuery, {
      args: {
        // pgvector expects a string-encoded array, e.g. "[0.1,0.2,...]"
        query_embedding: JSON.stringify(embedding),
        match_threshold: matchthreshold ? Number(matchthreshold) : 0.26,
        match_count: matchcount ? Number(matchcount) : 40,
      },
    })

    const pageSections = data.geoexplorer_match_embeddings

    res.status(200).json({ embeddings: pageSections, extendedQuery: extendedQuery })
  } catch (error) {
    if (error instanceof UserError) {
      return res.status(400).json({ error: error.message, data: error.data })
    }
    if (error instanceof ApplicationError) {
      console.error(`${error.message}: ${JSON.stringify(error.data)}`)
    } else {
      console.error(error)
    }
    return res.status(500).json({ error: 'There was an error processing your request' })
  }
}
