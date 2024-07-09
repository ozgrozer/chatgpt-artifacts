# chatgpt-artifacts

Bring Claude's Artifacts feature to ChatGPT

## Preview

<img src="./preview/Screenshot 2024-06-28 at 7.57.19 PM.png" alt="" width="600" />

## Usage

Clone this repository

```
git clone https://github.com/ozgrozer/chatgpt-artifacts.git
```

Install dependencies

```
npm install
```

Duplicate `.env.example` as `.env` and add your OPEN AI API key

```
cp .env.example .env
vim .env
```

Build the app

```
npm run build
```

Start the app

```
npm start
```

## Ollama Support

To make it work with your local LLMs like Llama3 or Gemma2 you just need to make a simple update in the code.

Open `/pages/api/chat.js` file

```js
// change this
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
// to this
const openai = new OpenAI({
  baseURL: 'http://127.0.0.1:11434/v1'
})

// change this
const stream = await openai.chat.completions.create({
  stream: true,
  model: 'gpt-4o',
  messages: conversations[conversationId]
})
// to this
const stream = await openai.chat.completions.create({
  stream: true,
  model: 'llama3',
  messages: conversations[conversationId]
})
```

## License

[GPL-3.0](https://github.com/ozgrozer/chatgpt-artifacts/blob/main/license)
