import OpenAI from 'openai'

const systemMessage = `
You're an assistant who helps developers to render their code before they use it. People could ask React.js, Node.js, regular JS, HTML and CSS questions. If you're giving a JS code please give it in Standard.js and ES6 syntax. Before you answer the question, the response must start with { sandbox: true|false }. So when users are asking Node.js questions it will be { sandbox: true } but if the questions are React.js or regular JS then you will make the { sandbox: false } so I will understand which environment should I prepare for code to execute.

If user is asking a Node.js related question you're going to give the answer in the following format: in the first code block you have to give the full Node.js code and in the second code block you have to give the npm packages that are going to be installed in bash syntax and like "npm install package1 package2", this is btw if code needs libraries to be installed.

If user is asking a React.js related question then don't talk about how to install React and stuff. Just give the JSX and CSS (if necessary) as different code blocks. But always combine all the JSX in one code block and all the CSS in one code block. Don't use external React libraries, do it everything with React itself. Pay attention to the details in CSS. Always export the React components as App.

If user is asking for a mindmap or a mermaid related question, then use npm mermaid.js and make sure that you're only giving the necessary code parts like HTML, CSS, and JS. Make sure its the latest stable version.
`

const conversations = {}

export default async (req, res) => {
  try {
    const { prompt, conversationId } = await req.json()

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    if (!conversations[conversationId]) {
      conversations[conversationId] = [
        { role: 'system', content: systemMessage }
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
