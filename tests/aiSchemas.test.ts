import { describe, it, expect } from 'vitest';
import {
  AIBudgetResponseSchema,
  AIWhatIfResponseSchema,
  AIVendorQuoteSchema,
  AITimelineResponseSchema,
} from '@/lib/schemas';

describe('AI Response Schemas', () => {
  describe('AIBudgetResponseSchema', () => {
    it('accepts valid AI budget allocation summing to 100%', () => {
      const valid = {
        allocations: [
          { category: 'venue', percentage: 25, reasoning: 'Standard venue allocation' },
          { category: 'catering', percentage: 30, reasoning: 'Food is priority' },
          { category: 'decoration', percentage: 10, reasoning: 'Traditional flowers' },
          { category: 'photography_video', percentage: 10, reasoning: 'Candid shoots' },
          { category: 'attire_jewellery', percentage: 8, reasoning: 'Bridal & Groom wear' },
          { category: 'invitations', percentage: 3, reasoning: 'Eco e-invites' },
          { category: 'entertainment', percentage: 4, reasoning: 'DJ and Dhol' },
          { category: 'transport_stay', percentage: 3, reasoning: 'Close guest logistics' },
          { category: 'contingency', percentage: 5, reasoning: 'Buffer for escalations' },
          { category: 'misc', percentage: 2, reasoning: 'Pandit ji & pooja items' },
        ],
        summary: 'Balanced budget tailored for 200 guests with priority on food and venue.',
      };
      const result = AIBudgetResponseSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects allocations that do not sum to 100%', () => {
      const invalid = {
        allocations: [
          { category: 'venue', percentage: 50, reasoning: 'Half' },
          { category: 'catering', percentage: 30, reasoning: 'Third' },
        ],
        summary: 'Incomplete allocation',
      };
      const result = AIBudgetResponseSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects invalid category names', () => {
      const invalid = {
        allocations: [
          { category: 'honeymoon', percentage: 100, reasoning: 'Not allowed' },
        ],
        summary: 'Invalid category',
      };
      const result = AIBudgetResponseSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('AIWhatIfResponseSchema', () => {
    it('accepts valid what-if response with trade-offs and options', () => {
      const valid = {
        delta: {
          budgetMultiplier: 0.8,
          newGuestCount: null,
          newEventDate: null,
          categoryAdjustments: {
            decoration: -5,
            catering: -5,
          },
        },
        options: [
          {
            id: 'option_1',
            title: 'Protect Guest Hospitality, Trim Decor',
            description: 'Scale back elaborate floral setups to preserve food variety.',
            allocations: [
              { category: 'catering', percentage: 35, reasoning: 'Kept strong' },
              { category: 'decoration', percentage: 5, reasoning: 'Minimalist' },
            ],
          },
        ],
        tradeOffExplanation:
          'A 20% budget cut requires compromising on aesthetic elements to preserve core hospitality.',
      };
      const result = AIWhatIfResponseSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('AIVendorQuoteSchema', () => {
    it('accepts valid structured vendor quotes and flags', () => {
      const valid = {
        vendors: [
          {
            vendorName: 'Royal Caterers',
            vendorType: 'caterer',
            totalPrice: 240000,
            pricePerUnit: 1200,
            unitDescription: 'per plate',
            included: ['Dinner buffet', 'Live chaat', 'Dessert counter'],
            notIncluded: ['Crockery breakdown penalty', 'Waitstaff tips'],
            guestsCovered: 200,
            extraCharges: ['₹5,000 generator fuel'],
            advanceRequested: 100000,
            advancePercentage: 41.6,
            cancellationTerms: '50% forfeit on cancellation',
            missingInfo: ['Staff uniform policy', 'Water bottles included or extra?'],
          },
        ],
        aiRedFlags: [
          {
            vendorIndex: 0,
            severity: 'medium',
            message: 'Advance of over 40% requested without clear refund breakdown.',
          },
        ],
      };
      const result = AIVendorQuoteSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('AITimelineResponseSchema', () => {
    it('accepts valid generated timeline tasks with dependencies', () => {
      const valid = {
        tasks: [
          {
            id: 'venue_booking',
            title: 'Book Venue',
            description: 'Lock wedding hall contract',
            deadline: '2027-01-15',
            dependsOn: [],
            category: 'venue',
          },
          {
            id: 'caterer_booking',
            title: 'Book Caterer',
            description: 'Finalize menu and tasting',
            deadline: '2027-01-30',
            dependsOn: ['venue_booking'],
            category: 'catering',
          },
        ],
      };
      const result = AITimelineResponseSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });
});
