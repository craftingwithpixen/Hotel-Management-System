import { useState, useEffect } from 'react';

/**
 * useDebounce — delays updating a value until after `delay` ms have passed
 * since the last change. Useful for search inputs to avoid API call per keystroke.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchTerm, 400);
 *   useEffect(() => { fetchResults(debouncedSearch); }, [debouncedSearch]);
 */
export default function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
