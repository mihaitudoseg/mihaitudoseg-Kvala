
import React, { useState, useRef, useEffect } from 'react';
import { Wine, Send, Loader2, X } from 'lucide-react';
import { getSommelierRecommendation } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useMenu } from '../context/MenuContext';
import { motion, AnimatePresence } from 'motion/react';

export const Sommelier: React.FC = () => {
  const { menuItems } = useMenu();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Yassas! Sunt somelierul tău virtual Kvala. Spune-mi ce dorești să mănânci și îți voi recomanda vinul perfect din crama noastră.' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    // FILTRARE STRICTĂ: Trimitem DOAR produsele din categoria 'vinuri'
    const winesOnly = menuItems.filter(item => item.category === 'vinuri');

    try {
      const recommendation = await getSommelierRecommendation(userMsg, winesOnly);
      setMessages(prev => [...prev, { role: 'model', text: recommendation }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Îmi pare rău, am o problemă de conexiune. Vă rog întrebați ospătarul!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 sm:w-96 mb-4 overflow-hidden pointer-events-auto flex flex-col max-h-[500px]"
          >
            <div className="bg-greek-blue p-4 flex justify-between items-center text-white">
              <div className="flex items-center">
                <div className="bg-white/20 p-1.5 rounded-full mr-2 text-white">
                  <Wine className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm">Somelier Virtual Kvala</h3>
                  <p className="text-xs text-blue-100">Exclusiv Vinuri</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-gray-200 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 h-64 sm:h-80">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-greek-blue text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-3">
                   <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                      <Loader2 className="h-5 w-5 animate-spin text-greek-blue" />
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ce vin recomanzi la caracatiță?"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-greek-blue/50"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-greek-blue text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-greek-blue hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all transform flex items-center gap-2 group"
      >
        <Wine className="h-6 w-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-sm font-semibold">
          Recomandare Vin
        </span>
      </motion.button>
    </div>
  );
};
