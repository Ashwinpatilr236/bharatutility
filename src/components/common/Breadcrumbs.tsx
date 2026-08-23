import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from './Link';

interface BreadcrumbsProps {
  items: {
    label: string;
    href?: string;
    onClick?: () => void;
    current?: boolean;
    active?: boolean;
  }[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const { navigateToHome } = useApp();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 mb-4 overflow-x-auto py-1">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isCurrent = item.current || item.active;
        return (
          <div key={index} className="flex items-center shrink-0">
            <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-neutral-300 dark:text-neutral-700" />
            {isCurrent ? (
              <span className="font-semibold text-neutral-900 dark:text-white max-w-[200px] truncate" aria-current="page">
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                to={item.href}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors max-w-[150px] truncate"
              >
                {item.label}
              </Link>
            ) : (
              <button
                onClick={item.onClick}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors max-w-[150px] truncate"
              >
                {item.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
};
