'use client'

import { useState, useEffect } from 'react'
import Joyride, { CallBackProps, Step, STATUS } from 'react-joyride'
import './onboarding.css'

interface InteractiveTutorialProps {
  onComplete?: () => void
}

export function InteractiveTutorial({ onComplete }: InteractiveTutorialProps) {
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    // Check if user has completed tutorial
    const completed = localStorage.getItem('tutorial_completed')
    
    if (!completed) {
      // Wait a bit before starting
      const timer = setTimeout(() => {
        setRun(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="tutorial-step">
          <h2>Welcome to AIcetro! 🎉</h2>
          <p>Let's set up your AI-powered treasury in a few simple steps.</p>
          <p>This tutorial will take about 2 minutes.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true
    },
    {
      target: '.connect-wallet-btn',
      content: (
        <div className="tutorial-step">
          <h3>Step 1: Connect Your Wallet</h3>
          <p>Click here to connect your MetaMask wallet to the app.</p>
          <p>Make sure you're on <strong>Monad Testnet</strong>.</p>
        </div>
      ),
      placement: 'bottom'
    },
    {
      target: '.create-account-btn',
      content: (
        <div className="tutorial-step">
          <h3>Step 2: Create Smart Account</h3>
          <p>This creates an ERC-4337 Smart Account that the AI will use to execute transactions.</p>
          <p><strong>Important:</strong> This is a one-time setup.</p>
        </div>
      ),
      placement: 'bottom'
    },
    {
      target: '.asset-rules-wizard',
      content: (
        <div className="tutorial-step">
          <h3>Step 3: Set Asset Rules</h3>
          <p>Choose how much capital the AI can manage and which assets it can use.</p>
          <p>You can use presets or customize everything.</p>
        </div>
      ),
      placement: 'right'
    },
    {
      target: '.capital-slider',
      content: (
        <div className="tutorial-step">
          <h3>Allocate AI Capital</h3>
          <p>Drag the slider or enter an amount directly.</p>
          <p>We recommend starting with 10-20% of your portfolio.</p>
          <p><strong>Warning:</strong> Allocations ≥30% require confirmation.</p>
        </div>
      ),
      placement: 'top'
    },
    {
      target: '.delegation-setup',
      content: (
        <div className="tutorial-step">
          <h3>Step 4: Set Delegation</h3>
          <p>Configure daily spending limits and how long the AI can operate.</p>
          <p>This uses MetaMask's delegation framework - you stay in control!</p>
        </div>
      ),
      placement: 'left'
    },
    {
      target: '.ai-controls',
      content: (
        <div className="tutorial-step">
          <h3>Step 5: Control the AI</h3>
          <p>Use these buttons to <strong>Start</strong>, <strong>Pause</strong>, or <strong>Emergency Stop</strong> the AI agent.</p>
          <p>Emergency Stop immediately revokes all permissions.</p>
        </div>
      ),
      placement: 'bottom'
    },
    {
      target: '.portfolio-dashboard',
      content: (
        <div className="tutorial-step">
          <h3>Monitor Your Portfolio</h3>
          <p>Watch real-time performance here:</p>
          <ul>
            <li>Total value and APY</li>
            <li>AI recommendations</li>
            <li>Transaction history</li>
            <li>Fee spending</li>
          </ul>
        </div>
      ),
      placement: 'top'
    },
    {
      target: '.help-button',
      content: (
        <div className="tutorial-step">
          <h2>You're All Set! 🚀</h2>
          <p>Click the <strong>?</strong> button anytime to restart this tutorial.</p>
          <p>Check the docs for advanced features like:</p>
          <ul>
            <li>Deferred transactions (gas optimization)</li>
            <li>Fee limit management</li>
            <li>Manual withdrawals</li>
          </ul>
          <p><strong>Happy investing!</strong></p>
        </div>
      ),
      placement: 'left'
    }
  ]

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, action } = data

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      // Tutorial completed or skipped
      setRun(false)
      localStorage.setItem('tutorial_completed', 'true')
      
      if (onComplete) {
        onComplete()
      }
    }

    if (action === 'next' || action === 'prev') {
      setStepIndex(index + (action === 'next' ? 1 : -1))
    }
  }

  const restartTutorial = () => {
    setStepIndex(0)
    setRun(true)
  }

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        scrollToFirstStep
        disableScrolling={false}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#346ef0',
            textColor: '#ffffff',
            backgroundColor: '#1a1f3a',
            overlayColor: 'rgba(0, 0, 0, 0.7)',
            arrowColor: '#1a1f3a',
            zIndex: 10000
          },
          tooltip: {
            borderRadius: '12px',
            padding: '1.5rem'
          },
          tooltipContainer: {
            textAlign: 'left'
          },
          buttonNext: {
            backgroundColor: '#346ef0',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: 600
          },
          buttonBack: {
            color: '#ffffff',
            marginRight: '1rem'
          },
          buttonSkip: {
            color: 'rgba(255, 255, 255, 0.6)'
          }
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tutorial'
        }}
      />

      {/* Floating Help Button */}
      <button
        className="help-button floating-help"
        onClick={restartTutorial}
        title="Restart Tutorial"
        aria-label="Help"
      >
        ?
      </button>
    </>
  )
}

// Export a wrapper that handles conditional rendering
export function TutorialWrapper() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Show tutorial for new users or if explicitly requested
    const completed = localStorage.getItem('tutorial_completed')
    const requested = sessionStorage.getItem('show_tutorial')
    
    if (!completed || requested === 'true') {
      setShow(true)
    }
  }, [])

  if (!show) {
    return null
  }

  return <InteractiveTutorial onComplete={() => setShow(false)} />
}
