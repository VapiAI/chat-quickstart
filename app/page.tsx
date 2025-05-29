'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add empty assistant message that we'll update as we stream
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.delta) {
                accumulatedContent += data.delta;
                // Update the last message (assistant message) with accumulated content
                setMessages(prev => {
                  const newMessages = [...prev];
                  if (newMessages.length > 0) {
                    newMessages[newMessages.length - 1] = {
                      ...newMessages[newMessages.length - 1],
                      content: accumulatedContent
                    };
                  }
                  return newMessages;
                });
              }
            } catch (parseError) {
              console.error('Failed to parse streaming data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      // Update the last message with error
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages.length > 0) {
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: 'Sorry, I encountered an error. Please try again.'
          };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-32">
              <div className="text-4xl font-light mb-4">Chat</div>
              <p className="text-lg">Start a conversation</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xl px-6 py-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 px-6 py-4 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message..."
                className="w-full resize-none border-0 bg-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                rows={1}
                disabled={isLoading}
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gray-900 text-white p-3 rounded-2xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
