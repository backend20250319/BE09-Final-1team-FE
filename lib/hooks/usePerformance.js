import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

/**
 * 디바운스 훅 - 입력값 변경을 지연시켜 불필요한 API 호출 방지
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 쓰로틀 훅 - 함수 호출 빈도를 제한
 */
export function useThrottle(func, delay = 300) {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      func(...args);
      lastRun.current = Date.now();
    }
  }, [func, delay]);
}

/**
 * 무한 스크롤 훅
 */
export function useInfiniteScroll(callback, options = {}) {
  const { threshold = 100, enabled = true } = options;
  const observerRef = useRef(null);

  const lastElementRef = useCallback((node) => {
    if (observerRef.current) observerRef.current.disconnect();
    
    if (!enabled || !node) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    observerRef.current.observe(node);
  }, [callback, threshold, enabled]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return lastElementRef;
}

/**
 * 메모이제이션된 정렬 함수
 */
export function useSortedData(data, sortKey, sortDirection = 'asc') {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [data, sortKey, sortDirection]);
}

/**
 * 메모이제이션된 필터링 함수
 */
export function useFilteredData(data, filterKey, filterValue) {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!filterValue) return data;
    
    return data.filter(item => {
      const itemValue = item[filterKey];
      if (typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(filterValue.toLowerCase());
      }
      return itemValue === filterValue;
    });
  }, [data, filterKey, filterValue]);
}

/**
 * 가상화를 위한 윈도우 훅
 */
export function useVirtualization(items, itemHeight, containerHeight) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);
  
  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
}

/**
 * 이미지 지연 로딩 훅
 */
export function useLazyImage(src, placeholder = '/placeholder.svg') {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setError(false);
    };
    
    img.onerror = () => {
      setImageSrc(placeholder);
      setIsLoading(false);
      setError(true);
    };
  }, [src, placeholder]);

  return { imageSrc, isLoading, error };
}

/**
 * 네트워크 상태 감지 훅
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * 로컬 스토리지 훅
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

/**
 * 세션 스토리지 훅
 */
export function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
