import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Bot, User, MessageCircle, Sparkles } from 'lucide-react';
import { sendChat, getTrips, getChatHistory } from '../services/api';
import type { ChatMessage } from '../types';

const QUICK_PROMPTS = [
  'Best local restaurants nearby?',
  'Hidden gems tourists miss?',
  'Safest neighborhoods to stay?',
  'Public transport tips?',
  'Best time to visit main attractions?',
  'Local customs I should know?',
  'Budget saving tips?',
  'Day trip options nearby?',
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: '#c8956c' }}>
        <Bot size={16} className="text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex gap-1.5 items-center h-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-slate-400 typing-dot"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, index }: { msg: ChatMessage; index: number }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0`}
        style={
          isUser
            ? { background: '#b8847c' }
            : { background: '#c8956c' }
        }
      >
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
      </div>
      <div className={`max-w-[80%] space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'rounded-br-sm text-white'
              : 'rounded-bl-sm text-slate-200'
          }`}
          style={
            isUser
              ? { background: '#2a2825' }
              : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }
          }
        >
          {msg.content}
        </div>
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {msg.sources.map((source) => (
              <span key={source} className="text-xs px-2 py-0.5 rounded-full text-slate-500"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                📚 {source}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Chat() {
  const [searchParams] = useSearchParams();
  const tripIdParam = searchParams.get('tripId');
  const [selectedTripId, setSelectedTripId] = useState<number | undefined>(
    tripIdParam ? Number(tripIdParam) : undefined
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI travel assistant powered by Gemini and RAG knowledge base. Ask me anything about your destination — attractions, food, tips, budget advice, or anything else!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: trips } = useQuery({
    queryKey: ['trips'],
    queryFn: getTrips,
  });

  // Load chat history when trip changes
  useQuery({
    queryKey: ['chatHistory', selectedTripId],
    queryFn: () => getChatHistory(selectedTripId!),
    enabled: !!selectedTripId,
    onSuccess: (data: any) => {
      if (data?.history && data.history.length > 0) {
        const historyMessages: ChatMessage[] = data.history.map((m: any) => ({
          role: m.role,
          content: m.content,
          sources: m.sources,
        }));
        setMessages([messages[0], ...historyMessages]);
      }
    },
  } as any);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || isTyping) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msgText }]);
    setIsTyping(true);

    try {
      const response = await sendChat(msgText, selectedTripId);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.response, sources: response.sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentTrip = trips?.find((t) => t.id === selectedTripId);

  return (
    <div className="min-h-screen pt-16 flex" style={{ background: '#111111' }}>
      {/* Sidebar */}
      <div
        className="w-64 flex-shrink-0 flex flex-col border-r"
        style={{
          background: '#1a1a1a',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={18} className="text-brand-blue" />
            <span className="font-bold text-white">Travel Chat</span>
          </div>

          {/* Trip selector */}
          <select
            value={selectedTripId || ''}
            onChange={(e) => setSelectedTripId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full text-sm rounded-lg px-3 py-2 outline-none"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f1f5f9',
            }}
          >
            <option value="">General travel advice</option>
            {trips?.map((trip) => (
              <option key={trip.id} value={trip.id}>{trip.destination} ({trip.num_days}d)</option>
            ))}
          </select>

          {currentTrip && (
            <div className="mt-2 px-2 py-1.5 rounded-lg text-xs text-slate-400"
              style={{ background: 'rgba(200,149,108,0.06)', border: '1px solid rgba(200,149,108,0.15)' }}>
              Context: <span className="text-brand-blue">{currentTrip.destination}</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs text-slate-500 font-medium mb-3 uppercase tracking-wider">Quick Questions</p>
          <div className="space-y-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                disabled={isTyping}
                className="w-full text-left text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Sparkles size={11} className="inline mr-1.5 text-brand-blue" />
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center gap-3"
          style={{ background: 'rgba(26,26,26,0.9)', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: '#c8956c' }}>
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-white text-sm">AI Travel Assistant</div>
            <div className="text-xs text-slate-400">
              {currentTrip ? `Answering about ${currentTrip.destination}` : 'General travel advice · Powered by Gemini + RAG'}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#7daea8' }} />
            <span className="text-xs text-slate-400">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} index={i} />
            ))}
          </AnimatePresence>
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          className="p-4 border-t"
          style={{ background: 'rgba(26,26,26,0.95)', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="flex gap-3 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentTrip ? `Ask about ${currentTrip.destination}...` : 'Ask anything about travel...'}
              className="flex-1 px-4 py-3 rounded-xl text-white placeholder-slate-500 outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              disabled={isTyping}
            />
            <motion.button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              whileHover={{ scale: input.trim() && !isTyping ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
              style={{
                background: input.trim() && !isTyping
                  ? '#c8956c'
                  : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {isTyping
                ? <Loader2 size={18} className="animate-spin text-slate-400" />
                : <Send size={18} className={input.trim() ? 'text-white' : 'text-slate-500'} />
              }
            </motion.button>
          </div>
          <p className="text-xs text-slate-600 mt-2 text-center">
            Powered by Google Gemini + ChromaDB RAG knowledge base
          </p>
        </div>
      </div>
    </div>
  );
}
