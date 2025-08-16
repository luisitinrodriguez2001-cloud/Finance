const apiKey = ''; // TODO: Replace with your OpenAI API key

// Track previous sanity check responses to ensure uniqueness
const sanityResponses = new Set();

async function sanityCheck() {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Return a random unique token.' }]
      })
    });

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text || sanityResponses.has(text)) return false;
    sanityResponses.add(text);
    return true;
  } catch (err) {
    console.error('Sanity check failed:', err);
    return false;
  }
}

async function askGPT() {
  const questionInput = document.getElementById('question-input');
  const answerDiv = document.getElementById('answer');
  const question = questionInput.value.trim();
  if (!question) return;

  answerDiv.textContent = 'Running sanity check...';
  const unique = await sanityCheck();
  if (!unique) {
    answerDiv.textContent = 'Sanity check failed: duplicate response from OpenAI.';
    return;
  }

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
