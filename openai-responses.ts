import 'dotenv/config';
import OpenAI from 'openai';

export {};

const openai = new OpenAI({
  apiKey: process.env.VAPI_API_KEY!,
  baseURL: 'https://api.vapi.ai/chat'
});

const response = await openai.responses.create({
  model: 'gpt-4o',
  input: 'What is Vapi?',
  stream: false,
  assistantId: '2abd3196-bfec-4f25-9131-8ec04328be95',
} as any);

// @ts-ignore
console.log(response.output[0].content[0].text); 