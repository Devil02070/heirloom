import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = '/api'

async function fetchJson(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

/**
 * Drop-in replacement for the old useApi — backed by TanStack Query.
 * Returns { data, loading, error, refetch } to keep existing call sites working.
 * Query key is the endpoint string, so two components using the same endpoint
 * share one cache entry (auto-dedupe).
 */
export function useApi(endpoint, options = {}) {
  const query = useQuery({
    queryKey: [endpoint],
    queryFn: () => fetchJson(endpoint),
    staleTime: 10_000, // 10s — dashboards feel live without hammering the server
    refetchOnWindowFocus: true,
    retry: 1,
    ...options,
  })
  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

/**
 * One-shot POST with no caching. Invalidates the queryKey passed in `invalidate`
 * so dependent queries refetch after a successful write.
 */
export async function apiPost(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function apiDelete(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

/**
 * Hook version of apiPost — automatically invalidates related queries on success.
 *   const postConfig = useApiMutation('POST', '/config', ['/config', '/status'])
 *   postConfig.mutate(newConfig)
 */
export function useApiMutation(method, endpoint, invalidateKeys = []) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body) => {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      invalidateKeys.forEach(k => queryClient.invalidateQueries({ queryKey: [k] }))
    },
  })
}
