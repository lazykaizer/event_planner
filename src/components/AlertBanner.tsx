'use client';

import React from 'react';

interface AlertBannerProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function AlertBanner({
  type = 'error',
  title,
  message,
  onRetry,
  retryLabel = 'Try Again',
}: AlertBannerProps) {
  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      button: 'bg-red-700 hover:bg-red-800 text-white',
      icon: (
        <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      button: 'bg-amber-700 hover:bg-amber-800 text-white',
      icon: (
        <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      button: 'bg-blue-700 hover:bg-blue-800 text-white',
      icon: (
        <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      button: 'bg-green-700 hover:bg-green-800 text-white',
      icon: (
        <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  }[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`p-4 rounded-xl border ${styles.bg} ${styles.border} ${styles.text} flex items-start justify-between gap-3 shadow-sm`}
    >
      <div className="flex items-start gap-3">
        {styles.icon}
        <div>
          {title && <h4 className="font-semibold text-sm mb-0.5">{title}</h4>}
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-xs ${styles.button}`}
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
