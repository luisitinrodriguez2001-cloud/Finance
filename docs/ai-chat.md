# Local AI Chat Partner

Adding an open-source chat assistant to a website is now possible with free tools.  A browser sends messages to a small proxy server which in turn talks to a local inference engine.  This keeps data on your machine and avoids API keys or cloud services.  By default this project uses [Ollama](https://ollama.com) so models can run entirely on the CPU, but the proxy can also talk to any OpenAI-compatible server.

Self-hosted backends vary in speed and requirements.  **vLLM** delivers high throughput through techniques such as PagedAttention and supports many GPU types【F:docs/research_sources.md†L4-L5】.  The **llama.cpp** server runs with minimal dependencies and can use CPUs or GPUs with an OpenAI-compatible endpoint at `/v1/chat/completions`【F:docs/research_sources.md†L8-L9】.  **Ollama** is a lightweight framework for running models locally and can load them fully on the CPU or split between CPU and GPU【F:docs/research_sources.md†L12-L13】.  Choose the backend that fits your hardware and latency needs.

```
Browser ---HTTP---> Proxy (Express) ---HTTP---> Inference Server
```
## Backend Options

| Server | Pros | Cons |
|-------|------|------|
| vLLM | High throughput via PagedAttention and broad hardware support【F:docs/research_sources.md†L4-L5】 | Requires GPU setup for best latency |
| llama.cpp | Runs without external deps and can mix CPU/GPU inference【F:docs/research_sources.md†L8-L9】 | Slower on CPU and manual builds |
| Ollama | Lightweight local framework; CPU or GPU loading【F:docs/research_sources.md†L12-L13】 | Models must be pulled in advance |


## Setup

1. **Install a backend**
   - **Ollama (default CPU-friendly option)**
     - Install: `curl -fsSL https://ollama.com/install.sh | sh`
     - Pull a model: `ollama pull llama2`
     - Start server: `ollama serve`
   - **OpenAI-compatible server (vLLM or llama.cpp)**
     - Launch vLLM or `llama-server` so it exposes `/v1/chat/completions`.
2. **Configure environment**
   - Copy `.env.example` to `.env` and adjust as needed.
     - `PROVIDER=ollama` or `openai_compat`
     - `MODEL=llama2` (or another model)
     - `OLLAMA_URL` or `OPENAI_COMPAT_URL` for the backend address
3. **Run the proxy and web client**
   ```bash
   npm install
   npm run dev
   # open http://localhost:3000 in a browser
   ```

## Validation

| Check | Ollama | OpenAI-compatible |
|------|--------|------------------|
| Backend running | `ollama serve` | custom server listens on `/v1/chat/completions` |
| Model available | `ollama pull llama2` | model path configured |
| Test streaming | `curl -N -d '{"messages":[{"role":"user","content":"Hello"}]}' -H "Content-Type: application/json" http://localhost:3000/api/chat` |

Example output (streaming):
```
You: Hello
AI: Hi there!
```

## Originality

Unlike common OpenAI boilerplates, this project:
- Works with **two provider types** (Ollama and any OpenAI-compatible server).
- Proxies all requests through **SSE** without API keys.
- Emphasizes a **local-first** workflow so everything runs on personal hardware.

## References

See [research_sources.md](research_sources.md) for detailed source excerpts and access dates.
