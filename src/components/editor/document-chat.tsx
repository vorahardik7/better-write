'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useEditorStore } from '@/lib/store/editor-store';
import { Send, MessageSquare, Minimize2, Bot, User, GripVertical } from 'lucide-react';
import { useChat } from '@ai-sdk/react';

const formatAIMessage = (content: string) => {
  // Split by lines and process each line
  const lines = content.split('\n');
  const formattedLines: React.ReactNode[] = [];
  
  lines.forEach((line, index) => {
    // Skip empty lines
    if (line.trim() === '') {
      formattedLines.push(<br key={`br-${index}`} />);
      return;
    }
    
    // Handle numbered lists (1. 2. 3. etc.)
    const numberedMatch = line.match(/^(\d+\.\s)(.+)$/);
    if (numberedMatch) {
      formattedLines.push(
        <div key={`numbered-${index}`} className="flex gap-2 mb-2">
          <span className="font-semibold text-blue-600 flex-shrink-0">{numberedMatch[1]}</span>
          <span className="flex-1">{formatInlineText(numberedMatch[2])}</span>
        </div>
      );
      return;
    }
    
    // Handle bullet points
    const bulletMatch = line.match(/^[-*]\s(.+)$/);
    if (bulletMatch) {
      formattedLines.push(
        <div key={`bullet-${index}`} className="flex gap-2 mb-2">
          <span className="text-blue-600 flex-shrink-0">•</span>
          <span className="flex-1">{formatInlineText(bulletMatch[1])}</span>
        </div>
      );
      return;
    }
    
    // Handle headers (lines that end with : and are short)
    if (line.endsWith(':') && line.length < 60 && !line.includes(' ')) {
      formattedLines.push(
        <div key={`header-${index}`} className="font-semibold text-gray-800 mt-3 mb-2">
          {line}
        </div>
      );
      return;
    }
    
    // Regular paragraph
    formattedLines.push(
      <div key={`para-${index}`} className="mb-2">
        {formatInlineText(line)}
      </div>
    );
  });
  
  return formattedLines;
};

// Format inline text (bold, italics, etc.)
const formatInlineText = (text: string) => {
  // Handle **bold** text
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export function DocumentChat() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [chatWidth, setChatWidth] = useState(320); // 80 * 4 = 320px (w-80)
  const [isResizing, setIsResizing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { content } = useEditorStore();

  const chatHelpers = useChat();
  type ChatMessage = { id: string; role: 'user' | 'assistant' | 'system'; content: string };
  type ChatHelpersSubset = {
    messages?: ChatMessage[];
    append?: (
      message: { role: 'user' | 'assistant' | 'system'; content: string },
      options?: { body?: Record<string, unknown> }
    ) => Promise<void>;
    isLoading?: boolean;
    status?: 'idle' | 'streaming' | 'submitted' | string;
  };
  const helpers = chatHelpers as unknown as ChatHelpersSubset;
  const isLoading: boolean = helpers.isLoading ?? (helpers.status ? helpers.status !== 'idle' : false);

  // Add initial welcome message if no messages exist
  const displayMessages: ChatMessage[] = useMemo(() => {
    const base = helpers.messages || [];
    if (base.length === 0) {
      return [{
        id: 'welcome-1',
        role: 'assistant',
        content: "Hi! I'm your AI document assistant. I can help you improve your writing, answer questions about your content, or suggest new ideas. What would you like to work on together?"
      }];
    }
    return base;
  }, [helpers.messages]);

  // isLoading is already provided by useChat hook

  // Auto-scroll to bottom when new messages arrive or when typing
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [displayMessages, isLoading]);

  // Handle mouse resize
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = chatWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = startX - e.clientX;
      const newWidth = Math.max(280, Math.min(600, startWidth + diff));
      setChatWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!isExpanded) {
    return (
      <div className="w-16 bg-transparent flex flex-col items-center py-6">
        <button
          onClick={() => setIsExpanded(true)}
          className="btn-toolbar p-3"
          title="Open document chat"
        >
          <div className="btn-shadow"></div>
          <div className="btn-edge"></div>
          <div className="btn-front relative p-3">
            <MessageSquare className="w-5 h-5 text-blue-700" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full shadow-sm" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div 
      className="h-full flex bg-transparent relative"
      style={{ width: `${chatWidth}px` }}
    >
      {/* Resize Handle */}
      <div
        className={`w-1 bg-black/10 hover:bg-black/20 cursor-col-resize flex items-center justify-center group transition-colors ${
          isResizing ? 'bg-black/30' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3 h-3 text-gray-800" />
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header - minimal */}
        <div className="px-6 py-4 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-1.5 rounded-lg shadow-sm border border-blue-100">
                <MessageSquare className="w-4 h-4 text-blue-700" />
              </div>
              <div>
                <span className="font-semibold text-gray-900 text-sm">Document Chat</span>
                <p className="text-xs text-gray-600">AI assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="btn-toolbar"
              title="Minimize chat"
            >
              <div className="btn-shadow"></div>
              <div className="btn-edge"></div>
              <div className="btn-front">
                <Minimize2 className="w-4 h-4 text-gray-600" />
              </div>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-white"
        >
          {displayMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[85%] ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                {/* Avatar */}
                <div className={`p-1.5 rounded-lg flex-shrink-0 bg-white border border-gray-200 shadow-sm`}>
                  {message.role === 'user' ? (
                    <User className="w-3 h-3 text-gray-700" />
                  ) : (
                    <Bot className="w-3 h-3 text-gray-700" />
                  )}
                </div>

                {/* Message bubble */}
                <div className={`px-3 py-2 rounded-lg shadow-sm border ${
                  message.role === 'user'
                    ? 'bg-blue-50 text-gray-900 border-blue-100'
                    : 'bg-gray-50 text-gray-900 border-gray-200'
                } ${message.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                  {message.role === 'assistant' ? (
                    <div className="text-sm leading-relaxed">
                      {formatAIMessage(message.content || '')}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content || ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="bg-white border border-gray-200 p-1.5 rounded-lg flex-shrink-0 shadow-sm">
                  <Bot className="w-3 h-3 text-gray-700" />
                </div>
                <div className="bg-white rounded-lg rounded-bl-sm px-3 py-2 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-700">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Auto-scroll target */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 py-4 bg-white/95 backdrop-blur-sm border-t border-gray-100">
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (inputValue.trim()) {
              if (helpers.append) {
                await helpers.append({
                  role: 'user',
                  content: inputValue,
                }, {
                  body: {
                    documentContent: content
                  }
                });
              }
              setInputValue('');
            }
          }} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your document..."
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm transition-all duration-200 text-gray-900 placeholder-gray-400"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="btn-3d btn-primary btn-small disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="btn-shadow"></div>
                <div className="btn-edge"></div>
                <div className="btn-front px-3 py-2">
                  <Send className="w-4 h-4" />
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 