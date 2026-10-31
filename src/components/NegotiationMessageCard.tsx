'use client';

import React, { useState } from 'react';
import type { Language } from '@/types';

interface NegotiationMessageCardProps {
  messages: {
    english: string;
    hinglish: string;
    hindi: string;
  };
  language: Language;
}

export function NegotiationMessageCard({ messages, language }: NegotiationMessageCardProps) {
  const [tone, setTone] = useState<'hinglish' | 'english' | 'hindi'>('hinglish');
  const [copied, setCopied] = useState<boolean>(false);

  const activeMessage = messages[tone] || messages.hinglish;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(activeMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="card space-y-5 border-2 border-green-300 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <div>
            <h3 className="text-lg font-heading font-bold text-gray-900">
              {language === 'hi'
                ? 'वेंडर को भेजने हेतु WhatsApp वार्ता संदेश'
                : 'WhatsApp-Ready Negotiation Reply'}
            </h3>
            <p className="text-xs text-gray-500">
              {language === 'hi'
                ? 'सम्मानजनक, विनम्र और व्यावसायिक संदेश जो बिना कटुता के सभी स्पष्टीकरण मांगता है'
                : 'Polite, culturally adept reply requesting clarification and proposing safe milestone terms'}
            </p>
          </div>
        </div>

        {/* Tone Selector: Hinglish, English, Hindi */}
        <div className="inline-flex rounded-lg border border-cream-300 p-0.5 bg-cream-50 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTone('hinglish')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              tone === 'hinglish'
                ? 'bg-green-800 text-white shadow-xs'
                : 'text-gray-600 hover:text-green-900'
            }`}
          >
            Hinglish (Recommended)
          </button>
          <button
            type="button"
            onClick={() => setTone('english')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              tone === 'english'
                ? 'bg-green-800 text-white shadow-xs'
                : 'text-gray-600 hover:text-green-900'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setTone('hindi')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              tone === 'hindi'
                ? 'bg-green-800 text-white shadow-xs'
                : 'text-gray-600 hover:text-green-900'
            }`}
          >
            हिन्दी (Devanagari)
          </button>
        </div>
      </div>

      {/* Message Preview Box */}
      <div className="relative">
        <div className="p-4 rounded-xl bg-green-50/70 border border-green-200 font-mono text-xs text-gray-900 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
          {activeMessage}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-cream-200">
        <span className="text-[11px] text-gray-500">
          {language === 'hi'
            ? 'कॉपी करके सीधे अपने वेंडर के WhatsApp चैट में पेस्ट करें।'
            : 'Click copy and paste directly into your WhatsApp chat with the vendor.'}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
            copied
              ? 'bg-green-700 text-white ring-2 ring-green-500'
              : 'bg-green-800 hover:bg-green-900 text-white'
          }`}
          aria-label="Copy WhatsApp negotiation message to clipboard"
        >
          <span>{copied ? '✓' : '📋'}</span>
          <span>{copied ? (language === 'hi' ? 'कॉपी हो गया!' : 'Copied to Clipboard!') : (language === 'hi' ? 'WhatsApp संदेश कॉपी करें' : 'Copy WhatsApp Message')}</span>
        </button>
      </div>
    </div>
  );
}
