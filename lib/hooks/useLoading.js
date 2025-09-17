import { useState, useCallback } from 'react'

// 기본 로딩 상태 관리 훅
export function useLoading(initialState = false) {
  const [loading, setLoading] = useState(initialState)
  
  const startLoading = useCallback(() => setLoading(true), [])
  const stopLoading = useCallback(() => setLoading(false), [])
  const toggleLoading = useCallback(() => setLoading(prev => !prev), [])
  
  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    toggleLoading
  }
}

// 비동기 작업을 위한 로딩 훅
export function useAsyncLoading() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const execute = useCallback(async (asyncFunction) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await asyncFunction()
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  return {
    loading,
    error,
    execute,
    setLoading,
    setError
  }
}

// 다중 로딩 상태 관리 훅
export function useMultiLoading() {
  const [loadingStates, setLoadingStates] = useState({})
  
  const setLoading = useCallback((key, value) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])
  
  const startLoading = useCallback((key) => {
    setLoading(key, true)
  }, [setLoading])
  
  const stopLoading = useCallback((key) => {
    setLoading(key, false)
  }, [setLoading])
  
  const isLoading = useCallback((key) => {
    return loadingStates[key] || false
  }, [loadingStates])
  
  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean)
  }, [loadingStates])
  
  return {
    loadingStates,
    setLoading,
    startLoading,
    stopLoading,
    isLoading,
    isAnyLoading
  }
}

// 타이머 기반 로딩 훅 (최소 로딩 시간 보장)
export function useTimedLoading(minDuration = 500) {
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState(null)
  
  const startLoading = useCallback(() => {
    setLoading(true)
    setStartTime(Date.now())
  }, [])
  
  const stopLoading = useCallback(() => {
    if (!startTime) {
      setLoading(false)
      return
    }
    
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, minDuration - elapsed)
    
    setTimeout(() => {
      setLoading(false)
      setStartTime(null)
    }, remaining)
  }, [startTime, minDuration])
  
  return {
    loading,
    startLoading,
    stopLoading,
    setLoading
  }
}
