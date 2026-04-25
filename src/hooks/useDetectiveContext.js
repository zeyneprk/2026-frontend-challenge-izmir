import { useContext } from 'react'
import { DetectiveContext } from '../context/detectiveContext.js'

export function useDetectiveContext() {
  const ctx = useContext(DetectiveContext)
  if (ctx == null) {
    throw new Error('useDetectiveContext must be used within DetectiveProvider')
  }
  return ctx
}
