import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getAllArticles } from '../../data/contentRegistry';
import { Calendar, Clock, BookOpen, ArrowRight } from 'lucide-react';

interface BlogHomeViewProps {
  type: 'blog' | 'guides';
}

const BlogHomeView: React.FC<BlogHomeViewProps> = ({ type }) => {
  const { navigateToArticle, navigateToCategory } = useApp();
  
  const articles = useMemo(() => {
    return getAllArticles(type === 'guides' ? 'guide' : 'blog');
  }, [type]);

  const title = type === 'blog' ? 'BharatUtility Blog & Updates' : 'Financial & Utility Guides';
  const description = type === 'blog' 
    ? 'Latest updates, tips, and articles about tools and daily utilities in India.'
    : 'In-depth, actionable guides to help you understand taxes, loans, and personal finance in India.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
          {title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
          {description}
        </p>
      </div>

      {/* Article Grid */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article 
              key={article.id} 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/30 group cursor-pointer"
              onClick={() => navigateToArticle(article.slug)}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center space-x-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-3">
                  <span className="bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md uppercase tracking-wider">
                    {article.category}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">•</span>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {article.readTimeMinutes} min read
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {article.title}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow text-sm leading-relaxed">
                  {article.excerpt}
                </p>
                
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transform duration-200">
                    Read Article <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No articles yet</h3>
          <p className="text-gray-500 dark:text-gray-400">We are currently curating content for this section. Check back soon!</p>
        </div>
      )}
    </div>
  );
};

export default BlogHomeView;
