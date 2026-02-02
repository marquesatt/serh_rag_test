import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from './types';
import { geminiService } from './services/geminiService';
import ChatMessage from './components/ChatMessage';

const SUGGESTIONS = [
  "Como vendo dias de férias?",
  "Regras do teletrabalho",
  "Prazo auxílio saúde",
  "O que é o projeto SERH?"
];

interface AppProps {
  widgetWidth?: string;
  widgetHeight?: string;
}

const App: React.FC<AppProps> = ({ widgetWidth = '480px', widgetHeight = '700px' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Bem-vindo ao Atendimento SERH. Sou seu assistente para dúvidas sobre regras de RH, benefícios e sistemas. Como posso ajudar você hoje?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mediaQuery.matches);
    update();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    // Fallback para navegadores antigos
    // @ts-ignore
    mediaQuery.addListener(update);
    // @ts-ignore
    return () => mediaQuery.removeListener(update);
  }, []);

  const handleSendMessage = useCallback(async (text?: string) => {
    const messageToSend = text || inputValue;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const assistantMessageId = (Date.now() + 1).toString();
      let currentContent = '';
      
      const apiHistory = messages
        .filter(msg => msg.id !== 'welcome')
        .map(msg => ({
          role: (msg.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
          parts: [{ text: msg.content }]
        }));

      const stream = geminiService.streamChat(messageToSend, apiHistory);
      
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      for await (const chunk of stream) {
        currentContent += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId ? { ...msg, content: currentContent } : msg
        ));
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: 'Ocorreu um erro ao consultar a base de regras. Tente novamente.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages]);

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50 animate-bounce"
          aria-label="Abrir chat"
        >
          <i className="fas fa-comments text-2xl"></i>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 w-[95vw] h-[90vh] flex flex-col bg-white shadow-2xl rounded-2xl border border-slate-200 overflow-hidden z-50 animate-slide-up"
          style={isMobile ? undefined : { width: widgetWidth, height: widgetHeight }}
        >
          {/* Top Bar */}
          <header className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <img src="/SERH.png" alt="SERH" className="w-10 h-8" />
              <div>
                <h1 className="font-bold text-base tracking-tight">Suporte SERH</h1>
                <p className="text-[9px] text-blue-300 font-bold uppercase tracking-widest">Assistente Virtual</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-slate-700 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              aria-label="Fechar chat"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </header>

          {/* Main Chat Area */}
          <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 text-slate-400 text-xs mt-2 ml-10">
                  <i className="fas fa-search animate-spin"></i>
                  <span>Consultando manuais do SERH...</span>
                </div>
              )}
            </div>

            {/* Suggestions Bar */}
            {messages.length === 1 && (
              <div className="p-4 flex flex-wrap gap-2 justify-center animate-fade-in">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(s)}
                    className="bg-white border border-slate-200 px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </main>

          {/* Input Form */}
          <footer className="p-4 bg-white border-t border-slate-200">
            <div className="max-w-4xl mx-auto relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Qual sua dúvida sobre as regras do RH?"
                className="w-full bg-slate-100 border-none rounded-xl py-4 pl-6 pr-16 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 disabled:bg-slate-300 transition-colors shadow-lg"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
            <div className="mt-2 text-center">
              <span className="text-[10px] text-slate-400 font-medium">
                <i className="fas fa-info-circle mr-1"></i>
                Respostas baseadas nas regras oficiais do SERH (Manual RAG)
              </span>
            </div>
          </footer>
        </div>
      )}
    </>
  );
};

export default App;
