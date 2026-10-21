"use client";
import { useState, useRef, useEffect } from 'react';
import { X, Send, Paperclip, ArrowLeft, Bot, User, CheckCheck, MapPin, Wrench, Shield, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { cn } from '@/utils/utils';
import { ChatSheet, ChatSheetContent } from './ChatSheet';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  read?: boolean;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_ACTIONS = [
  { icon: MapPin, label: 'Track My Order' },
  { icon: Wrench, label: 'Book a Service' },
  { icon: Shield, label: 'AMC Plans' },
  { icon: Info, label: 'Product Information' },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hi! Welcome to Anant Enterprises. How can I help you today?',
    sender: 'agent',
    timestamp: new Date(Date.now() - 60000),
    read: true,
  },
];

export function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // Simulate agent typing and response
    setIsTyping(true);
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAgentResponse(inputValue),
        sender: 'agent',
        timestamp: new Date(),
        read: true,
      };
      setMessages((prev) => [...prev, agentResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAgentResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    if (msg.includes('order') || msg.includes('track')) {
      return 'You can track your order from the Profile page. Would you like me to help you with your order number?';
    } else if (msg.includes('service') || msg.includes('book')) {
      return 'I can help you book a service! We offer installation, maintenance, and repair services. Which service are you interested in?';
    } else if (msg.includes('amc') || msg.includes('plan')) {
      return 'Our AMC plans start from ₹999/year and include free filter replacement, priority service, and annual maintenance. Would you like to know more?';
    } else if (msg.includes('price') || msg.includes('cost')) {
      return 'Our water purifiers range from ₹8,999 to ₹24,999. Which type are you interested in - RO, UV, or Alkaline?';
    } else {
      return 'Thank you for your message! Our expert will assist you shortly. In the meantime, you can browse our products or check our FAQ section.';
    }
  };

  const handleQuickAction = (label: string) => {
    setInputValue(label);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <ChatSheet open={isOpen} onOpenChange={onClose}>
      <ChatSheetContent
        className="p-0"
        onOverlayClick={onClose}
      >
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#0B1F51] dark:bg-blue-600 text-white px-4 py-4 md:py-5 flex items-center justify-between shadow-md shrink-0 rounded-t-2xl">
            <div className="flex items-center gap-3">
              {/* Mobile Back Button */}
              <button
                onClick={onClose}
                className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative">
                <div className="w-10 h-10 bg-[#00C4CC] rounded-full flex items-center justify-center ring-2 ring-white/10">
                  <Bot className="w-5 h-5 text-[#0B1F51]" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] border-2 border-[#0B1F51] dark:border-blue-600 rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-[15px] md:text-base">Anant Support</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full inline-block"></span>
                  Online
                </p>
              </div>
            </div>

            {/* Desktop/Tablet Close Button */}
            <button
              onClick={onClose}
              className="hidden md:flex w-8 h-8 rounded-full hover:bg-white/10 items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#F9FBFD] dark:bg-slate-950 scroll-smooth">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.label)}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 group shadow-xs hover:shadow-md"
                >
                  <action.icon className="w-5 h-5 text-[#0B1F51] dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-medium text-[#475569] dark:text-gray-300 text-center leading-tight">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  {message.sender === 'agent' && (
                    <div className="w-8 h-8 rounded-full bg-[#00C4CC]/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-[#00C4CC]" />
                    </div>
                  )}

                  <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={cn(
                        "px-4 py-2.5 shadow-xs text-[14px] leading-relaxed",
                        message.sender === 'user'
                          ? "bg-[#0B1F51] dark:bg-blue-600 text-white rounded-card rounded-tr-[4px]"
                          : "bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white border border-gray-100 dark:border-slate-700 rounded-card rounded-tl-[4px]"
                      )}
                    >
                      {message.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start pl-11"
              >
                <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-4 py-3 rounded-card rounded-tl-[4px] shadow-xs">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shrink-0 pb-6 md:pb-4 rounded-b-2xl">
            <div className="flex items-center gap-2 bg-[#F8FAFC] dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700 px-2 py-2 focus-within:border-[#0B1F51] dark:focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-[#0B1F51]/10 transition-all">
              <button className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-gray-400 hover:text-[#0B1F51]">
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-[#0F172A] dark:text-white placeholder-gray-400 min-w-0"
              />

              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                size="icon"
                className="w-8 h-8 rounded-full bg-[#0B1F51] dark:bg-blue-600 hover:bg-[#00C4CC] text-white shrink-0 shadow-xs transition-all hover:scale-105"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </div>
          </div>
        </div>
      </ChatSheetContent>
    </ChatSheet>
  );
}
