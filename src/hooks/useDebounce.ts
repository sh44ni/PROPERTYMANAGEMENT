import { useState, useEffect } from 'react';

/**
 * Delays updating the returned value until `delay` ms after the last change.
 * Use this to avoid firing API calls / expensive filters on every keystroke.
 *
 * @example
 * const debouncedQuery = useDebounce(searchQuery, 300);
 * useEffect(() => { fetchData(debouncedQuery); }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delay = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
