import {
  Configuration,
  OpenAIApi,
  CreateModerationResponse,
  CreateEmbeddingResponse,
} from 'openai-edge'

import { oneLine } from 'common-tags'

const openAiKey = process.env.OPENAI_KEY
const hasuraEndpoint = process.env.HASURA_GRAPHQL_ENDPOINT

const config = new Configuration({
  apiKey: openAiKey,
})
const openai = new OpenAIApi(config)

import type { NextApiRequest, NextApiResponse } from 'next'
import { ApplicationError, UserError } from '@/lib/errors'

interface QueryParams {
  messages?: string
  matchthreshold?: string
  extended?: string
  matchcount?: string
}

const matchQuery = `
  query MatchPageSections($args: geoexplorer_match_page_sections_v2_args!) {
    geoexplorer_match_page_sections_v2(args: $args) {
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
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables }),
  })

  const result = await response.json()

  if (!response.ok || result.errors) {
    throw new ApplicationError('Failed to match page sections', result.errors ?? result)
  }

  return result.data
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let { messages, matchthreshold, extended, matchcount } = req.query as QueryParams
  let extendedQuery = ''

  try {
    if (!openAiKey) {
      throw new ApplicationError('Missing environment variable OPENAI_KEY')
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
        const response = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          stream: false,
          messages: [
            {
              role: 'system',
              content: oneLine`Deine Rolle ist es, im Geodatenportal der Stadt Berlin Datensätze zu finden. Nennen EIN Wort das die Eingabe des Users Thematisch beschreibt.`,
            },
            { role: 'user', content: oneLine`${query}` },
          ],
        })
        // wait for the response to be completed and save the result in a varibale
        const completion = await response.json()
        extendedQuery = completion?.choices[0]?.message?.content
        console.log('extended search', extendedQuery)
        query = extendedQuery ? extendedQuery : query
      } catch (error) {
        console.error('error in completion', error)
      }
    }

    // Moderate the content to comply with OpenAI T&C
    const sanitizedQuery = query.trim()
    const moderationResponse: CreateModerationResponse = await openai
      .createModeration({ input: sanitizedQuery })
      .then((res) => res.json())

    const [results] = moderationResponse.results
    if (results.flagged) {
      throw new UserError('Flagged content', {
        flagged: true,
        categories: results.categories,
      })
    }
    // Create embedding from query
    const embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-3-small',
      input: sanitizedQuery.replaceAll('\n', ' '),
    })
    if (embeddingResponse.status !== 200) {
      throw new ApplicationError('Failed to create embedding for question', embeddingResponse)
    }
    const {
      data: [{ embedding }],
    }: CreateEmbeddingResponse = await embeddingResponse.json()

    const data = await fetchGraphQL(matchQuery, {
      args: {
        // pgvector expects a string-encoded array, e.g. "[0.1,0.2,...]"
        query_embedding: JSON.stringify(embedding),
        match_threshold: matchthreshold ? Number(matchthreshold) : 0.26,
        match_count: matchcount ? Number(matchcount) : 40, // 15
      },
    })

    const pageSections = data.geoexplorer_match_page_sections_v2

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
