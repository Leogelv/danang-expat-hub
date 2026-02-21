import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('lucide-react', () => {
  const S = (props: any) => <div {...props} />;
  return { Check: S, Star: S, XCircle: S };
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RsvpButton, type RsvpButtonProps } from '../ui/RsvpButton';

const defaultProps: RsvpButtonProps = {
  eventId: 'evt-1',
  userId: 'user-1',
  currentStatus: null,
  onStatusChange: vi.fn(),
};

const renderButton = (overrides: Partial<RsvpButtonProps> = {}) =>
  render(<RsvpButton {...defaultProps} {...overrides} />);

describe('RsvpButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  it('renders three RSVP buttons', () => {
    renderButton();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);

    // useTranslations мок возвращает ключи: going, interested, notGoing
    expect(screen.getByText('going')).toBeTruthy();
    expect(screen.getByText('interested')).toBeTruthy();
    expect(screen.getByText('notGoing')).toBeTruthy();
  });

  it('calls fetch when button is clicked', async () => {
    renderButton();
    const user = userEvent.setup();

    const goingBtn = screen.getByText('going').closest('button')!;
    await user.click(goingBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/events/evt-1/rsvp',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 'user-1', status: 'going' }),
        })
      );
    });
  });

  it('highlights active status', () => {
    renderButton({ currentStatus: 'going' });

    const goingBtn = screen.getByText('going').closest('button')!;
    expect(goingBtn.className).toContain('emerald');
  });

  it('toggles to not_going when same button clicked again', async () => {
    renderButton({ currentStatus: 'going' });
    const user = userEvent.setup();

    const goingBtn = screen.getByText('going').closest('button')!;
    await user.click(goingBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/events/evt-1/rsvp',
        expect.objectContaining({
          body: JSON.stringify({ user_id: 'user-1', status: 'not_going' }),
        })
      );
    });
  });
});
