'use client';

import { useState } from 'react';
import { Sparkles, Clock, X } from 'lucide-react';

interface AIAgentStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNow: () => Promise<void>;
  onStartLater: () => void;
  aiAgentAddress: string;
}

export function AIAgentStartModal({
  isOpen,
  onClose,
  onStartNow,
  onStartLater,
  aiAgentAddress
}: AIAgentStartModalProps) {
  const [isStarting, setIsStarting] = useState(false);

  if (!isOpen) return null;

  const handleStartNow = async () => {
    setIsStarting(true);
    try {
      await onStartNow();
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        {/* Modal Card */}
        <div className="glass-card p-6 space-y-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-primary-500/20 border border-emerald-400/30 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-white">
              AI Agent Created Successfully!
            </h2>
            <p className="text-slate-300 text-sm">
              Your AI agent is ready to manage delegated funds within your configured limits.
            </p>
            
            {/* AI Agent Address */}
            <div className="bg-black/30 border border-white/10 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">AI Agent Address</p>
              <p className="text-xs font-mono text-emerald-400 break-all">
                {aiAgentAddress}
              </p>
            </div>

            <p className="text-sm text-slate-400">
              Would you like to start the AI agent now?
            </p>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Later Button */}
            <button
              onClick={onStartLater}
              disabled={isStarting}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Clock className="w-4 h-4" />
              <span className="font-medium">Later</span>
            </button>

            {/* Start Now Button */}
            <button
              onClick={handleStartNow}
              disabled={isStarting}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-primary-500 text-white font-medium hover:from-emerald-600 hover:to-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Now</span>
                </>
              )}
            </button>
          </div>

          {/* Info Text */}
          <p className="text-xs text-slate-500 text-center">
            The AI agent will analyze available DeFi protocols and invest funds within your daily limit.
          </p>
        </div>
      </div>
    </div>
  );
}
