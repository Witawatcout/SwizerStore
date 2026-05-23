import { useAuthStore } from '@/store/auth'

/**
 * Wrapper around useLazyFetch that automatically attaches
 * the Authorization header from the auth store.
 */
export function useAuthFetch<T = any>(url: string, opts: any = {}) {
  const auth = useAuthStore()

  return useLazyFetch<T>(url, {
    ...opts,
    headers: {
      ...opts.headers,
      Authorization: `Bearer ${auth.token || ''}`
    }
  })
}

/**
 * Wrapper around $fetch that automatically attaches
 * the Authorization header from the auth store.
 */
export function $authFetch<T = any>(url: string, opts: any = {}) {
  const auth = useAuthStore()

  return $fetch<T>(url, {
    ...opts,
    headers: {
      ...opts.headers,
      Authorization: `Bearer ${auth.token || ''}`
    }
  })
}
