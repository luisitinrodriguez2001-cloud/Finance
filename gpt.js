const apiKey = ''; // TODO: Replace with your OpenAI API key

async function askGPT() {
  const questionInput = document.getElementById('question-input');
  const answerDiv = document.getElementById('answer');
  const question = questionInput.value.trim();
  if (!question) return;

  answerDiv.textContent = 'Thinking...';

  try {
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        input: question
      })
    });

    const data = await res.json();
    const text = data?.output?.[0]?.content?.[0]?.text?.value || 'No answer';
    answerDiv.textContent = text;
  } catch (err) {
    answerDiv.textContent = 'Error: ' + err.message;
  }
}

document.getElementById('ask-btn')?.addEventListener('click', askGPT);
