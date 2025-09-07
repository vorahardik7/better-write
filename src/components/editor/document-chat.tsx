'use client';

import React, { useState, useRef, useEffect } from 'react';
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

  // Add initial welcome message if no messages exist
  const displayMessages = (chatHelpers.messages || []).length === 0 ? [
    {
      id: '1',
      role: 'assistant' as const,
      content: "Hi! I'm your AI document assistant. I can help you improve your writing, answer questions about your content, or suggest new ideas. What would you like to work on together?"
    }
  ] : (chatHelpers.messages || []);

  // isLoading is already provided by useChat hook

  // Auto-scroll to bottom when new messages arrive or when typing
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [displayMessages, (chatHelpers as any).isLoading]);

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
        className={`w-1 bg-blue-200/50 hover:bg-blue-300 cursor-col-resize flex items-center justify-center group transition-colors ${
          isResizing ? 'bg-blue-400' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3 h-3 text-blue-600" />
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col">
        {/* Clean Chat Header */}
        <div className="px-6 py-4 bg-white/95 backdrop-blur-sm border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-semibold text-blue-900 text-sm">Document Chat</span>
                <p className="text-xs text-blue-700">AI assistant</p>
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
                <Minimize2 className="w-4 h-4 text-blue-600" />
              </div>
            </button>
          </div>
        </div>

        {/* Messages - Clean scrolling area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-blue-50/40 backdrop-blur-sm"
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
                <div className={`p-1.5 rounded-lg flex-shrink-0 shadow-sm ${
                  message.role === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-blue-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-3 h-3 text-white" />
                  ) : (
                    <Bot className="w-3 h-3 text-white" />
                  )}
                </div>

                {/* Message bubble */}
                <div className={`px-3 py-2 rounded-lg shadow-sm backdrop-blur-sm ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-800 border border-blue-200'
                } ${message.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                  {message.role === 'assistant' ? (
                    <div className="text-sm leading-relaxed">
                      {formatAIMessage((message as any).content || '')}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {(message as any).content || ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {(chatHelpers as any).isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg flex-shrink-0 shadow-sm">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-white backdrop-blur-sm rounded-lg rounded-bl-sm px-3 py-2 shadow-sm border border-blue-200">
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
                    <span className="text-xs text-slate-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Auto-scroll target */}
          <div ref={messagesEndRef} />
        </div>

        {/* Clean Input Area */}
        <div className="px-4 py-4 bg-white/95 backdrop-blur-sm border-t border-blue-100">
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (inputValue.trim()) {
              const append = (chatHelpers as any).append;
              if (append) {
                await append({
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
                className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 text-sm shadow-sm transition-all duration-200 text-slate-800 placeholder-blue-400"
                disabled={(chatHelpers as any).isLoading || false}
              />

              <button
                type="submit"
                disabled={!inputValue.trim() || (chatHelpers as any).isLoading || false}
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