import { codeBlock, oneLine } from 'common-tags'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApplicationError } from '@/lib/errors'

const mistralKey = process.env.MISTRAL_KEY

async function createMistralChatCompletion(promptSystem: string, promptUser: string, apiKey: string) {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'open-mistral-7b',
      messages: [
        { role: 'system', content: promptSystem },
        { role: 'user', content: promptUser },
      ],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new ApplicationError(`Mistral Chat Completion failed: ${response.status}`, { error: errText })
  }
  const d = await response.json()
  console.log('response.json()',d);
  

  return d
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!mistralKey) {
      throw new ApplicationError('Missing environment variable MISTRAL_KEY')
    }

    let { initialQuestion, contentDataset, promptType } = req.body

    let promptSystem = ''
    let promptUser = ''
    if (promptType === 'info') {
      promptSystem = oneLine`
      Du erhältst eine *Beschreibung* eines Datensatzes und eine *Frage*. Die *Frage* kann auch nur ein Begriff sein.
      Der Leser kennt die *Beschreibung* des Datensatzes, du sollst NICHT die Beschreibung erklären oder zusammenfassen.
      Dem Leser liegt bereits eine Tabelle vor, die alle Attribute enthält. Du sollt alle Fachbegriffe, Fremdwörter, Konzepte, Methoden und Abkürzungen, die für den Datensatz relevant sind, erklären. Nutze die ganze Zeit einfache Sprache, als würdest du dich an junge Personen richten.
      Nenne beispielhaft Nutzungsmöglichkeiten für diesen Datensatz. Mache keine Aufzählung, sondern nutze nur Fließtext. 
      Antworte anschließend auf die Frage: Warum ist dieser Datensatz relevant im Zusammenhang mit der *Frage*?
      Fasse dich kurz. Du darfst mit maximal 800 Zeichen Antworten! Erkläre NICHT die Begriffe WFS und WMS! Nutze KEINE Markdown-Formatierung wie "**" oder "*"!!.
      `
      promptUser = codeBlock`${oneLine`*Beschreibung*: ${contentDataset}`} ${oneLine`*Frage*:${initialQuestion}`}.`
    }

    if (promptType === 'attrDescription') {
      promptSystem = oneLine`Deine Rolle ist es, Menschen zu offenen Daten in Berlin freundlich zu informieren.
      Du erhältst eine *Beschreibung* eines Datensatzes. Es handelt sich immer um Geodaten aus Berlin. Oft sind Adressen, Postleitzahl und ähnliches enthalten oder eindeutige Kennziffern. 
      Basierend auf der *Beschreibung* sollen die Kürzel der 'Attribute' aus der Beschreibung NICHT 'Attribute Beschreibung'
      mit einer Kurzbeschreibung versehrt werden. Wenn du unsicher bist, nutze als Attribut Beschreibung 'unklar'. 
      Nutze für die Attribut Namen die GLEICHEN wie aus der *Beschreibung*. 
      Wenn ein Attribut Name 'geom' ist, nutze die Attribut Beschreibung 'Koordinaten des Objekts', wobei du 'Objekt' wenn möglich mit dem Objekt ersetzt, um das es in diesem Datensatz geht.
      Für 'gc_xwert' und 'gc_ywert' nutze 'geographische Länge oder X-Wert' und 'geographische Breite oder Y-Wert'.
      Antworte im JSON Format!: {
        {
          'Attribut Name 1':'Attribut Beschreibung 1',
          'Attribut Name 2':'Attribut Beschreibung 2'
          ...
        }
      }
      `
      promptUser = codeBlock`${oneLine`*Beschreibung*: ${contentDataset}`}.`
    }

    console.log('promptSystem: ', promptSystem)
    console.log('promptUser: ', promptUser)

    const completion = await createMistralChatCompletion(promptSystem, promptUser, mistralKey)

    res.status(200).json({ result: completion.choices[0] })
  } catch (error) {
    if (error instanceof ApplicationError) {
      console.error(`${error.message}: ${JSON.stringify(error.data)}`)
    } else {
      console.error(error)
    }
    return res.status(500).json({ error: 'There was an error processing your request' })
  }
}
