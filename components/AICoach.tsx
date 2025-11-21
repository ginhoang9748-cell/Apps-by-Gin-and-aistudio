import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { ChatMessage, ThemeColor } from '../types';
import { getCoachResponse } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface AICoachProps {
    themeColor: ThemeColor;
}

const AICoach: React.FC<AICoachProps> = ({ themeColor }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Hi! I'm your FocusFlow Coach. How are you feeling about your progress today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await getCoachResponse(messages, input);
      const botMsg: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-${themeColor}-500 flex items-center justify-center`}>
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium">AI Habit Coach</h3>
            <p className={`text-${themeColor}-200 text-xs`}>Powered by Gemini</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user'
                  ? `bg-${themeColor}-600 text-white rounded-br-none`
                  : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 flex items-center gap-2">
              <Loader2 className={`w-4 h-4 animate-spin text-${themeColor}-500`} />
              <span className="text-xs text-slate-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for advice or motivation..."
            className={`flex-1 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none text-sm`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`bg-${themeColor}-600 text-white p-2 rounded-lg hover:bg-${themeColor}-700 transition-colors disabled:opacity-50`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICoach;