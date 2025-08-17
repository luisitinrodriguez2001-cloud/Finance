# Finance Chat

A simple Express server for streaming chat responses from Ollama or any OpenAI-compatible provider.

## Environment variables

Create a `.env` file based on `.env.example` with the variables:

- `PROVIDER` – set to `openai` to use OpenAI or leave as `ollama` (default).
- `MODEL` – model name, e.g., `gpt-3.5-turbo`.
- `OPENAI_API_KEY` – required when `PROVIDER=openai`.
- `OPENAI_COMPAT_URL` – optional base URL for OpenAI-compatible APIs (`https://api.openai.com/v1` by default).
- `OLLAMA_URL` – optional base URL for Ollama (`http://localhost:11434` by default).
- `PORT` – port for the local server (defaults to `3000`).

## Development

Install dependencies and run the server:

```
npm install
npm run dev
```

Send chat messages to `POST /api/chat` with a JSON body containing a `messages` array in OpenAI format.
