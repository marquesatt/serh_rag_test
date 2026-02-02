
import React from 'react';
import { marked } from 'marked';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Renderiza Markdown com marked (bundle)
  const renderContent = (content: string) => {
    return { __html: marked.parse(content) as string };
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[92%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md
          ${isUser ? 'bg-slate-600 ml-3' : 'bg-blue-600 mr-3'}`}>
          <i className={`fas ${isUser ? 'fa-user' : 'fa-headset'} text-sm`}></i>
        </div>
        
        <div className={`mt-1`}>
          <div className={`px-5 py-4 rounded-2xl shadow-sm border
            ${isUser 
              ? 'bg-white text-slate-700 border-slate-200 rounded-tr-none' 
              : 'bg-white text-slate-800 border-blue-100 rounded-tl-none border-l-4 border-l-blue-500'}`}>
            
            <div 
              className="markdown-body text-[13px] md:text-sm leading-relaxed"
              dangerouslySetInnerHTML={renderContent(message.content)}
            />

            <div className={`text-[9px] mt-2 font-bold uppercase tracking-tighter opacity-30 ${isUser ? 'text-right' : 'text-left'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
              {isUser ? ' Você' : ' Sistema SERH'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
