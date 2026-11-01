import { describe, it, expect, vi } from 'vitest';
import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LiveDemoSection } from '@/components/landing/LiveDemoSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { SAMPLE_LANDING_EXTRACTED } from '@/lib/landingSample';
import { calculateTrueCost } from '@/lib/costMath';
import { formatINR } from '@/lib/formatters';
import type { Language } from '@/types';

describe('Landing Page Interactive Demo & Hero Tests', () => {
  it('1. Live demo displayed cost matches calculateTrueCost at 250 and 100 guest counts', () => {
    const mockOpenSample = vi.fn();
    render(<LiveDemoSection language="en" onOpenSampleInXRay={mockOpenSample} />);

    // Default guest count is 250
    const expectedCost250 = calculateTrueCost(SAMPLE_LANDING_EXTRACTED, 250).totalTrueCost;
    const formattedExpected250 = formatINR(expectedCost250);

    const costDisplay = screen.getByTestId('demo-total-cost');
    expect(costDisplay.textContent).toBe(formattedExpected250);

    // Slide to 100 guests
    const slider = screen.getByRole('slider', { name: /Guest Count/i });
    fireEvent.change(slider, { target: { value: '100' } });

    const expectedCost100 = calculateTrueCost(SAMPLE_LANDING_EXTRACTED, 100).totalTrueCost;
    const formattedExpected100 = formatINR(expectedCost100);

    expect(costDisplay.textContent).toBe(formattedExpected100);
  });

  it('2. Language toggle switches the Hero headline between English and Hindi', () => {
    function TestWrapper() {
      const [lang, setLang] = useState<Language>('en');
      return (
        <div>
          <button type="button" onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}>
            Toggle
          </button>
          <HeroSection
            language={lang}
            onXRayClick={() => {}}
            onPlanClick={() => {}}
          />
        </div>
      );
    }

    render(<TestWrapper />);

    // Initially English
    expect(
      screen.getByText("Don't pay the advance until you've X-Rayed the quote.")
    ).toBeDefined();

    // Toggle to Hindi
    fireEvent.click(screen.getByText('Toggle'));

    expect(
      screen.getByText('कोटेशन का एक्स-रे किए बिना कभी भी एडवांस न दें!')
    ).toBeDefined();
  });
});
