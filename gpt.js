const apiKey = ''; // TODO: Replace with your OpenAI API key

async function askGPT() {
  const questionInput = document.getElementById('question-input');
  const answerDiv = document.getElementById('answer');
  const question = questionInput.value.trim();
  if (!question) return;

  answerDiv.textContent = 'Thinking...';

  try {
    // Use the general OpenAI chat model so the AI always provides a reply
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: question }]
      })
    });

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    answerDiv.textContent = text || "I'm not sure, but I couldn't find an answer.";
  } catch (err) {
    answerDiv.textContent = 'Error: ' + err.message;
  }
}

document.getElementById('ask-btn')?.addEventListener('click', askGPT);
