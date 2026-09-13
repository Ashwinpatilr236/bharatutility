import React from 'react';
import { useApp } from '../../context/AppContext';
import { ViewMode } from '../../types';
import { getPathForView } from '../../utils/seo';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string | ViewMode;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const Link: React.FC<LinkProps> = ({ to, children, className = '', onClick, ...props }) => {
  const { setView, navigateToTool, navigateToCategory, navigateToHome, navigateToAllTools, navigateToFavorites, navigateToLegal, navigateToContact, navigateToRequestTool, navigateToSanatanNext, navigateToAdmin } = useApp();

  let href = '#';
  let targetView: ViewMode | null = null;

  if (typeof to === 'string') {
    href = to;
  } else if (to) {
    href = getPathForView(to);
    targetView = to;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

    // Allow default browser behavior for modifier keys (Ctrl+click, Cmd+click, Shift+click, Alt+click)
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }

    e.preventDefault();

    if (targetView) {
      setView(targetView);
    } else if (typeof to === 'string') {
      // Parse string route
      if (to === '/' || to === '') {
        navigateToHome();
      } else if (to === '/tools' || to === '/all-tools') {
        navigateToAllTools();
      } else if (to === '/favorites' || to === '/saved') {
        navigateToFavorites();
      } else if (to === '/contact') {
        navigateToContact();
      } else if (to === '/request-tool') {
        navigateToRequestTool();
      } else if (to === '/sanatan-next') {
        navigateToSanatanNext();
      } else if (to === '/about' || to === '/legal/about') {
        navigateToLegal('about');
      } else if (to === '/legal/privacy' || to === '/privacy') {
        navigateToLegal('privacy');
      } else if (to === '/legal/terms' || to === '/terms') {
        navigateToLegal('terms');
      } else if (to === '/legal/disclaimer' || to === '/disclaimer') {
        navigateToLegal('disclaimer');
      } else if (to.startsWith('/tools/')) {
        const slug = to.replace('/tools/', '').split('?')[0];
        navigateToTool(slug);
      } else if (to.startsWith('/tool/')) {
        const slug = to.replace('/tool/', '').split('?')[0];
        navigateToTool(slug);
      } else if (to.startsWith('/category/')) {
        const categoryId = to.replace('/category/', '') as any;
        navigateToCategory(categoryId);
      } else if (to.startsWith('/admin')) {
        navigateToAdmin();
      } else {
        // Fallback
        window.history.pushState({}, '', to);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};
