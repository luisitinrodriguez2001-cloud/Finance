# Stand-alone Browser AI

The project now ships with a self-contained chat assistant that runs entirely in the browser.  It uses the open-source [`@xenova/transformers`](https://github.com/xenova/transformers.js) library to load a small language model and generate replies without any API keys or external servers.

```
Browser (WebAssembly/WebGPU)
      │
      ▼
Local model weights
```

On first use the model weights are downloaded from Hugging Face's CDN and cached by the browser.  All subsequent prompts run locally, keeping data on the user's machine.

## Usage

1. Open `index.html` in a modern browser.  (WebGPU or WebAssembly support is recommended for best performance.)
2. Type a question into the **Ask AI** box and press **Ask**.
3. The model loads on first use and then generates a response directly in the page.

## Optional: Self-hosted Backends

The previous proxy setup (Express server talking to Ollama, vLLM, or other OpenAI-compatible backends) is still included for developers who want to run larger models or offload inference.  See earlier versions of this document for detailed instructions on configuring the proxy and backends.

## References

See [research_sources.md](research_sources.md) for detailed source excerpts and access dates.
