import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Database, Bot, User, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = "http://localhost:8000";

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello sir. Jarvis is online. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [ingestText, setIngestText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [serverStatus, setServerStatus] = useState('unknown'); // online, offline, checking
  const messagesEndRef = useRef(null);

  const checkServer = async () => {
    try {
      await axios.get(`${API_URL}/`);
      setServerStatus('online');
    } catch (e) {
      setServerStatus('offline');
    }
  };

  useEffect(() => {
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, { message: userMsg.content });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (error) {
      console.error(error);
      const errMsg = error.response ? 
        `Error: ${error.response.data.detail}` : 
        "Network Error: Ensure backend is running on port 8000.";
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `⚠️ **System Alert**: ${errMsg}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIngest = async () => {
    if (!ingestText.trim()) return;
    setIsIngesting(true);
    try {
      await axios.post(`${API_URL}/ingest`, { text: ingestText });
      alert("Memory Update Successful");
      setIngestText('');
    } catch (error) {
      alert("Failed to ingest data: " + error.message);
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Memory Bank */}
      <div className="w-80 glass-panel m-4 mr-0 flex flex-col p-6 space-y-6 hidden md:flex">
        <div className="flex items-center space-x-3 text-accent-color mb-4">
          <Database className="w-6 h-6" style={{ color: 'var(--accent-color)' }} />
          <h2 className="text-xl font-bold text-white">Memory Core</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <p className="text-sm text-gray-400 mb-2">Ingest new knowledge here.</p>
          <textarea 
            className="w-full h-64 bg-slate-800/50 text-white p-3 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none resize-none transition-all"
            placeholder="Paste text to add to vector database..."
            value={ingestText}
            onChange={(e) => setIngestText(e.target.value)}
          />
        </div>

        <button 
          onClick={handleIngest}
          disabled={isIngesting}
          className="btn-primary w-full flex justify-center items-center space-x-2"
        >
           {isIngesting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Database className="w-4 h-4" />}
           <span>Update Database</span>
        </button>

        {/* Status Indicator */}
        <div className={`p-3 rounded-lg flex items-center space-x-2 ${serverStatus === 'online' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-xs font-mono uppercase">
              {serverStatus === 'online' ? 'Systems Nominal' : 'Connection Lost'}
            </span>
            {serverStatus === 'offline' && (
              <button onClick={checkServer} className="ml-auto hover:text-white"><RefreshCw className="w-3 h-3"/></button>
            )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col m-4 h-[calc(100vh-2rem)] glass-panel relative overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-slate-900/50">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">J.A.R.V.I.S.</h1>
              <p className="text-xs text-blue-400 font-mono tracking-wider">ADVANCED ASSISTANT v1.0</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] p-4 rounded-2xl flex items-start space-x-3 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600/20 border border-blue-500/30 text-white rounded-tr-sm' 
                    : 'bg-slate-800/40 border border-white/5 text-gray-100 rounded-tl-sm'
                }`}>
                  <div className="mt-1">
                    {msg.role === 'user' ? <User className="w-4 h-4 text-blue-400" /> : <Bot className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="leading-relaxed whitespace-pre-wrap text-sm">{msg.content}</div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                 <div className="bg-slate-800/40 border border-white/5 p-4 rounded-2xl rounded-tl-sm flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    <span className="text-gray-400 text-sm">Processing...</span>
                 </div>
               </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900/50 border-t border-white/5">
          <div className="flex space-x-2">
            <input 
              type="text" 
              className="flex-1 bg-slate-800/50 border border-slate-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
              placeholder="Enter command..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-600/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
