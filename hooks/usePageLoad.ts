import { useEffect, useState, useCallback } from 'react';

interface UsePageLoadOptions {
  minLoadTime?: number;
  onLoadComplete?: () => void;
}

/**
 * Custom hook to manage page loading states with minimum load time.
 * Prevents jarring transitions and ensures smooth UX.
 */
export function usePageLoad(options: UsePageLoadOptions = {}) {
  const { minLoadTime = 300, onLoadComplete } = options;
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState(Date.now());

  const completeLoad = useCallback(() => {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minLoadTime - elapsedTime);

    setTimeout(() => {
      setIsLoading(false);
      onLoadComplete?.();
    }, remainingTime);
  }, [startTime, minLoadTime, onLoadComplete]);

  return { isLoading, completeLoad, setIsLoading };
}

/**
 * Hook for managing multiple async data loading with combined state.
 */
export function useDataLoad<T>(
  fetchFunction: () => Promise<T>,
  options: UsePageLoadOptions & { initialData?: T } = {}
) {
  const { minLoadTime = 300, onLoadComplete, initialData } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const result = await fetchFunction();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted) {
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, minLoadTime - elapsedTime);

          setTimeout(() => {
            if (isMounted) {
              setIsLoading(false);
              onLoadComplete?.();
            }
          }, remainingTime);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading, error };
}
