
import React from 'react';
import { Message } from '../types';
import GroundingResults from './GroundingResults';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isBot = message.role === 'bot';

  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
        <div 
          className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
            isBot 
              ? 'bg-white text-slate-800 rounded-tl-none border border-slate-100' 
              : 'bg-blue-600 text-white rounded-tr-none'
          }`}
        >
          {isBot && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                Live Social Media Scan Active
              </span>
            </div>
          )}

          <div className="prose prose-sm max-w-none">
            {message.content.split('\n').map((line, i) => (
              <p key={i} className={i > 0 ? 'mt-2' : ''}>
                {line}
              </p>
            ))}
          </div>
          
          {isBot && message.groundingLinks && message.groundingLinks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-50">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-2">Verified Social Signal Locations:</span>
              <GroundingResults links={message.groundingLinks} />
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-400 mt-1 px-1 uppercase tracking-wider font-semibold">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;
