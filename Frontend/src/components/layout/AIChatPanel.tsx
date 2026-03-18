import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, List, Share2, GitMerge, Brain } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatPanel({ isOpen, onClose }: AIChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSendMessage = async (textOverride?: string) => {
    const messageText = textOverride || input.trim();
    if (!messageText || sending) return;

    if (!textOverride) setInput('');
    setSaving(true);

    const newMessage: Message = { sender: 'user', text: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);

    try {
      const history = messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
      }));

      const response = await api.post('/ai/chat', { 
         message: messageText,
         history: history
      });

      const reply = response.data.data?.reply || response.data.reply || "No reply from AI.";
      setMessages(prev => [...prev, { sender: 'ai', text: reply, timestamp: new Date() }]);

    } catch (error) {
      console.error("AI chat error:", error);
      setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I am facing an issue connecting right now. Please check if rules or keys loaded properly.", timestamp: new Date() }]);
    } finally {
      setSaving(false);
    }
  };

  const presetActions = [
    { text: "Explain Admin Rules" },
    { text: "GitHub Command Guide" }
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 h-[550px] w-[350px] bg-cover bg-center bg-no-repeat text-white shadow-2xl rounded-[32px] z-[70] flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 border border-white/5"
      style={{ backgroundImage: "url('https://i.pinimg.com/736x/a7/39/a3/a739a3ef56900f946964a6a556f43661.jpg')" }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/10 z-0" />
      
      {/* Scrollable Container containing z-10 for child layouts */}
      <div className="flex-1 flex flex-col relative z-10 h-full">
      
      {/* Header Profile */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg flex-shrink-0 z-10 bg-zinc-900 flex items-center justify-center">
             <img src="https://mcheads.ru/heads/medium/front/zfnr.png" className="w-full h-full object-cover" alt="avatar" />
          </div>
          <div className="z-10">
             <h4 className="text-2xl font-black text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]">Hello</h4>
             <p className="text-sm font-bold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{user?.fullName || user?.username || "Agent"}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white hover:text-white transition-colors z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            <X className="w-5 h-5 flex-shrink-0" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6">
         
         {messages.length === 0 ? (
             <div className="flex-1 flex flex-col justify-center items-center">
                 <h2 className="text-3xl font-black text-white text-center leading-tight mb-12 tracking-wide drop-shadow-[0_3px_5px_rgba(0,0,0,0.95)]">
                     How can I help<br />you today?
                 </h2>
             </div>
         ) : (
             <div className="space-y-4">
                 {messages.map((m, idx) => (
                      <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {m.sender === 'ai' && (
                               <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center mt-1 flex-shrink-0">
                                   <img src="/ai.png" className="w-4 h-4 object-contain" alt="ai" />
                               </div>
                          )}
                          <div className={`p-3 p-4 rounded-2xl max-w-[85%] break-words border ${
                            m.sender === 'user' 
                              ? 'bg-blue-700 border-blue-600 text-white rounded-br-sm' 
                              : 'bg-zinc-900/60 border-white/5 text-gray-200 rounded-bl-sm backdrop-blur-lg'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</p>
                          </div>
                      </div>
                 ))}
                 {sending && (
                      <div className="flex gap-3 justify-start">
                         <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center mt-1 flex-shrink-0">
                              <img src="/ai.png" className="w-4 h-4 object-contain" alt="ai" />
                         </div>
                         <div className="p-3 bg-zinc-800/50 border border-white/5 rounded-2xl flex items-center gap-1.5 backdrop-blur-md">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100" />
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200" />
                         </div>
                      </div>
                 )}
                 <div ref={messagesEndRef} />
             </div>
         )}

      </div>

      {/* Wolf Gif Above typing box */}
      <div className="px-6 flex justify-center -mb-12 z-10">
          <img src="/wolf-minecraft.gif" className="w-[140px] h-[140px] object-contain" alt="wolf" />
      </div>

      {/* Input Outer */}
      <div className="p-6 bg-transparent">
          <div className="w-full bg-[#18181b]/80 border border-white/5 focus-within:border-blue-500/30 rounded-full backdrop-blur-xl flex items-center px-4 py-2 group transition-all">
              <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage() }}
                  className="w-full bg-transparent text-sm focus:outline-none placeholder:text-zinc-500 text-white fill-none py-2 px-1"
                  placeholder="Ask me anything..."
              />
              <button 
                  onClick={() => handleSendMessage()}
                  disabled={sending || !input.trim()}
                  className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-all shadow-lg flex-shrink-0"
              >
                  <Send className="w-4 h-4" />
              </button>
          </div>
      </div>

      </div>
    </div>
  );
}
