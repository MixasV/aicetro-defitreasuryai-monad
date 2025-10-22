import { useEffect } from 'react';

/**
 * Hook to set page title dynamically for client components
 * Format: "{Page Name} | AIcetro"
 */
export function usePageTitle(pageTitle: string) {
  useEffect(() => {
    const fullTitle = `${pageTitle} | AIcetro`;
    document.title = fullTitle;
    
    // Cleanup: restore default title on unmount (optional)
    return () => {
      document.title = 'AIcetro | AI-Powered DeFi Treasury Management';
    };
  }, [pageTitle]);
}
