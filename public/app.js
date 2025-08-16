const chat = document.getElementById('chat');
const form = document.getElementById('form');
const input = document.getElementById('input');

const messages = [];

function append(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = `${role === 'user' ? 'You' : 'AI'}: ${text}`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  append('user', text);
  messages.push({ role: 'user', content: text });
  input.value = '';
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let assistant = '';
  append('assistant', '');
  const node = chat.lastChild;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop();
    for (const part of parts) {
      if (!part.startsWith('data:')) continue;
      const token = part.slice(5).trim();
      if (token === '[DONE]') {
        messages.push({ role: 'assistant', content: assistant });
        return;
      }
      assistant += token;
      node.textContent = `AI: ${assistant}`;
    }
  }
});
