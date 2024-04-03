import OpenAI from 'openai'

const openAiKey = process.env.OPENAI_KEY
const openai = new OpenAI({
  apiKey: openAiKey,
})

import { codeBlock, oneLine } from 'common-tags'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!openAiKey) {
      throw new ApplicationError('Missing environment variable OPENAI_KEY')
    }

    let { initialQuestion, contentDataset, promptType } = req.body

    // console.log('contentDataset', req.body)

    // let prompt = codeBlock`
    // ${oneLine`
    //   Du bist ein Mitarbeiter der Servicestelle für Offene Daten Berlin, der es liebt, Menschen dabei zu helfen offene Datensätze (WFS-Dienste) zu erklären. Wenn dir eine Frage gestellt wird, beantworte diese auf Grundlage der inhhaltlichen Beschreibung des folgenden Datensatzes: ${oneLine`Beschreibung: ${contentDataset}`} ${oneLine`Frage:${initialQuestion}`}. Erkläre, warum die vorliegenden Daten für die gestellte Frage relevant sind oder relevant sein könnte, indem du die Frage in deiner Antwort wiederholst. Wenn du unsicher bist und die Antwort nicht explizit in der Beschreibung steht, versuche eine logische Erklärung zu finden, warum der gefundene Datensatz für die Frage relevant sein könnte. Danach stelle die fünf für die Frage relevantesten Datenattribute ausschließlich auf Grundlage der Beschreibung mit Kürzel und Kurzbeschreibung als Markdowntabelle dar. Erfinde NIEMALS Datenattribute!
    //   `}
    // `

    let promptSystem = ''
    let promptUser = ''
    if (promptType === 'info') {
      promptSystem = oneLine`Deine Rolle ist es, Menschen zu offenen Daten in Berlin freundlich zu informieren.
      Du erhälts eine *Beschreibung* eines Datensatzes und eine *Frage* dazu. Die Frage kann auch nur ein Begriff sein.
      Basierend auf der *Beschreibung* und der *Frage*, antworte in 3 knappen Sätzen warum der Datensatz ralevant für die Frage ist.
      `
      promptUser = codeBlock`${oneLine`*Beschreibung*: ${contentDataset}`} ${oneLine`*Frage*:${initialQuestion}`}.`
    }

    if (promptType === 'attrDescription') {
      promptSystem = oneLine`Deine Rolle ist es, Menschen zu offenen Daten in Berlin freundlich zu informieren.
      Du erhälts eine *Beschreibung* eines Datensatzes. 
      Basierend auf der *Beschreibung* sollen die Kürzel der 'Attribute' 
      mit einer Kurzbeschreibung versehrt werden aber NUR wo du dir sicher bist.
      Antworte im JSON Format!: {
        'attribute':{
          'Attribut 1':'Attribut Beschreibung 1',
          'Attribut 2':'Attribut Beschreibung 2'
          ...
        }
      }
      `
      promptUser = codeBlock`${oneLine`*Beschreibung*: ${contentDataset}`}.`
    }

    console.log('promptSystem: ', promptSystem)
    console.log('promptUser: ', promptUser)
    // const prompt = codeBlock`
    //   ${oneLine`
    //     Du bist ein Mitarbeiter der Servicestelle für Offene Daten Berlin, der es liebt, Menschen dabei zu helfen offene Datensätze (WFS-Dienste) zu erklären. Wenn dir eine Frage gestellt wird, beantworte diese auf Grundlage der inhhaltlichen Beschreibung des folgenden Datensatzes: ${oneLine`Beschreibung: ${contentDataset}`} ${oneLine`Frage:${initialQuestion}`}. Erkläre, warum die vorliegenden Daten für die gestellte Frage relevant sind oder relevant sein könnte, indem du die Frage in deiner Antwort wiederholst. Wenn du unsicher bist und die Antwort nicht explizit in der Beschreibung steht, versuche eine logische Erklärung zu finden, warum der gefundene Datensatz für die Frage relevant sein könnte. Danach stelle die fünf für die Frage relevantesten Datenattribute ausschließlich auf Grundlage der Beschreibung mit Kürzel und Kurzbeschreibung als Markdowntabelle dar. Erfinde NIEMALS Datenattribute!
    //     `}
    // `
    // Fasse die *Beschreibung*, Inhaltlich in 2 Sätzen zusammen.
    //       {'summary':'Deine Zusammenfassung'}

    // const promptSystem = oneLine`Deine Rolle ist es, Menschen zu offenen Daten in Berlin freundlich zu informieren.
    // Du erhälts ein *Beschreibung* eines Datensatzes und eine *Frage* dazu. Die Frage kann auch nur ein Begriff sein.
    // Basierend auf der *Beschreibung* und der *Frage*, antworte in 2 knappen Sätzen warum der Datensatz ralevant für die Frage ist.
    // Zusetzlich sollen die Kürzel der Datenattribute aus der *Beschreibung* mit einer Kurzbeschreibung versehrt werden aber NUR wo du dir sicher bist.
    // Antworte im JSON Format:{
    //   {'explanation': 'Dein Erklätext',
    //   {'attribute':{'Attributkürzel 1':'Kurzbeschreibung','Attributkürzel 2':'Kurzbeschreibung'}
    // }
    // `

    // const promptSystem = `Du erhälst eine *Beschreibung* eines Datensatzes von Usern
    // und eine *Frage*. Basierend auf die *Frage* des Users antworte warum der Datensatz
    // relevant ist um die Frage des Users zu beantowrten`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: promptSystem },
        { role: 'user', content: promptUser },
      ],
      stream: false,
    })

    // console.log('completioncompletioncompletion', completion)

    res.status(200).json({ result: completion.choices[0] })
  } catch (error) {}
}
