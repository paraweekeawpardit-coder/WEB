import { useCallback, useEffect, useRef, useState } from 'react'

// เรียก fetcher ซ้ำทุก ms มิลลิวินาที ใช้แทน real-time
// ตัวอย่าง: const { data, error, loading, reload } = usePolling(() => api.getOrders(), 4000)
export default function usePolling(fetcher, ms = 4000) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const aliveRef = useRef(true)

  const load = useCallback(async () => {
    try {
      const result = await fetcherRef.current()
      if (aliveRef.current) {
        setData(result)
        setError(null)
      }
    } catch (e) {
      if (aliveRef.current) setError(e)
    } finally {
      if (aliveRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    aliveRef.current = true
    load()
    const timer = setInterval(load, ms)
    return () => {
      aliveRef.current = false
      clearInterval(timer)
    }
  }, [ms, load])

  return { data, error, loading, reload: load }
}