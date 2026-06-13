import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Globe, FolderOpen, Download, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ResearchBot from './ResearchBot';
import './index.css';

function App() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('idle'); // idle, crawling, done, error
  const [report, setReport] = useState(null);
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const startResearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setStatus('crawling');
    setReport(null);
    setLogs([`> Starting Deep AI Crawl for: "${query}"`, `> Initializing Gomandap Neural Net...`]);

    try {
      const res = await axios.post(`http://localhost:5003/api/research/start`, { query, deepCrawl: true });
      const jobId = res.data.jobId;
      
      // Connect to SSE for logs
      const eventSource = new EventSource('http://localhost:5003/api/research/logs/stream');
      eventSource.onmessage = (event) => {
        setLogs(prev => [...prev, `> ${event.data}`]);
      };

      const interval = setInterval(async () => {
        try {
          const statusRes = await axios.get(`http://localhost:5003/api/research/status/${jobId}`);
          if (statusRes.data.state === 'completed') {
            clearInterval(interval);
            eventSource.close();
            setStatus('done');
            setReport(statusRes.data.result);
            setLogs(prev => [...prev, `> Report Generated Successfully!`]);
          } else if (statusRes.data.state === 'failed') {
            clearInterval(interval);
            eventSource.close();
            setStatus('error');
            setLogs(prev => [...prev, `> Research failed.`]);
          }
        } catch (err) {}
      }, 2000);
    } catch (err) {
      setStatus('error');
      setLogs([`> Failed to contact server.`]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 text-gray-900 font-sans p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* HEADER & MASCOT */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center pt-12"
        >
          <ResearchBot status={status} />
          <motion.h1 
            layout
            className="text-5xl md:text-7xl font-black text-white drop-shadow-lg mt-6 flex justify-center items-center gap-4 tracking-tight"
          >
            <Zap className="text-yellow-200" size={48} />
            Deep Research AI
          </motion.h1>
          <p className="text-red-100 font-bold text-xl mt-4 max-w-2xl mx-auto drop-shadow-md">
            The world's most advanced, free, and unrestricted web crawler and AI synthesizer.
          </p>
        </motion.div>

        {/* SEARCH BAR */}
        <motion.div 
          layout
          className="max-w-3xl mx-auto"
        >
          <form onSubmit={startResearch} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 to-red-400 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-xl p-3 rounded-3xl shadow-2xl flex items-center border border-white/50">
              <div className="p-4 text-red-500"><Search size={32} /></div>
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                disabled={status === 'crawling'}
                placeholder="What do you want to research today?"
                className="flex-1 bg-transparent border-none text-2xl font-bold text-gray-800 placeholder-gray-400 outline-none p-2"
              />
              <button 
                type="submit" 
                disabled={status === 'crawling'}
                className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black text-xl py-5 px-10 rounded-2xl transition-all shadow-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none"
              >
                {status === 'crawling' ? 'Analyzing...' : 'Explore'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* PROCESSING TERMINAL */}
        <AnimatePresence>
          {status === 'crawling' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gray-900 rounded-3xl shadow-2xl border-4 border-gray-800 overflow-hidden relative">
                <div className="bg-gray-800 px-6 py-3 flex items-center gap-3 border-b border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-400 font-mono text-sm ml-4 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-green-400" /> gomandap-neural-net v2.0
                  </span>
                </div>
                <div className="p-6 h-64 overflow-y-auto font-mono text-sm text-green-400 space-y-2">
                  {logs.map((log, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i}
                    >
                      {log}
                    </motion.div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REPORT DISPLAY */}
        <AnimatePresence>
          {status === 'done' && report && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/50 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                    Executive Summary
                  </h2>
                  <p className="text-red-900/60 font-bold mt-2 text-lg flex items-center gap-2">
                    <Globe size={20} /> Synthesized from {report.itemsCount || 0} global sources
                  </p>
                </div>
                <a href={`http://localhost:5003${report.reportPath}`} target="_blank" rel="noreferrer" 
                  className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-lg transition-transform hover:scale-105 shadow-xl shadow-red-600/20">
                  <Download size={24} /> Download PDF
                </a>
              </div>
              
              <div className="p-8 md:p-12 text-lg md:text-xl text-gray-800 leading-relaxed font-medium prose prose-red max-w-none">
                <pre className="whitespace-pre-wrap font-sans">
                  {report.report}
                </pre>
              </div>
              
              <div className="bg-gray-50 border-t border-gray-100 p-8 md:p-12">
                <h3 className="font-black text-2xl text-gray-900 mb-8 flex items-center gap-3">
                  <FolderOpen className="text-yellow-500" /> Extracted Sources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(report.dataItems || []).slice(0, 12).map((doc, i) => (
                    <motion.div 
                      whileHover={{ scale: 1.02, y: -5 }}
                      key={i} 
                      className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 flex items-start gap-4 group cursor-pointer"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <div className={`p-3 rounded-xl transition-colors ${doc.type === 'pdf' ? 'bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white' : 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white'}`}>
                        {doc.type === 'pdf' ? <FolderOpen size={24} /> : <Globe size={24} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors truncate">{doc.title || doc.url}</h4>
                        <p className="text-sm text-gray-500 mt-1 truncate">{doc.url}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default App;
