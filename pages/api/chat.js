import OpenAI from 'openai'

export default async (req, res) => {
  try {
    const { prompt } = await req.json()

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const stream = await openai.chat.completions.create({
      stream: true,
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }]
    })

    return new Response(
      new ReadableStream({
        async start (controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || ''
              if (content) {
                controller.enqueue(new TextEncoder().encode(content))
              }
            }
          } catch (error) {
            console.log('Error in stream processing:', error)
            controller.error(error)
          } finally {
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
