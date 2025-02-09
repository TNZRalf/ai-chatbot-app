import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useNavigationGuard = (hasUnsavedChanges, onNavigationAttempt) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    // Handle browser back/forward buttons
    const handlePopState = (event) => {
      event.preventDefault();
      const shouldProceed = onNavigationAttempt(location.pathname);
      if (!shouldProceed) {
        // Push the current page back into history to prevent navigation
        window.history.pushState(null, '', location.pathname);
      }
    };

    // Handle clicks on links
    const handleClick = (event) => {
      if (!event.target.closest('a')) return;
      const href = event.target.closest('a').getAttribute('href');
      if (href && href.startsWith('/')) {
        event.preventDefault();
        const shouldProceed = onNavigationAttempt(href);
        if (shouldProceed) {
          navigate(href);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick);
    };
  }, [hasUnsavedChanges, location.pathname, navigate, onNavigationAttempt]);
};
