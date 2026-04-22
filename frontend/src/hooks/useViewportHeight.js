import { useEffect } from 'react';

export function useViewportHeight() {
  useEffect(() => {
    function handleResize() {
      if (window.visualViewport) {
        document.documentElement.style.setProperty(
          '--vintara-vh',
          `${window.visualViewport.height}px`
        );
      } else {
        document.documentElement.style.setProperty(
          '--vintara-vh',
          `${window.innerHeight}px`
        );
      }
    }

    // Initial set
    handleResize();

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);
}
