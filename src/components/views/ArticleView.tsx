import React, { useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getArticleBySlug } from '../../data/contentRegistry';
import { getToolBySlug } from '../../data/toolsRegistry';
import { ArrowLeft, Clock, Calendar, ChevronRight, Calculator } from 'lucide-react';

interface ArticleViewProps {
  slug: string;
}

const ArticleView: React.FC<ArticleViewProps> = ({ slug }) => {
  const { navigateToHome, navigateToTool, navigateToBlog, navigateToGuides, view } = useApp();
  
  const article = useMemo(() => getArticleBySlug(slug), [slug]);

  // Handle intercepting clicks on internal tool links to prevent full page reload
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.dataset.tool) {
        e.preventDefault();
        navigateToTool(link.dataset.tool);
      }
    };
    
    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, [navigateToTool]);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Article Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The article or guide you are looking for does not exist or has been moved.
        </p>
        <button
          onClick={() => navigateToHome()}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>
      </div>
    );
  }

  const relatedTools = article.relatedToolSlugs
    .map(tSlug => getToolBySlug(tSlug))
    .filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-24">
      {/* Breadcrumbs */}
      <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <button
              onClick={() => navigateToHome()}
              className="inline-flex items-center text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
            >
              Home
            </button>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              <button
                onClick={() => {
                   if (article.type === 'guide') navigateToGuides();
                   else navigateToBlog();
                }}
                className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
              >
                {article.type === 'guide' ? 'Guides' : 'Blog'}
              </button>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px] sm:max-w-xs">
                {article.title}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-10 text-center sm:text-left max-w-4xl">
        <div className="inline-flex items-center justify-center sm:justify-start space-x-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-4 uppercase tracking-wider">
          <span className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
            {article.category}
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
          {article.title}
        </h1>
        
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center">
            <span className="font-medium text-gray-900 dark:text-gray-300">By {article.author}</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1.5" />
            {new Date(article.publishedAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1.5" />
            {article.readTimeMinutes} min read
          </div>
        </div>
      </header>

      {/* Main Content & Sidebar layout */}
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Article Body */}
        <div className="flex-1 min-w-0 max-w-4xl">
          <div 
            className="prose prose-indigo dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 dark:prose-a:text-indigo-400
              prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md
              prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            
            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                  <Calculator className="w-4 h-4 mr-2 text-indigo-500" />
                  Try these tools
                </h3>
                <ul className="space-y-4">
                  {relatedTools.map(tool => tool && (
                    <li key={tool.slug}>
                      <button
                         onClick={(e) => {
                          e.preventDefault();
                          navigateToTool(tool.slug);
                        }}
                        className="text-left w-full group"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {tool.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {tool.description}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;
