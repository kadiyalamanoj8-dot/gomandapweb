import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, SearchIcon, Clock } from 'lucide-react';

const CommandPalette = ({ onSearch, isScraping }) => {
    const [category, setCategory] = useState('');
    const [city, setCity] = useState('');
    
    const [catSuggestions, setCatSuggestions] = useState([]);
    const [citySuggestions, setCitySuggestions] = useState([]);
    
    const [showCatDropdown, setShowCatDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    const catRef = useRef(null);
    const cityRef = useRef(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (catRef.current && !catRef.current.contains(event.target)) setShowCatDropdown(false);
            if (cityRef.current && !cityRef.current.contains(event.target)) setShowCityDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch Autocomplete
    const fetchAutocomplete = async (type, query) => {
        if (!query || query.length < 2) {
            if (type === 'category') setCatSuggestions([]);
            if (type === 'location') setCitySuggestions([]);
            return;
        }
        try {
            const res = await fetch('http://localhost:4000/api/autocomplete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, query })
            });
            const data = await res.json();
            if (type === 'category') setCatSuggestions(data.suggestions || []);
            if (type === 'location') setCitySuggestions(data.suggestions || []);
        } catch (e) {
            console.error('Autocomplete error', e);
        }
    };

    const handleCategoryChange = (e) => {
        const val = e.target.value;
        setCategory(val);
        setShowCatDropdown(true);
        fetchAutocomplete('category', val);
    };

    const handleCityChange = (e) => {
        const val = e.target.value;
        setCity(val);
        setShowCityDropdown(true);
        fetchAutocomplete('location', val);
    };

    const handleExecute = () => {
        if (!category.trim() || !city.trim()) return;
        
        // Save to Recent Searches
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const newSearch = { category: category.trim(), city: city.trim() };
        if (!recent.find(r => r.category === newSearch.category && r.city === newSearch.city)) {
            localStorage.setItem('recentSearches', JSON.stringify([newSearch, ...recent].slice(0, 5)));
        }

        onSearch(category.trim(), city.trim());
        setShowCatDropdown(false);
        setShowCityDropdown(false);
    };

    return (
        <div className="glass-panel p-6 rounded-2xl w-full max-w-4xl mx-auto mb-8 animate-fade-in-up">
            <h2 className="text-2xl font-light mb-6 text-slate-100 flex items-center gap-3">
                <Search className="w-6 h-6 text-indigo-400" />
                Omni-Search Engine
            </h2>
            
            <div className="flex flex-col md:flex-row gap-4 relative">
                {/* Category Input */}
                <div className="flex-1 relative" ref={catRef}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="input-field pl-10 h-14 text-lg bg-slate-900/80 border-slate-600 focus:border-indigo-500 shadow-inner"
                        placeholder="e.g. Restaurants, Photographers..."
                        value={category}
                        onChange={handleCategoryChange}
                        onFocus={() => setShowCatDropdown(true)}
                        disabled={isScraping}
                    />
                    {showCatDropdown && (category.length > 0) && (
                        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                            {catSuggestions.length > 0 ? (
                                catSuggestions.map((s, i) => (
                                    <div 
                                        key={i} 
                                        className="px-4 py-3 hover:bg-indigo-600 cursor-pointer transition-colors text-slate-200"
                                        onClick={() => { setCategory(s); setShowCatDropdown(false); }}
                                    >
                                        {s}
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-slate-500 italic">No suggestions...</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Location Input */}
                <div className="flex-1 relative" ref={cityRef}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-rose-400" />
                    </div>
                    <input
                        type="text"
                        className="input-field pl-10 h-14 text-lg bg-slate-900/80 border-slate-600 focus:border-rose-500 shadow-inner"
                        placeholder="e.g. Guntur, Paris..."
                        value={city}
                        onChange={handleCityChange}
                        onFocus={() => setShowCityDropdown(true)}
                        disabled={isScraping}
                    />
                    {showCityDropdown && (city.length > 0) && (
                        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                            {citySuggestions.length > 0 ? (
                                citySuggestions.map((s, i) => (
                                    <div 
                                        key={i} 
                                        className="px-4 py-3 hover:bg-rose-600 cursor-pointer transition-colors text-slate-200 flex items-center gap-2"
                                        onClick={() => { setCity(s); setShowCityDropdown(false); }}
                                    >
                                        <MapPin className="w-4 h-4 opacity-50" />
                                        {s}
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-slate-500 italic">Searching globally...</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Execute Button */}
                <button 
                    onClick={handleExecute} 
                    disabled={isScraping || !category.trim() || !city.trim()}
                    className="btn-primary h-14 px-8 text-lg md:w-auto w-full flex items-center justify-center gap-2"
                >
                    {isScraping ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Sweeping...
                        </>
                    ) : (
                        'Extract Leads'
                    )}
                </button>
            </div>
            
            {/* Recent Searches */}
            {!isScraping && (
                <div className="mt-4 flex gap-2 flex-wrap items-center text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>Recent:</span>
                    {(JSON.parse(localStorage.getItem('recentSearches') || '[]')).map((s, i) => (
                        <button 
                            key={i} 
                            className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full border border-slate-700 transition-colors"
                            onClick={() => { setCategory(s.category); setCity(s.city); }}
                        >
                            {s.category} in {s.city}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommandPalette;
