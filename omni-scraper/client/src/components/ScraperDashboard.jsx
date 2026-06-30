import React, { useState, useEffect, useRef } from 'react';
import CommandPalette from './CommandPalette';
import { Database, Download, StopCircle, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

const ScraperDashboard = () => {
    const [vendors, setVendors] = useState([]);
    const [isScraping, setIsScraping] = useState(false);
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('idle');
    const [progress, setProgress] = useState(0);
    
    const abortControllerRef = useRef(null);

    const handleSearch = async (category, city) => {
        setIsScraping(true);
        setVendors([]);
        setLogs([]);
        setStatus('scraping');
        setProgress(0);

        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch('http://localhost:4000/api/ultra-scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, city }),
                signal: abortControllerRef.current.signal
            });

            if (!response.body) throw new Error('ReadableStream not supported');

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                
                buffer = lines.pop(); // Keep incomplete chunk in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            
                            if (data.status === 'log') {
                                setLogs(prev => [...prev, data.message].slice(-5)); // Keep last 5 logs
                            }
                            if (data.status === 'partial_results' || data.status === 'completed') {
                                if (data.data) {
                                    setVendors(prev => {
                                        const newVendors = [...prev];
                                        data.data.forEach(nv => {
                                            if (!newVendors.find(v => v.name === nv.name && v.phone === nv.phone)) {
                                                newVendors.push(nv);
                                            }
                                        });
                                        return newVendors;
                                    });
                                }
                                if (data.status === 'completed') {
                                    setIsScraping(false);
                                    setStatus('completed');
                                    setProgress(100);
                                }
                            }
                            if (data.status === 'error') {
                                setIsScraping(false);
                                setStatus('error');
                                setLogs(prev => [...prev, `ERROR: ${data.message}`]);
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data', e);
                        }
                    }
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
                setLogs(prev => [...prev, 'ABORTED BY USER']);
                setStatus('aborted');
            } else {
                console.error('Fetch error:', error);
                setStatus('error');
            }
            setIsScraping(false);
        }
    };

    const handleStopMinions = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsScraping(false);
        }
    };

    const exportToCSV = () => {
        if (vendors.length === 0) return;
        const headers = ['Name', 'Address', 'Phone', 'Email', 'Website', 'Source'];
        const csvRows = vendors.map(v => 
            [v.name, v.address, v.phone, v.email, v.website, v.source].map(f => `"${(f || '').toString().replace(/"/g, '""')}"`).join(',')
        );
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `OmniScraper_Leads_${Date.now()}.csv`;
        link.click();
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8">
            <CommandPalette onSearch={handleSearch} isScraping={isScraping} />

            {/* Dashboard Control Panel */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-700/50 rounded-xl">
                        <Database className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Live Extraction Feed</h3>
                        <p className="text-slate-400 text-sm">{vendors.length} Unique Leads Captured</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {isScraping && (
                        <button onClick={handleStopMinions} className="btn-danger flex items-center gap-2 flex-1 md:flex-none justify-center">
                            <StopCircle className="w-5 h-5" />
                            Stop Minions
                        </button>
                    )}
                    <button 
                        onClick={exportToCSV} 
                        disabled={vendors.length === 0 || isScraping}
                        className="btn-primary flex items-center gap-2 flex-1 md:flex-none justify-center bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                    >
                        <Download className="w-5 h-5" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Live Logs Terminal */}
            <div className="glass-panel rounded-2xl p-4 font-mono text-sm h-32 overflow-y-auto bg-slate-950/80 border-slate-800 flex flex-col justify-end">
                {logs.length === 0 && !isScraping && <div className="text-slate-600">Terminal Ready... Waiting for Command.</div>}
                {logs.map((log, i) => (
                    <div key={i} className={`flex items-start gap-2 mb-1 ${log.includes('ERROR') ? 'text-rose-400' : 'text-emerald-400'}`}>
                        <span className="text-slate-500 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                        <span>{log}</span>
                    </div>
                ))}
            </div>

            {/* Data Table */}
            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-medium">Business Name</th>
                                <th className="px-6 py-4 font-medium">Contact</th>
                                <th className="px-6 py-4 font-medium">Location</th>
                                <th className="px-6 py-4 font-medium">Digital Presence</th>
                                <th className="px-6 py-4 font-medium">Source</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        {isScraping ? (
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Activity className="w-8 h-8 text-indigo-500 animate-pulse" />
                                                <p>Engines running... waiting for data.</p>
                                            </div>
                                        ) : (
                                            'No data extracted yet. Enter a query above to start.'
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                vendors.map((v, i) => (
                                    <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-200">{v.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {v.phone ? <span className="text-emerald-400">{v.phone}</span> : <span className="text-slate-600 italic">No phone</span>}
                                                {v.email ? <span className="text-indigo-400">{v.email}</span> : null}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={v.address}>{v.address || 'Unknown'}</td>
                                        <td className="px-6 py-4">
                                            {v.website ? (
                                                <a href={v.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Website</a>
                                            ) : (
                                                <span className="text-slate-600 italic">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <span className="bg-slate-700 px-2 py-1 rounded-md text-slate-300">{v.source}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ScraperDashboard;
