import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { OpenAIStream, StreamingTextResponse, experimental_StreamData } from 'ai'
import GPT3Tokenizer from 'gpt3-tokenizer'
import { codeBlock, oneLine } from 'common-tags'

import {
  Configuration,
  OpenAIApi,
  CreateModerationResponse,
  CreateEmbeddingResponse,
  ChatCompletionRequestMessage,
} from 'openai-edge'

const openAiKey = process.env.OPENAI_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const config = new Configuration({
  apiKey: openAiKey,
})
const openai = new OpenAIApi(config)

const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

export const runtime = 'edge'

export default async function POST(req: NextRequest) {
  try {
    if (!openAiKey) {
      throw new ApplicationError('Missing environment variable OPENAI_KEY')
    }

    if (!supabaseUrl) {
      throw new ApplicationError('Missing environment variable SUPABASE_URL')
    }

    if (!supabaseServiceKey) {
      throw new ApplicationError('Missing environment variable SUPABASE_SERVICE_ROLE_KEY')
    }

    const { initialQuestion, nameDataset, contentDataset, messages } = await req.json()

    if (!messages) {
      throw new UserError('Missing messages data')
    }

    // always get last user query from input
    const query = messages[messages.length - 1].content

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
        match_threshold: 0.78,
        match_count: 1,
        min_content_length: 50,
      }
    )

    if (matchError) {
      throw new ApplicationError('Failed to match page sections', matchError)
    }

    const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
    let tokenCount = 0
    let contextText = ''

    for (let i = 0; i < pageSections.length; i++) {
      const pageSection = pageSections[i]

      const title = pageSection.heading
      const content = pageSection.content

      const encoded = tokenizer.encode(content)
      tokenCount += encoded.text.length

      contextText += `${content.trim()}\n---\n`
    }

    const prompt = codeBlock`
      ${oneLine`
        Du bist ein Mitarbeiter der Servicestelle für Offene Daten Berlin, der es liebt, Menschen dabei zu helfen offene Datensätze (WFS-Dienste) zu erklären. Wenn dir eine Frage gestellt wird, beantworte diese auf Grundlage der inhhaltlichen Beschreibung des folgenden Datensatzes: ${oneLine`Beschreibung: ${contentDataset}`} ${oneLine`Frage:${initialQuestion}`}. Erkläre, warum die vorliegenden Daten für die gestellte Frage relevant sind oder relevant sein könnte, indem du die Frage in deiner Antwort wiederholst. Wenn du unsicher bist und die Antwort nicht explizit in der Beschreibung steht, versuche eine logische Erklärung zu finden, warum der gefundene Datensatz für die Frage relevant sein könnte. Danach stelle die fünf für die Frage relevantesten Datenattribute ausschließlich auf Grundlage der Beschreibung mit Kürzel und Kurzbeschreibung als Markdowntabelle dar. Erfinde NIEMALS Datenattribute!
        `}
    `
    // const prompt = codeBlock`
    //   ${oneLine`
    //     Du bist ein Mitarbeiter der Servicestelle für Offene Daten Berlin, der es liebt, Menschen dabei zu helfen offene Datensätze (WFS-Dienste) zu erklären. Wenn dir eine Frage gestellt wird, beantworte diese auf Grundlage der inhhaltlichen Beschreibung folgenden Datensatzes: ${oneLine`Beschreibung: ${contentDataset}`} ${oneLine`Frage:${initialQuestion}`}. Erkläre, warum der vorliegenden Datensatz für die gestellte Frage relevant ist oder auch nur im Entferntesten relevant sein könnte, indem du die Frage in deiner Antwort wiederholst. Wenn du unsicher bist und die Antwort nicht explizit im Kontext steht, versuche eine logische Erklärung zu finden.
    //     `}
    // `

    const chatMessage: ChatCompletionRequestMessage = {
      role: 'user',
      content: prompt,
    }

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [chatMessage],
    })

    // Instantiate StreamData for streaming additional data
    const data = new experimental_StreamData()

    // Create a stream using OpenAIStream
    const stream = OpenAIStream(response, {
      onCompletion(completion) {
        // Log the completion to the console
        // console.log('Completion:', completion)
      },
      onFinal() {
        // Close the StreamData when the response is final
        data.close()
      },
      experimental_streamData: true,
    })

    // Append a greeting message to the stream data
    data.append(pageSections)

    // Return the StreamingTextResponse with the stream and additional data
    return new StreamingTextResponse(stream, {}, data)
  } catch (error) {}
}