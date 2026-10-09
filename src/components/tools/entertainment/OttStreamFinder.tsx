import React, { useState, useEffect } from 'react';
import { Search, Film, Tv, MonitorPlay, Star, Calendar, ArrowRight, Loader2, Info, ExternalLink, PlayCircle, Sparkles } from 'lucide-react';

interface ImdbResult {
  id: string; // IMDb ID e.g., tt123456
  l: string;  // Title
  y?: number; // Year
  q?: string; // Type details
  qid?: string; // Type (movie, tvSeries, etc.)
  s?: string; // Cast/Stars
  i?: {
    imageUrl: string;
    width: number;
    height: number;
  };
}

export const OttStreamFinder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ImdbResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const searchMovies = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const q = searchQuery.trim().toLowerCase();
      const firstLetter = q.charAt(0).match(/[a-z0-9]/i) ? q.charAt(0) : 'a';
      
      // Using IMDb's public suggestion API - NO API KEY REQUIRED!
      const response = await fetch(`https://v3.sg.media-imdb.com/suggestion/${firstLetter}/${encodeURIComponent(q)}.json`);
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      
      // Filter out actors/companies, keep only movies and TV series
      const validResults = (data.d || []).filter((item: ImdbResult) => 
        ['movie', 'tvSeries', 'tvMiniSeries', 'tvMovie'].includes(item.qid || '')
      );

      setResults(validResults);
    } catch (err) {
      console.error('Search error:', err);
      setError('Could not connect to the database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchMovies(query);
      } else if (query.trim().length === 0) {
        setResults([]);
        setHasSearched(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const getWatchUrl = (title: string) => {
    // Direct link to Google Watch Action which usually shows all OTT platforms beautifully at the top
    const searchQuery = `Where to watch ${title} in India`;
    return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>100% Free • Powered by IMDb Network</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Where to watch?
          </h2>
          <p className="text-indigo-100 text-lg">
            Search for any movie or web series to find out which OTT platform it's streaming on in India.
          </p>
          
          <div className="relative mt-8">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., Kalki 2898 AD, Panchayat, Mirzapur..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all text-lg shadow-inner"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-200" />
            {loading && (
              <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-center">
          {error}
        </div>
      )}

      {/* Results Section */}
      {hasSearched && !loading && results.length === 0 && !error && (
        <div className="text-center py-16 px-4">
          <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Film className="w-10 h-10 text-neutral-400" />
          </div>
          <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">No results found</h3>
          <p className="text-neutral-500">Try searching for a different movie or TV show name.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold font-display text-neutral-900 dark:text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-indigo-500" /> Search Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((item) => (
              <div key={item.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col sm:flex-row group hover:shadow-md transition-shadow">
                {/* Poster */}
                <div className="w-24 sm:w-1/3 aspect-[2/3] sm:aspect-auto sm:h-full relative overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                  {item.i?.imageUrl ? (
                    <img 
                      src={item.i.imageUrl} 
                      alt={item.l}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <Film className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {item.qid?.includes('tv') ? <Tv className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
                    <span>{item.qid === 'tvSeries' ? 'TV Series' : 'Movie'}</span>
                    {item.y && (
                      <>
                        <span className="w-1 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full"></span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.y}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 leading-tight">
                    {item.l}
                  </h4>
                  
                  {item.s && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4 flex-1">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">Starring:</span> {item.s}
                    </p>
                  )}

                  {/* OTT Watch Button */}
                  <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <a 
                      href={getWatchUrl(item.l)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-neutral-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Find OTT Platform
                      <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Initial State / Default view */}
      {!hasSearched && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 opacity-70 hover:opacity-100 transition-opacity mt-8">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl text-center space-y-3 border border-neutral-200/70 dark:border-neutral-800">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">1. Search Fast</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Type any Indian or Hollywood movie/series name.</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl text-center space-y-3 border border-neutral-200/70 dark:border-neutral-800">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">2. Select Target</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Verify the exact release year and official poster.</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl text-center space-y-3 border border-neutral-200/70 dark:border-neutral-800">
            <div className="w-12 h-12 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-2xl flex items-center justify-center mx-auto">
              <PlayCircle className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">3. Find Platform</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Click to instantly see if it's on Netflix, Prime, or Hotstar.</p>
          </div>
        </div>
      )}
    </div>
  );
};

