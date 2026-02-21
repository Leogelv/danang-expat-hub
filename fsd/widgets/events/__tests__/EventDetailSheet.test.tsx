import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({ push: vi.fn(), back: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock('lucide-react', () => {
  const S = (props: any) => <div {...props} />;
  return { X: S, MapPin: S, Clock: S, Users: S, DollarSign: S, Calendar: S };
});

// Мок RsvpButton
vi.mock('@/fsd/features/events/rsvp', () => ({
  RsvpButton: (props: any) => (
    <div data-testid="rsvp-button" data-event-id={props.eventId} />
  ),
}));

// Мок date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 days ago',
  format: (_date: any, pattern: string) => {
    if (pattern === 'EEEE, MMM d') return 'Saturday, Mar 1';
    if (pattern === 'h:mm a') return '10:00 AM';
    return 'mock-date';
  },
}));

import { render, screen, fireEvent } from '@testing-library/react';
import {
  EventDetailSheet,
  type EventDetailSheetProps,
  type EventDetail,
} from '../EventDetailSheet';

const mockEvent: EventDetail = {
  id: 'evt-1',
  title: 'Beach Volleyball',
  description: 'Fun game at the beach',
  category: 'sports',
  starts_at: '2025-03-01T10:00:00Z',
  ends_at: '2025-03-01T12:00:00Z',
  location: 'My Khe Beach',
  price: 0,
  max_participants: 20,
  organizer_contact: '@organizer',
  attendees_count: 5,
  created_at: '2025-02-15T10:00:00Z',
};

const defaultProps: EventDetailSheetProps = {
  event: mockEvent,
  isOpen: true,
  onClose: vi.fn(),
  userId: 'user-1',
};

const renderSheet = (overrides: Partial<EventDetailSheetProps> = {}) =>
  render(<EventDetailSheet {...defaultProps} {...overrides} />);

describe('EventDetailSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed or no event', () => {
    const { container: c1 } = renderSheet({ isOpen: false });
    expect(c1.innerHTML).toBe('');

    const { container: c2 } = renderSheet({ event: null });
    expect(c2.innerHTML).toBe('');
  });

  it('renders event details when open', () => {
    renderSheet();

    expect(screen.getByText('Beach Volleyball')).toBeTruthy();
    expect(screen.getByText('Fun game at the beach')).toBeTruthy();
    expect(screen.getByText('sports')).toBeTruthy();
    expect(screen.getByText('My Khe Beach')).toBeTruthy();
  });

  it('renders RSVP button when userId provided', () => {
    renderSheet({ userId: 'user-1' });

    const rsvpBtn = screen.getByTestId('rsvp-button');
    expect(rsvpBtn).toBeTruthy();
    expect(rsvpBtn.getAttribute('data-event-id')).toBe('evt-1');
  });

  it('does not render RSVP when no userId', () => {
    renderSheet({ userId: undefined });

    expect(screen.queryByTestId('rsvp-button')).toBeNull();
  });

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn();
    const { container } = renderSheet({ onClose });

    const backdrop = container.querySelector('.fixed.inset-0')!;
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
