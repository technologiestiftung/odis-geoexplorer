// import type { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import {
  Configuration,
  OpenAIApi,
  CreateModerationResponse,
  CreateEmbeddingResponse,
} from 'openai-edge'

import { oneLine } from 'common-tags'

import testEmbeddings from './testEmbeddings.js'

const openAiKey = process.env.OPENAI_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const config = new Configuration({
  apiKey: openAiKey,
})
const openai = new OpenAIApi(config)
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

import type { NextApiRequest, NextApiResponse } from 'next'
import { ApplicationError, UserError } from '@/lib/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let { messages, matchthreshold, extended } = req.query
  let extendedQuery = ''

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
              // content: oneLine`Deine Rolle ist es, im Geodatenportal der Stadt Berlin Datensätze zu finden. Du erhälts einen Begriff oder einen Satz. Nenne EINEN einzigen neuen Begriff der helfen könnte mehr zu dem Thema des Users zu finden. Geben folgende Begriffe NICHT zurück: Berlin`,
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
        // match_threshold: matchthreshold ? matchthreshold : 0.78,
        match_threshold: 0.8,
        match_count: 40, // 15
        min_content_length: 50,
      }
    )
    if (matchError) {
      throw new ApplicationError('Failed to match page sections', matchError)
    }
    res.status(200).json({ embeddings: pageSections, extendedQuery: extendedQuery })
  } catch (error) {}
}
