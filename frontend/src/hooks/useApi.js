import { useState, useCallback } from 'react';

// Generic API call hook with loading, error, data states
// Wraps axios calls with consistent error handling
export function useApi(apiFunc) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (...args) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFunc(...args);
      setData(response);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiFunc]);

  return { data, error, isLoading, execute };
}
