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
  return { X: S, MapPinPlus: S, Wifi: S, Leaf: S };
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  SuggestPlaceModal,
  type SuggestPlaceModalProps,
} from '../ui/SuggestPlaceModal';

const defaultProps: SuggestPlaceModalProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
};

const renderModal = (overrides: Partial<SuggestPlaceModalProps> = {}) =>
  render(<SuggestPlaceModal {...defaultProps} {...overrides} />);

describe('SuggestPlaceModal', () => {
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
    // Submit кнопка теперь t('suggestButton') = 'suggestButton'
    const submitBtn = screen.getByRole('button', { name: /suggestButton|loading/i });
    expect(submitBtn).toBeDisabled();
  });

  it('calls onSubmit with correct data when form is filled', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderModal({ onSubmit });
    const user = userEvent.setup();

    const nameInput = screen.getByPlaceholderText('namePlaceholder');
    await user.type(nameInput, 'Cool Cafe');

    const descInput = screen.getByPlaceholderText('descriptionPlaceholder');
    await user.type(descInput, 'Best coffee in town');

    const addressInput = screen.getByPlaceholderText('addressPlaceholder');
    await user.type(addressInput, '12 An Thuong 4');

    const submitBtn = screen.getByRole('button', { name: /suggestButton|loading/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Cool Cafe',
          description: 'Best coffee in town',
          address: '12 An Thuong 4',
          category: 'cafe',
          price_level: '$$',
          has_wifi: false,
          is_vegan_friendly: false,
        })
      );
    });
  });

  it('toggles WiFi and Vegan Friendly buttons', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderModal({ onSubmit });
    const user = userEvent.setup();

    // Тексты теперь i18n ключи: wifiLabel, veganLabel
    const wifiBtn = screen.getByText('wifiLabel').closest('button')!;
    await user.click(wifiBtn);
    expect(wifiBtn.className).toContain('cyan');

    const veganBtn = screen.getByText('veganLabel').closest('button')!;
    await user.click(veganBtn);
    expect(veganBtn.className).toContain('emerald');

    await user.type(screen.getByPlaceholderText('namePlaceholder'), 'Vegan Place');
    await user.type(screen.getByPlaceholderText('descriptionPlaceholder'), 'Amazing vegan food');
    await user.type(screen.getByPlaceholderText('addressPlaceholder'), '5 Hai Ba Trung');

    const submitBtn = screen.getByRole('button', { name: /suggestButton|loading/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          has_wifi: true,
          is_vegan_friendly: true,
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
