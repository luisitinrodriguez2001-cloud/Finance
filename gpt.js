let generator;

async function loadModel() {
  const answerDiv = document.getElementById('answer');
  try {
    answerDiv.textContent = 'Loading model...';
    const transformers = window.transformers;
    if (!transformers || typeof transformers.pipeline !== 'function') {
      throw new Error('Transformers library not loaded');
    }
    generator = await transformers.pipeline('text-generation', 'Xenova/gpt2');
  } catch (err) {
    answerDiv.textContent = 'Failed to load model: ' + err.message;
    throw err;
  }
}

async function askGPT() {
  const questionInput = document.getElementById('question-input');
  const answerDiv = document.getElementById('answer');
  const question = questionInput.value.trim();
  if (!question) return;

  try {
    if (!generator) {
      await loadModel();
    } else {
      answerDiv.textContent = 'Thinking...';
    }
    const result = await generator(question, { max_new_tokens: 100 });
    const text = result?.[0]?.generated_text?.trim();
    answerDiv.textContent = text || "I don't have an answer.";
  } catch (err) {
    answerDiv.textContent = 'Error: ' + err.message;
  }
}

document.getElementById('ask-btn')?.addEventListener('click', askGPT);
