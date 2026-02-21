import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Мок next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Мок next/navigation
const mockUsePathname = vi.fn(() => '/');
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: vi.fn(() => ({ push: vi.fn(), back: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Мок next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Мок lucide-react — stub определен внутри фабрики
vi.mock('lucide-react', () => {
  const S = (props: any) => <div {...props} />;
  return {
    Bell: S,
    Building2: S,
    CalendarDays: S,
    Coffee: S,
    Home: S,
    MessageCircle: S,
    ShoppingBag: S,
    UserCircle2: S,
    Users: S,
  };
});

import { render, screen } from '@testing-library/react';
import { BottomNav } from '../BottomNav';

describe('BottomNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  it('renders all 9 navigation items', () => {
    render(<BottomNav />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(9);
  });

  it('highlights active link based on pathname', () => {
    mockUsePathname.mockReturnValue('/rentals');
    render(<BottomNav />);

    const rentalsLink = screen.getByRole('link', { name: /rentals/i });
    expect(rentalsLink.className).toContain('bg-white/10');

    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink.className).not.toContain('bg-white/10');
  });

  it('renders correct hrefs', () => {
    render(<BottomNav />);

    const expectedHrefs = [
      '/',
      '/chat',
      '/rentals',
      '/market',
      '/places',
      '/events',
      '/community',
      '/notifications',
      '/profile',
    ];

    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));

    expect(hrefs).toEqual(expectedHrefs);
  });
});
