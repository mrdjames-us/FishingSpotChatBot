
import React, { useState, useEffect, useRef } from 'react';
import { Message, Location } from './types';
import { generateFishingResponse } from './services/geminiService';
import ChatBubble from './components/ChatBubble';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: "Fishing Spot Chat Bot Online. I am now scanning Instagram, X, and Facebook for the 5 most recent catches within a 30-mile radius. Where are we fishing today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<Location | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => console.warn("Location permission denied", error)
      );
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role === 'bot' ? 'model' : 'user' as const,
        parts: [{ text: msg.content }]
      }));

      const { text, links } = await generateFishingResponse(currentInput, history, location);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: text,
        timestamp: new Date(),
        groundingLinks: links
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: "Backend metadata extraction error. Ensure social media scrapers have clear visibility.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-100 overflow-hidden">
      <header className="bg-slate-900 text-white p-4 shadow-lg border-b border-blue-500/30 z-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center shadow-inner relative shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter italic">FISHING SPOT CHAT BOT</h1>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Metadata Extraction Backend v2.2</p>
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded text-[9px] font-bold text-slate-300 border border-slate-700 whitespace-nowrap">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              30-MILE RADIUS
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded text-[9px] font-bold text-slate-300 border border-slate-700 whitespace-nowrap">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              5-POST LIMIT
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded text-[9px] font-bold text-slate-300 border border-slate-700 whitespace-nowrap">
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
              SOCIAL SCAN
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <div className="flex gap-3 mb-6">
                <div className="w-4 h-4 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-700">Analyzing Recent Catches (30mi Limit)</p>
                <p className="text-[10px] uppercase font-bold text-blue-500">Filtering Top 5 Social Posts per Species...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-white border-t-4 border-blue-600 p-4 shadow-2xl">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute -top-10 left-0 bg-blue-600 text-white px-3 py-1 text-[10px] font-black uppercase rounded-t-lg">
            Investigation Command Center
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ex: 'Find recent Largemouth Bass catches' or 'Any Trout posts nearby?'..."
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-4 pr-12 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all resize-none shadow-inner"
            style={{ color: '#0f172a' }}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-3 bottom-4 p-2 rounded-lg transition-all ${
              !input.trim() || isLoading 
                ? 'text-slate-300' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        <div className="max-w-4xl mx-auto flex justify-between items-center mt-2 px-1">
          <p className="text-[10px] text-slate-500 tracking-tight">
            Scanning IG, X, FB | Radius: 30mi | Limit: 5 posts/species | Verified Wild Locations only.
          </p>
        </div>
      </footer >
    </div>
  );
};

export default App;
