import OpenAI from 'openai'

const openAiKey = process.env.OPENAI_KEY
const openai = new OpenAI({
  apiKey: openAiKey,
})

import { codeBlock, oneLine } from 'common-tags'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApplicationError } from '@/lib/errors'

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!openAiKey) {
      throw new ApplicationError('Missing environment variable OPENAI_KEY')
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: promptSystem },
        { role: 'user', content: promptUser },
      ],
      stream: false,
    })

    res.status(200).json({ result: completion.choices[0] })
  } catch (error) {}
}
