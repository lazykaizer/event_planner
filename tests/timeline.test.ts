import { describe, it, expect } from 'vitest';
import {
  daysBeforeEvent,
  recalcAfterDelay,
  recalcForNewEventDate,
  getNextTasks,
} from '@/lib/timeline';
import type { TimelineTask } from '@/types';

const SAMPLE_TASKS: TimelineTask[] = [
  {
    id: 'venue_date',
    title: 'Finalize Date & Venue',
    description: 'Book the wedding hall and confirm dates',
    deadline: '2027-01-01',
    dependsOn: [],
    completed: false,
    delayed: false,
    atRisk: false,
    category: 'venue',
  },
  {
    id: 'catering_decor',
    title: 'Book Caterer & Decorator',
    description: 'Tasting sessions and decor theme sign-off',
    deadline: '2027-01-15',
    dependsOn: ['venue_date'],
    completed: false,
    delayed: false,
    atRisk: false,
    category: 'catering',
  },
  {
    id: 'photographer',
    title: 'Book Photographer & Videographer',
    description: 'Confirm candid & traditional photo team',
    deadline: '2027-02-01',
    dependsOn: ['venue_date'],
    completed: false,
    delayed: false,
    atRisk: false,
    category: 'photography_video',
  },
  {
    id: 'invitations',
    title: 'Print and Distribute Cards',
    description: 'Digital invites + physical distribution',
    deadline: '2027-02-15',
    dependsOn: ['catering_decor'],
    completed: false,
    delayed: false,
    atRisk: false,
    category: 'invitations',
  },
];

describe('Timeline Logic', () => {
  const eventDate = '2027-03-01';

  it('calculates days before event correctly', () => {
    const d = daysBeforeEvent('2027-03-01', 30);
    // 30 days before March 1, 2027 (non-leap year, Feb has 28 days: Jan 30)
    expect(d).toBe('2027-01-30');
  });

  it('propagates delays to downstream tasks and marks atRisk if near event date', () => {
    // Delay venue_date from 2027-01-01 to 2027-02-10 (40 days delay)
    const updated = recalcAfterDelay(SAMPLE_TASKS, 'venue_date', '2027-02-10', eventDate);
    
    const venue = updated.find((t) => t.id === 'venue_date');
    const catering = updated.find((t) => t.id === 'catering_decor');
    const invitations = updated.find((t) => t.id === 'invitations');

    expect(venue?.delayed).toBe(true);
    expect(venue?.deadline).toBe('2027-02-10');

    // catering_decor depended on venue_date (+40 days: Jan 15 + 40 days = Feb 24)
    expect(catering?.deadline).toBe('2027-02-24');

    // invitations depended on catering (+40 days: Feb 15 + 40 days = March 27)
    // March 27 is past eventDate (2027-03-01), so invitations must be atRisk!
    expect(invitations?.atRisk).toBe(true);
  });

  it('recalculates deadlines proportionally when event date is moved earlier', () => {
    const oldEventDate = '2027-03-01';
    const newEarlierDate = '2027-02-15'; // 14 days earlier
    const updated = recalcForNewEventDate(SAMPLE_TASKS, oldEventDate, newEarlierDate);

    // venue was 59 days before old event date (Jan 1 to Mar 1)
    // now should be roughly 59 days before Feb 15 or clamped to today
    expect(updated.length).toBe(SAMPLE_TASKS.length);
    const venue = updated.find((t) => t.id === 'venue_date');
    expect(new Date(venue!.deadline).getTime()).toBeLessThan(new Date(newEarlierDate).getTime());
  });

  it('gets next 3 incomplete tasks sorted by deadline', () => {
    const next3 = getNextTasks(SAMPLE_TASKS, 3);
    expect(next3.length).toBe(3);
    expect(next3[0].id).toBe('venue_date');
    expect(next3[1].id).toBe('catering_decor');
    expect(next3[2].id).toBe('photographer');
  });
});
