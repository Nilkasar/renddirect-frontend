import { useState, useCallback, useEffect, useRef } from 'react';
import { AxiosResponse } from 'axios';
import { ApiError, extractData } from '../lib/api';
import toast from 'react-hot-toast';

/**
 * State for API hook
 */
interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
}

/**
 * Options for useApi hook
 */
interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  showErrorToast?: boolean;
  initialData?: T | null;
}

/**
 * Custom hook for making API calls with loading and error states
 */
export function useApi<T>(
  apiFunction: () => Promise<AxiosResponse<any>>,
  options: UseApiOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    showErrorToast = true,
    initialData = null,
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  });

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiFunction();
      const data = extractData<T>(response);

      if (isMounted.current) {
        setState({ data, isLoading: false, error: null });
        onSuccess?.(data);
      }

      return { data, error: null };
    } catch (err) {
      const error = err instanceof ApiError ? err : new ApiError('An unexpected error occurred');

      if (isMounted.current) {
        setState(prev => ({ ...prev, isLoading: false, error }));

        if (showErrorToast) {
          toast.error(error.message);
        }

        onError?.(error);
      }

      return { data: null, error };
    }
  }, [apiFunction, onSuccess, onError, showErrorToast]);

  const reset = useCallback(() => {
    setState({ data: initialData, isLoading: false, error: null });
  }, [initialData]);

  return {
    ...state,
    execute,
    reset,
    setData: (data: T | null) => setState(prev => ({ ...prev, data })),
  };
}

/**
 * Custom hook for making API calls that run automatically on mount
 */
export function useFetch<T>(
  apiFunction: () => Promise<AxiosResponse<any>>,
  dependencies: any[] = [],
  options: UseApiOptions<T> = {}
) {
  const { execute, ...rest } = useApi<T>(apiFunction, options);

  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { ...rest, refetch: execute };
}

/**
 * Options for useMutation hook
 */
interface UseMutationOptions<T, V> {
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: ApiError, variables: V) => void;
  showErrorToast?: boolean;
  showSuccessToast?: string | boolean;
}

/**
 * Custom hook for mutations (POST, PUT, DELETE operations)
 */
export function useMutation<T, V = void>(
  mutationFn: (variables: V) => Promise<AxiosResponse<any>>,
  options: UseMutationOptions<T, V> = {}
) {
  const {
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = false,
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const mutate = useCallback(
    async (variables: V): Promise<{ data: T | null; error: ApiError | null }> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await mutationFn(variables);
        const data = extractData<T>(response);

        if (isMounted.current) {
          setState({ data, isLoading: false, error: null });

          if (showSuccessToast) {
            const message = typeof showSuccessToast === 'string'
              ? showSuccessToast
              : 'Operation successful';
            toast.success(message);
          }

          onSuccess?.(data, variables);
        }

        return { data, error: null };
      } catch (err) {
        const error = err instanceof ApiError ? err : new ApiError('An unexpected error occurred');

        if (isMounted.current) {
          setState(prev => ({ ...prev, isLoading: false, error }));

          if (showErrorToast) {
            toast.error(error.message);
          }

          onError?.(error, variables);
        }

        return { data: null, error };
      }
    },
    [mutationFn, onSuccess, onError, showErrorToast, showSuccessToast]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

/**
 * Hook for paginated data fetching
 */
interface PaginationState<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface UsePaginatedOptions<T> {
  initialPage?: number;
  initialLimit?: number;
  onSuccess?: (data: PaginationState<T>) => void;
  onError?: (error: ApiError) => void;
}

export function usePaginated<T>(
  fetchFn: (page: number, limit: number) => Promise<AxiosResponse<any>>,
  options: UsePaginatedOptions<T> = {}
) {
  const { initialPage = 1, initialLimit = 10, onSuccess, onError } = options;

  const [pagination, setPagination] = useState<PaginationState<T>>({
    items: [],
    total: 0,
    page: initialPage,
    limit: initialLimit,
    totalPages: 0,
    hasMore: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchPage = useCallback(
    async (page: number, limit: number = pagination.limit) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchFn(page, limit);
        const responseData = response.data?.data;

        const newState: PaginationState<T> = {
          items: responseData?.items || [],
          total: responseData?.pagination?.total || 0,
          page: responseData?.pagination?.page || page,
          limit: responseData?.pagination?.limit || limit,
          totalPages: responseData?.pagination?.totalPages || 0,
          hasMore: responseData?.pagination?.hasMore || false,
        };

        setPagination(newState);
        onSuccess?.(newState);
        return { data: newState, error: null };
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError('Failed to fetch data');
        setError(apiError);
        toast.error(apiError.message);
        onError?.(apiError);
        return { data: null, error: apiError };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFn, pagination.limit, onSuccess, onError]
  );

  const goToPage = useCallback(
    (page: number) => fetchPage(page),
    [fetchPage]
  );

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      return fetchPage(pagination.page + 1);
    }
  }, [pagination.page, pagination.totalPages, fetchPage]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      return fetchPage(pagination.page - 1);
    }
  }, [pagination.page, fetchPage]);

  const setLimit = useCallback(
    (limit: number) => fetchPage(1, limit),
    [fetchPage]
  );

  const refresh = useCallback(
    () => fetchPage(pagination.page, pagination.limit),
    [fetchPage, pagination.page, pagination.limit]
  );

  return {
    ...pagination,
    isLoading,
    error,
    fetchPage,
    goToPage,
    nextPage,
    prevPage,
    setLimit,
    refresh,
  };
}
