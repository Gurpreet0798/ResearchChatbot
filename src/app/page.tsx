'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Academic Research Assistant</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-100 ml-auto max-w-[80%]'
                  : 'bg-white max-w-[80%]'
              }`}
            >
              <p className="text-gray-800">{message.content}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto p-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about academic research..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
} 

