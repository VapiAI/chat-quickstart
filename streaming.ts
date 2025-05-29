import 'dotenv/config';

export {};

async function streamChat(input: string) {
  const response = await fetch('https://api.vapi.ai/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assistantId: '2abd3196-bfec-4f25-9131-8ec04328be95',
      input: input,
      stream: true
    })
  });

  const reader = response.body?.getReader();
  if (!reader) return;
  
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.path && data.delta) {
          process.stdout.write(data.delta);
        }
      }
    }
  }
}

await streamChat('Can you write me a poem about Vapi');