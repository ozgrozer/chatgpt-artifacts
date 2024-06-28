import OpenAI from 'openai'

const conversations = {}

export default async (req, res) => {
  try {
    const { prompt, conversationId } = await req.json()

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    if (!conversations[conversationId]) {
      conversations[conversationId] = [
        { role: 'system', content: 'If user is asking for a React.js related question then don\'t talk about how to install React and stuff. Just give the jsx and css (if necessary) as different code blocks. But always combine all the jsx in one code block and all the css in one code block. Don\'t use external React libraries, do it everything with React itself. Pay attention to the details in css. Always export the React components as App. Don\'t mix up React.js and regular JS questions.' }
      ]
    }

    conversations[conversationId].push({ role: 'user', content: prompt })

    const stream = await openai.chat.completions.create({
      stream: true,
      model: 'gpt-4o',
      messages: conversations[conversationId]
    })

    let assistantMessage = ''
    return new Response(
      new ReadableStream({
        async start (controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || ''
              if (content) {
                assistantMessage += content
                controller.enqueue(new TextEncoder().encode(content))
              }
            }
          } catch (error) {
            console.log('Error in stream processing:', error)
            controller.error(error)
          } finally {
            conversations[conversationId].push({ role: 'assistant', content: assistantMessage })
            controller.close()
          }
        }
      }),
      {
        headers: {
          Connection: 'keep-alive',
          'Cache-Control': 'no-cache',
          'Content-Type': 'text/event-stream'
        }
      }
    )
  } catch (err) {
    console.log('Error in API route:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export const config = {
  runtime: 'edge'
}
