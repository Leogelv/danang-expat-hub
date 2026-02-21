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
  return { X: S, CalendarPlus: S, MapPin: S, Clock: S, Users: S, DollarSign: S, Phone: S };
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CreateEventModal,
  type CreateEventModalProps,
} from '../ui/CreateEventModal';

const defaultProps: CreateEventModalProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
};

const renderModal = (overrides: Partial<CreateEventModalProps> = {}) =>
  render(<CreateEventModal {...defaultProps} {...overrides} />);

describe('CreateEventModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = renderModal({ isOpen: false });
    expect(container.innerHTML).toBe('');
  });

  it('renders modal when isOpen is true', () => {
    const { container } = renderModal();
    expect(container.querySelector('form')).toBeTruthy();
  });

  it('submit button is disabled when required fields are empty', () => {
    renderModal();
    const submitBtn = screen.getByRole('button', { name: /create|loading/i });
    expect(submitBtn).toBeDisabled();
  });

  it('calls onSubmit with correct data when form is filled', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = renderModal({ onSubmit });
    const user = userEvent.setup();

    const titleInput = screen.getByPlaceholderText('titlePlaceholder');
    await user.type(titleInput, 'Beach Volleyball');

    const descInput = screen.getByPlaceholderText('descriptionPlaceholder');
    await user.type(descInput, 'Fun game at the beach');

    const dateInputs = container.querySelectorAll('input[type="datetime-local"]');
    fireEvent.change(dateInputs[0]!, { target: { value: '2025-03-01T10:00' } });

    const contactInput = screen.getByPlaceholderText('contactPlaceholder');
    await user.type(contactInput, '@organizer');

    const submitBtn = screen.getByRole('button', { name: /create|loading/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Beach Volleyball',
          description: 'Fun game at the beach',
          starts_at: '2025-03-01T10:00',
          organizer_contact: '@organizer',
        })
      );
    });
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = renderModal({ onClose });

    const backdrop = container.querySelector('.fixed.inset-0')!;
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    const user = userEvent.setup();

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
