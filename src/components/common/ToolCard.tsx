import React from 'react';
import { Tool } from '../../types';
import { Link } from './Link';
import { DynamicIcon } from './DynamicIcon';

interface ToolCardProps {
  tool: Tool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="p-2.5 sm:p-3.5 w-full min-w-[58vw] sm:min-w-[220px] overflow-hidden snap-start rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-left hover:border-accent hover:shadow-md transition-all group flex flex-row sm:flex-col items-center sm:items-start justify-between gap-2.5 sm:gap-0"
    >
      <div className="flex flex-row sm:flex-col w-full min-w-0 items-center sm:items-start gap-2.5 sm:gap-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-lg bg-accent-subtle text-accent flex items-center justify-center sm:mb-2.5 group-hover:scale-105 transition-transform shadow-xs">
          <DynamicIcon name={tool.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white group-hover:text-accent transition-colors line-clamp-1 break-words">
            {tool.name}
          </h4>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 sm:mt-0.5 leading-relaxed break-words">
            {tool.tagline}
          </p>
        </div>
      </div>

      <div className="hidden sm:flex mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 w-full items-center justify-between">
        <span className="capitalize text-[10px] text-neutral-400 font-medium">
          {tool.category}
        </span>
        <span className="text-[11px] font-semibold text-accent inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
          Use →
        </span>
      </div>
    </Link>
  );
};
