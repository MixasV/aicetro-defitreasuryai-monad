'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import './toast.css'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType, duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    
    setToasts(prev => [...prev, { id, message, type, duration }])

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id)
      }, duration)
    }
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warning: '⚠'
  }

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-icon">{icons[toast.type]}</div>
      <div className="toast-message">{toast.message}</div>
      <button
        className="toast-close"
        onClick={() => onClose(toast.id)}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  )
}

// Convenience exports
export const toast = {
  success: (message: string, duration?: number) => {
    // This will be replaced by context
    console.log('[Toast] Success:', message)
  },
  error: (message: string, duration?: number) => {
    console.error('[Toast] Error:', message)
  },
  info: (message: string, duration?: number) => {
    console.info('[Toast] Info:', message)
  },
  warning: (message: string, duration?: number) => {
    console.warn('[Toast] Warning:', message)
  }
}

// Usage in components:
/*
const { showToast } = useToast()

// Success
showToast('Smart Account created successfully!', 'success')

// Error
showToast('Failed to set delegation', 'error')

// Info
showToast('AI paused - no actions will be executed', 'info')

// Warning
showToast('Gas price is high - consider deferring', 'warning', 8000)
*/
