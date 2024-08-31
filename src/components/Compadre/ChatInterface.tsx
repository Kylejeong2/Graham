"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/Common/Button';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Props = {
    user: {
        id: string;
        firstName: string | null;
        lastName: string | null;
    } | null;  
    compadreName: string;
    compadreId: string;
    characteristics: string;
};

const MAX_CONTEXT_MESSAGES = 10; // Adjust as needed

export const ChatInterface: React.FC<Props> = ({ user, compadreName, compadreId, characteristics }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getContextWindow = (messages: Message[]): Message[] => {
    return messages.slice(-MAX_CONTEXT_MESSAGES);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const contextWindow = getContextWindow(updatedMessages);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user, 
          message: input,
          messages: contextWindow, 
          compadreId, 
          characteristics, 
          compadreName 
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.message };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-4 py-2 mx-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        //   disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={isLoading}
          className="rounded-lg bg-blue-500 text-white"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
};