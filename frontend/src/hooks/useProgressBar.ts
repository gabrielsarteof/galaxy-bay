'use client';

import { useEffect } from 'react';
import NProgress from 'nprogress';

export function useProgressBar() {
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const targetUrl = (event.currentTarget as HTMLAnchorElement).href;
      const currentUrl = window.location.href;

      if (targetUrl !== currentUrl) {
        NProgress.start();
      }
    };

    const handleMutation = () => {
      const anchorElements = document.querySelectorAll('a[href]');
      anchorElements.forEach((anchor) => {
        anchor.addEventListener('click', handleAnchorClick as EventListener);
      });
    };

    const mutationObserver = new MutationObserver(handleMutation);
    mutationObserver.observe(document, { childList: true, subtree: true });

    // Initial setup
    handleMutation();

    return () => {
      mutationObserver.disconnect();
      const anchorElements = document.querySelectorAll('a[href]');
      anchorElements.forEach((anchor) => {
        anchor.removeEventListener('click', handleAnchorClick as EventListener);
      });
    };
  }, []);
}
