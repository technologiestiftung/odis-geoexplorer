// import type { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import {
  Configuration,
  OpenAIApi,
  CreateModerationResponse,
  CreateEmbeddingResponse,
} from 'openai-edge'

import testEmbeddings from './testEmbeddings.js'

const openAiKey = process.env.OPENAI_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const config = new Configuration({
  apiKey: openAiKey,
})
const openai = new OpenAIApi(config)

const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

// export const runtime = 'edge'

// import type { NextApiRequest, NextApiResponse } from 'next'

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let { messages, matchthreshold } = req.query

  // res.status(200).json({ embeddings: testEmbeddings.embeddings })
  // return

  try {
    if (!openAiKey) {
      throw new ApplicationError('Missing environment variable OPENAI_KEY')
    }
    console.log('embeddings-search2')
    if (!supabaseUrl) {
      throw new ApplicationError('Missing environment variable SUPABASE_URL')
    }
    console.log('embeddings-search3')
    if (!supabaseServiceKey) {
      throw new ApplicationError('Missing environment variable SUPABASE_SERVICE_ROLE_KEY')
    }

    if (!messages) {
      throw new UserError('Missing messages data')
    }
    // always get last user query from input
    const query = messages
    if (!query) {
      throw new UserError('Missing query in request data')
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
      model: 'text-embedding-ada-002',
      input: sanitizedQuery.replaceAll('\n', ' '),
    })
    if (embeddingResponse.status !== 200) {
      throw new ApplicationError('Failed to create embedding for question', embeddingResponse)
    }
    const {
      data: [{ embedding }],
    }: CreateEmbeddingResponse = await embeddingResponse.json()
    const { error: matchError, data: pageSections } = await supabaseClient.rpc(
      'match_page_sections',
      {
        embedding,
        match_threshold: matchthreshold ? matchthreshold : 0.78,
        match_count: 10, // 15
        min_content_length: 50,
      }
    )
    if (matchError) {
      throw new ApplicationError('Failed to match page sections', matchError)
    }
    res.status(200).json({ embeddings: pageSections })
  } catch (error) {}
}
