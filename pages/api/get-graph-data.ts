import type { NextApiRequest, NextApiResponse } from 'next'
import { ApplicationError } from '@/lib/errors'

const hasuraEndpoint = process.env.HASURA_GRAPHQL_ENDPOINT

const graphQuery = `
  query GetGeoExplorerGraph {
    geoexplorer_embeddings(where: {tsne_x: {_is_null: false}}) {
      Dimension_1: tsne_x
      Dimension_2: tsne_y
      Slug: slug
      Title: heading
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
    throw new ApplicationError('Failed to fetch graph data', result.errors ?? result)
  }

  return result.data
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!hasuraEndpoint) {
      throw new ApplicationError('Missing environment variable HASURA_GRAPHQL_ENDPOINT')
    }

    const data = await fetchGraphQL(graphQuery)
    const rawPoints = data.geoexplorer_embeddings || []

    // Map to the array format [number, number, string, string] expected by Scatterplot component
    const points = rawPoints.map((item: any) => [
      item.Dimension_1,
      item.Dimension_2,
      item.Slug,
      item.Title,
    ])

    // Add Cache-Control header for better performance in production
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
    res.status(200).json(points)
  } catch (error) {
    if (error instanceof ApplicationError) {
      console.error(`${error.message}: ${JSON.stringify(error.data)}`)
    } else {
      console.error(error)
    }
    return res.status(500).json({ error: 'There was an error processing your request' })
  }
}
