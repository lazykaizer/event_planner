import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IntakeWizard } from '@/components/IntakeWizard';

describe('IntakeWizard Component', () => {
  it('renders step 1 and validates advancing to step 2', () => {
    const mockSubmit = vi.fn();
    const mockClear = vi.fn();

    render(
      <IntakeWizard
        language="en"
        onSubmit={mockSubmit}
        isLoading={false}
        error={null}
        onClearError={mockClear}
      />
    );

    // Initial step heading
    expect(screen.getByText('Occasion & Celebration Style')).toBeDefined();

    // Advance to Step 2
    const nextBtn = screen.getByText('Next Step →');
    fireEvent.click(nextBtn);

    // Now in Step 2: Budget, Guests & Location
    expect(screen.getByText('Budget, Guests & Location')).toBeDefined();
    expect(screen.getByLabelText(/Total Budget/i)).toBeDefined();
  });

  it('pre-fills inputs when Load Sample Scenario button is clicked', () => {
    const mockSubmit = vi.fn();
    const mockClear = vi.fn();

    render(
      <IntakeWizard
        language="en"
        onSubmit={mockSubmit}
        isLoading={false}
        error={null}
        onClearError={mockClear}
      />
    );

    const sampleBtn = screen.getByText('Load Sample Scenario');
    fireEvent.click(sampleBtn);

    // Advance to step 2 to verify pre-filled values
    const nextBtn = screen.getByText('Next Step →');
    fireEvent.click(nextBtn);

    const budgetInput = screen.getByLabelText(/Total Budget/i) as HTMLInputElement;
    const guestInput = screen.getByLabelText(/Guest Count/i) as HTMLInputElement;
    const cityInput = screen.getByLabelText(/Event City/i) as HTMLInputElement;

    expect(budgetInput.value).toBe('8,00,000');
    expect(guestInput.value).toBe('200');
    expect(cityInput.value).toBe('Jaipur');
  });

  it('validates invalid budget and displays error message', () => {
    const mockSubmit = vi.fn();
    const mockClear = vi.fn();

    render(
      <IntakeWizard
        language="en"
        onSubmit={mockSubmit}
        isLoading={false}
        error={null}
        onClearError={mockClear}
      />
    );

    // Move to step 2
    fireEvent.click(screen.getByText('Next Step →'));

    // Set invalid budget
    const budgetInput = screen.getByLabelText(/Total Budget/i);
    fireEvent.change(budgetInput, { target: { value: '0' } });

    // Try to move to step 3
    fireEvent.click(screen.getByText('Next Step →'));

    // Error message must be visible
    expect(screen.getByText('Budget must be at least ₹10,000')).toBeDefined();
  });
});
