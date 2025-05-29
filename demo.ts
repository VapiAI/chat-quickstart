import 'dotenv/config';
import { VapiClient } from '@vapi-ai/server-sdk';

export {};

const client = new VapiClient({ 
  token: process.env.VAPI_API_KEY! 
});

const chat = await client.chats.create({
  assistantId: '2abd3196-bfec-4f25-9131-8ec04328be95',
  input: 'How do I get started with vapi docs?'
});

console.log(chat);
  
  