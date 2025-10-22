'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'
import './onboarding.css'

interface ContextualTooltipProps {
  id: string
  content: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  children: ReactNode
  showOnce?: boolean
  delay?: number
}

export function ContextualTooltip({
  id,
  content,
  placement = 'top',
  children,
  showOnce = true,
  delay = 2000
}: ContextualTooltipProps) {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if this tooltip was already dismissed
    if (showOnce) {
      const key = `tooltip_dismissed_${id}`
      const wasDismissed = localStorage.getItem(key) === 'true'
      
      if (wasDismissed) {
        setDismissed(true)
        return
      }
    }

    // Show tooltip after delay
    timeoutRef.current = setTimeout(() => {
      setShow(true)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [id, showOnce, delay])

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)

    if (showOnce) {
      localStorage.setItem(`tooltip_dismissed_${id}`, 'true')
    }
  }

  if (dismissed || !show) {
    return <>{children}</>
  }

  return (
    <div className="contextual-tooltip-container" ref={containerRef}>
      {children}
      
      <div className={`contextual-tooltip ${placement}`}>
        <button
          className="tooltip-close"
          onClick={handleDismiss}
          aria-label="Close tooltip"
        >
          ×
        </button>
        
        <div className="tooltip-content">
          {content}
        </div>
        
        <button
          className="tooltip-got-it"
          onClick={handleDismiss}
        >
          Got it!
        </button>
        
        <div className="tooltip-arrow" />
      </div>
    </div>
  )
}

// Preset tooltips for common elements
export function WalletConnectionTooltip({ children }: { children: ReactNode }) {
  return (
    <ContextualTooltip
      id="wallet-connection"
      content={
        <div>
          <strong>Connect Your Wallet</strong>
          <p>Click here to connect MetaMask. Make sure you're on Monad Testnet!</p>
        </div>
      }
      placement="bottom"
    >
      {children}
    </ContextualTooltip>
  )
}

export function CapitalSliderTooltip({ children }: { children: ReactNode }) {
  return (
    <ContextualTooltip
      id="capital-slider"
      content={
        <div>
          <strong>Set AI Capital</strong>
          <p>This controls how much the AI can manage. You can adjust this anytime.</p>
          <p><em>Tip: Start with 10-20% of your portfolio.</em></p>
        </div>
      }
      placement="top"
      delay={3000}
    >
      {children}
    </ContextualTooltip>
  )
}

export function DailyLimitTooltip({ children }: { children: ReactNode }) {
  return (
    <ContextualTooltip
      id="daily-limit"
      content={
        <div>
          <strong>Daily Spending Limit</strong>
          <p>This prevents the AI from spending more than this amount in 24 hours.</p>
          <p><em>Safety feature - can't be disabled!</em></p>
        </div>
      }
      placement="right"
    >
      {children}
    </ContextualTooltip>
  )
}

export function SwipeCardsTooltip({ children }: { children: ReactNode }) {
  return (
    <ContextualTooltip
      id="swipe-cards"
      content={
        <div>
          <strong>Swipe to Navigate</strong>
          <p>Swipe left or right to see different dashboard cards!</p>
        </div>
      }
      placement="bottom"
      delay={1000}
    >
      {children}
    </ContextualTooltip>
  )
}

export function EmergencyStopTooltip({ children }: { children: ReactNode }) {
  return (
    <ContextualTooltip
      id="emergency-stop"
      content={
        <div>
          <strong>Emergency Stop</strong>
          <p>This immediately revokes ALL AI permissions.</p>
          <p><em>Use only if you see suspicious activity!</em></p>
        </div>
      }
      placement="top"
      showOnce={true}
    >
      {children}
    </ContextualTooltip>
  )
}
