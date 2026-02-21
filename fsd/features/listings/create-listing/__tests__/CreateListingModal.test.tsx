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
  return { X: S, Home: S, DollarSign: S, MapPin: S, Phone: S, ImagePlus: S };
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CreateListingModal,
  type CreateListingModalProps,
} from '../ui/CreateListingModal';

const defaultProps: CreateListingModalProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
};

const renderModal = (overrides: Partial<CreateListingModalProps> = {}) =>
  render(<CreateListingModal {...defaultProps} {...overrides} />);

describe('CreateListingModal', () => {
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

    // Плейсхолдеры теперь i18n ключи (titlePlaceholder, descriptionPlaceholder, contactPlaceholder)
    const titleInput = screen.getByPlaceholderText('titlePlaceholder');
    await user.type(titleInput, 'Test Apartment');

    const descInput = screen.getByPlaceholderText('descriptionPlaceholder');
    await user.type(descInput, 'A nice apartment');

    const priceInput = container.querySelector('input[type="number"]')!;
    await user.type(priceInput as HTMLElement, '500');

    const contactInput = screen.getByPlaceholderText('contactPlaceholder');
    await user.type(contactInput, '@testuser');

    const submitBtn = screen.getByRole('button', { name: /create|loading/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Apartment',
          description: 'A nice apartment',
          price: 500,
          contact: '@testuser',
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
