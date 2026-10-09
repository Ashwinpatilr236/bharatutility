import React, { useState } from 'react';
import { Search, Film, Tv, MonitorPlay, Star, Calendar, ArrowRight, Loader2, Info } from 'lucide-react';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || ''; // Add your TMDB API key here or in .env

interface MovieResult {
  id: number;
  title?: string;
  name?: string; // For TV shows
  overview: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
}

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface StreamingData {
  flatrate?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
  link?: string;
}

export const OttStreamFinder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MovieResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingData, setStreamingData] = useState<Record<number, StreamingData>>({});
  const [loadingProviders, setLoadingProviders] = useState<Record<number, boolean>>({});
  const [error, setError] = useState('');

  const searchMovies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (!TMDB_API_KEY) {
      setError('TMDB API Key is missing. Please add VITE_TMDB_API_KEY in your .env file.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`);
      const data = await res.json();
      if (data.results) {
        // Filter out people
        const filtered = data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
        setResults(filtered.slice(0, 10)); // Top 10
      }
    } catch (err) {
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async (id: number, type: 'movie' | 'tv') => {
    if (streamingData[id] || loadingProviders[id]) return;
    
    setLoadingProviders(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}/watch/providers?api_key=${TMDB_API_KEY}`);
      const data = await res.json();
      
      // Get India providers (IN)
      const inProviders = data.results?.IN;
      if (inProviders) {
        setStreamingData(prev => ({ ...prev, [id]: inProviders }));
      } else {
        setStreamingData(prev => ({ ...prev, [id]: {} }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProviders(prev => ({ ...prev, [id]: false }));
    }
  };

  const getImageUrl = (path: string | null, size: string = 'w500') => {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Poster';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/70 dark:border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent font-medium text-sm mb-2">
            <MonitorPlay className="w-4 h-4" />
            <span>Powered by JustWatch & TMDB</span>
          </div>
          <h2 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">Where to watch?</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Search for any movie or web series to find out which OTT platform it's streaming on in India.</p>
          
          <form onSubmit={searchMovies} className="relative mt-6 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Kalki 2898 AD, Panchayat, Inception..."
                className="block w-full pl-11 pr-32 py-4 bg-neutral-100 dark:bg-neutral-800 border-transparent rounded-2xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:bg-white dark:focus:bg-neutral-900 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-sm"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute inset-y-2 right-2 px-6 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
              </button>
            </div>
          </form>
          {error && <div className="text-rose-500 text-sm mt-3 bg-rose-50 dark:bg-rose-900/20 py-2 px-4 rounded-lg inline-block border border-rose-100 dark:border-rose-800/50">{error}</div>}
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold font-display text-neutral-900 dark:text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-accent" /> Search Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map(item => (
              <div key={item.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col sm:flex-row group hover:shadow-md transition-shadow">
                {/* Poster */}
                <div className="w-full sm:w-1/3 aspect-[2/3] sm:aspect-auto sm:h-full relative overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                  <img 
                    src={getImageUrl(item.poster_path)} 
                    alt={item.title || item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {item.vote_average ? item.vote_average.toFixed(1) : 'NR'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {item.media_type === 'movie' ? <Film className="w-3.5 h-3.5" /> : <Tv className="w-3.5 h-3.5" />}
                    <span>{item.media_type === 'movie' ? 'Movie' : 'TV Show'}</span>
                    <span className="w-1 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full"></span>
                    <span>{(item.release_date || item.first_air_date || '').split('-')[0] || 'TBA'}</span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 leading-tight">
                    {item.title || item.name}
                  </h4>
                  
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 mb-4 flex-1">
                    {item.overview || 'No synopsis available.'}
                  </p>

                  {/* OTT Providers Section */}
                  <div className="mt-auto border-t border-neutral-100 dark:border-neutral-800 pt-4">
                    {!streamingData[item.id] ? (
                      <button 
                        onClick={() => fetchProviders(item.id, item.media_type)}
                        disabled={loadingProviders[item.id]}
                        className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        {loadingProviders[item.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find Where to Watch'}
                      </button>
                    ) : (
                      <div className="space-y-3">
                        {streamingData[item.id].flatrate && streamingData[item.id].flatrate!.length > 0 ? (
                          <div>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 block">Streaming On</span>
                            <div className="flex flex-wrap gap-2">
                              {streamingData[item.id].flatrate!.map(provider => (
                                <div key={provider.provider_id} className="w-8 h-8 rounded-lg overflow-hidden shadow-sm" title={provider.provider_name}>
                                  <img src={getImageUrl(provider.logo_path, 'w92')} alt={provider.provider_name} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-neutral-500 dark:text-neutral-400 italic">Not available on standard streaming in India.</div>
                        )}
                        
                        {(streamingData[item.id].rent || streamingData[item.id].buy) && (
                          <div>
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 block">Rent / Buy</span>
                            <div className="flex flex-wrap gap-2">
                              {[...(streamingData[item.id].rent || []), ...(streamingData[item.id].buy || [])]
                                .filter((v,i,a)=>a.findIndex(t=>(t.provider_id === v.provider_id))===i)
                                .map(provider => (
                                <div key={provider.provider_id} className="w-6 h-6 rounded-md overflow-hidden opacity-80" title={provider.provider_name}>
                                  <img src={getImageUrl(provider.logo_path, 'w92')} alt={provider.provider_name} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {streamingData[item.id].link && (
                          <a href={streamingData[item.id].link} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1 mt-2 inline-flex">
                            View on JustWatch <ArrowRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
