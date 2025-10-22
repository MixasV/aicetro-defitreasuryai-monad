'use client'

import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import './mobile.css'

interface Portfolio {
  totalValueUsd: number
  netAPY: number
  dailyYield: number
  change24h: number
  positions: Array<{
    protocol: string
    asset: string
    valueUSD: number
    currentAPY: number
  }>
}

interface AIStatus {
  running: boolean
  status: 'active' | 'paused' | 'stopped'
  lastAction?: string
  nextActionIn?: number
  confidence?: number
}

interface Delegation {
  dailyLimitUsd: number
  spent24h: number
  remainingDailyLimitUsd: number
  validUntil: Date
}

interface Activity {
  id: string
  type: 'deposit' | 'withdraw' | 'swap'
  protocol: string
  amount: number
  timestamp: Date
  success: boolean
}

export function MobileDashboard() {
  const [portfolio, setPortfolio] = useState<Portfolio>({
    totalValueUsd: 0,
    netAPY: 0,
    dailyYield: 0,
    change24h: 0,
    positions: []
  })
  const [aiStatus, setAIStatus] = useState<AIStatus>({
    running: false,
    status: 'stopped'
  })
  const [delegation, setDelegation] = useState<Delegation>({
    dailyLimitUsd: 0,
    spent24h: 0,
    remainingDailyLimitUsd: 0,
    validUntil: new Date()
  })
  const [history, setHistory] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Load all data in parallel
      const [portfolioData, aiData, delegationData, activityData] = await Promise.all([
        fetch('/api/portfolio').then(r => r.json()),
        fetch('/api/ai/status').then(r => r.json()),
        fetch('/api/delegations/current').then(r => r.json()),
        fetch('/api/history?limit=10').then(r => r.json())
      ])

      setPortfolio(portfolioData)
      setAIStatus(aiData)
      setDelegation(delegationData)
      setHistory(activityData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResume = async () => {
    try {
      await fetch('/api/ai/resume', { method: 'POST' })
      await loadDashboardData()
    } catch (error) {
      console.error('Failed to resume AI:', error)
    }
  }

  const handlePause = async () => {
    try {
      await fetch('/api/ai/pause', { method: 'POST' })
      await loadDashboardData()
    } catch (error) {
      console.error('Failed to pause AI:', error)
    }
  }

  const handleEmergencyStop = async () => {
    if (confirm('Emergency stop will revoke all AI permissions. Continue?')) {
      try {
        await fetch('/api/ai/emergency-stop', { method: 'POST' })
        await loadDashboardData()
      } catch (error) {
        console.error('Failed to emergency stop:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="mobile-dashboard loading">
        <div className="spinner">Loading...</div>
      </div>
    )
  }

  return (
    <div className="mobile-dashboard">
      {/* Header */}
      <div className="mobile-header">
        <div className="header-left">
          <h1>AIcetro</h1>
          <span className="chain-badge">Monad Testnet</span>
        </div>
        <button className="settings-btn" aria-label="Settings">
          ⚙️
        </button>
      </div>

      {/* Swipeable Cards */}
      <Swiper
        modules={[Pagination]}
        spaceBetween={16}
        slidesPerView={1}
        pagination={{ clickable: true }}
        className="cards-carousel"
      >
        {/* Portfolio Card */}
        <SwiperSlide>
          <div className="mobile-card">
            <div className="card-header">
              <h3>Portfolio</h3>
              <span className={`change ${portfolio.change24h >= 0 ? 'positive' : 'negative'}`}>
                {portfolio.change24h >= 0 ? '+' : ''}{portfolio.change24h.toFixed(2)}%
              </span>
            </div>
            
            <div className="big-value">
              ${portfolio.totalValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            
            <div className="metrics-grid">
              <div className="metric-mini">
                <div className="label">APY</div>
                <div className="value">{portfolio.netAPY.toFixed(2)}%</div>
              </div>
              <div className="metric-mini">
                <div className="label">Daily Yield</div>
                <div className="value">${portfolio.dailyYield.toFixed(2)}</div>
              </div>
              <div className="metric-mini">
                <div className="label">Positions</div>
                <div className="value">{portfolio.positions.length}</div>
              </div>
            </div>
            
            {portfolio.positions.length > 0 && (
              <div className="positions-list">
                {portfolio.positions.slice(0, 3).map((pos, i) => (
                  <div key={i} className="position-row">
                    <div className="position-info">
                      <span className="protocol">{pos.protocol}</span>
                      <span className="apy">{pos.currentAPY.toFixed(2)}% APY</span>
                    </div>
                    <div className="position-value">
                      ${pos.valueUSD.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SwiperSlide>
        
        {/* AI Agent Card */}
        <SwiperSlide>
          <div className="mobile-card">
            <div className="card-header">
              <h3>AI Agent</h3>
              <span className={`status-badge ${aiStatus.status}`}>
                {aiStatus.status === 'active' && '🟢 Active'}
                {aiStatus.status === 'paused' && '🟡 Paused'}
                {aiStatus.status === 'stopped' && '🔴 Stopped'}
              </span>
            </div>
            
            <div className="ai-status-content">
              {aiStatus.running ? (
                <>
                  <div className="status-icon">🤖</div>
                  <div className="status-text">AI is monitoring your portfolio</div>
                  {aiStatus.lastAction && (
                    <div className="last-action">
                      Last: {aiStatus.lastAction}
                    </div>
                  )}
                  {aiStatus.nextActionIn && (
                    <div className="next-action">
                      Next check in {Math.floor(aiStatus.nextActionIn / 60)}m
                    </div>
                  )}
                  {aiStatus.confidence && (
                    <div className="confidence">
                      Confidence: {(aiStatus.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="status-icon">😴</div>
                  <div className="status-text">AI is paused</div>
                  <div className="hint">Tap Resume to activate</div>
                </>
              )}
            </div>
            
            <div className="quick-actions">
              <button
                className="quick-action"
                onClick={handleResume}
                disabled={aiStatus.running}
              >
                <span className="icon">▶️</span>
                <span className="label">Resume</span>
              </button>
              <button
                className="quick-action"
                onClick={handlePause}
                disabled={!aiStatus.running}
              >
                <span className="icon">⏸️</span>
                <span className="label">Pause</span>
              </button>
              <button
                className="quick-action danger"
                onClick={handleEmergencyStop}
              >
                <span className="icon">🛑</span>
                <span className="label">Stop</span>
              </button>
            </div>
          </div>
        </SwiperSlide>
        
        {/* Delegation Card */}
        <SwiperSlide>
          <div className="mobile-card">
            <div className="card-header">
              <h3>Delegation</h3>
              <span className="expires">
                Expires: {new Date(delegation.validUntil).toLocaleDateString()}
              </span>
            </div>
            
            <div className="delegation-content">
              <div className="limit-info">
                <div className="label">Daily Limit</div>
                <div className="value">${delegation.dailyLimitUsd.toLocaleString()}</div>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="fill" 
                  style={{ 
                    width: `${(delegation.spent24h / delegation.dailyLimitUsd) * 100}%` 
                  }}
                />
              </div>
              
              <div className="metrics-grid">
                <div className="metric-mini">
                  <div className="label">Spent</div>
                  <div className="value">${delegation.spent24h.toFixed(0)}</div>
                </div>
                <div className="metric-mini">
                  <div className="label">Remaining</div>
                  <div className="value">${delegation.remainingDailyLimitUsd.toFixed(0)}</div>
                </div>
                <div className="metric-mini">
                  <div className="label">Usage</div>
                  <div className="value">
                    {((delegation.spent24h / delegation.dailyLimitUsd) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
        
        {/* Activity Card */}
        <SwiperSlide>
          <div className="mobile-card">
            <div className="card-header">
              <h3>Recent Activity</h3>
            </div>
            
            {history.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📭</div>
                <div className="text">No activity yet</div>
                <div className="hint">AI will show transactions here</div>
              </div>
            ) : (
              <div className="activity-list">
                {history.map(item => (
                  <div key={item.id} className="activity-item">
                    <div className="activity-icon">
                      {item.type === 'deposit' && '⬇️'}
                      {item.type === 'withdraw' && '⬆️'}
                      {item.type === 'swap' && '🔄'}
                    </div>
                    <div className="activity-details">
                      <div className="activity-action">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </div>
                      <div className="activity-protocol">{item.protocol}</div>
                      <div className="activity-timestamp">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="activity-amount">
                      ${item.amount.toLocaleString()}
                    </div>
                    <div className={`activity-status ${item.success ? 'success' : 'failed'}`}>
                      {item.success ? '✓' : '✗'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SwiperSlide>
      </Swiper>
      
      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className="nav-item active">
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </button>
        <button className="nav-item">
          <span className="nav-icon">📊</span>
          <span className="nav-label">Portfolio</span>
        </button>
        <button className="nav-item">
          <span className="nav-icon">🤖</span>
          <span className="nav-label">AI</span>
        </button>
        <button className="nav-item">
          <span className="nav-icon">📜</span>
          <span className="nav-label">History</span>
        </button>
        <button className="nav-item">
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Settings</span>
        </button>
      </nav>
    </div>
  )
}
