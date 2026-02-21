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
  return { X: S, ShoppingBag: S, DollarSign: S, Phone: S, Tag: S };
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CreateMarketItemModal,
  type CreateMarketItemModalProps,
} from '../ui/CreateMarketItemModal';

const defaultProps: CreateMarketItemModalProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
};

const renderModal = (overrides: Partial<CreateMarketItemModalProps> = {}) =>
  render(<CreateMarketItemModal {...defaultProps} {...overrides} />);

describe('CreateMarketItemModal', () => {
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
    await user.type(titleInput, 'Test Item');

    const descInput = screen.getByPlaceholderText('descriptionPlaceholder');
    await user.type(descInput, 'Great condition laptop');

    const priceInput = container.querySelector('input[type="number"]')!;
    await user.type(priceInput as HTMLElement, '250');

    const contactInput = screen.getByPlaceholderText('contactPlaceholder');
    await user.type(contactInput, '@seller');

    const submitBtn = screen.getByRole('button', { name: /create|loading/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Item',
          description: 'Great condition laptop',
          price: 250,
          contact: '@seller',
          category: 'electronics',
          condition: 'good',
          currency: 'USD',
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
