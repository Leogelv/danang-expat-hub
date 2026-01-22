export type ScreenVariant = 'ember' | 'aurora' | 'midnight' | 'lagoon' | 'sunset';

export const backgroundTokens: Record<ScreenVariant, { base: string; blobs: string[] }> = {
  ember: {
    base: 'bg-gradient-to-br from-[#1A0A05] via-[#2D1810] to-[#1F0F08]',
    blobs: [
      'w-[340px] h-[340px] bg-[#FF6B35]/35 -left-28 -top-20 animate-blob-drift-1',
      'w-[380px] h-[380px] bg-[#FF8C42]/28 right-[-140px] top-[140px] animate-blob-drift-2',
      'w-[260px] h-[260px] bg-[#FFA947]/22 left-[160px] bottom-[-140px] animate-blob-drift-3',
    ],
  },
  sunset: {
    base: 'bg-gradient-to-br from-[#1F0F08] via-[#2A1510] to-[#1A0C07]',
    blobs: [
      'w-[360px] h-[360px] bg-gradient-to-br from-[#FF6B35]/40 to-[#FF8C42]/30 -left-32 -top-20 animate-blob-drift-1',
      'w-[420px] h-[420px] bg-gradient-to-br from-[#FFA947]/35 to-[#FFB54A]/25 right-[-160px] top-[140px] animate-blob-drift-2',
      'w-[300px] h-[300px] bg-gradient-to-br from-[#FF8C42]/30 to-[#FF6B35]/20 left-[140px] bottom-[-140px] animate-blob-drift-3',
    ],
  },
  aurora: {
    base: 'bg-gradient-to-br from-[#0F1623] via-[#17263A] to-[#1D0F26]',
    blobs: [
      'w-[360px] h-[360px] bg-[#6DCBFF]/35 -left-32 -top-16 animate-blob-drift-1',
      'w-[420px] h-[420px] bg-[#B37CFF]/28 right-[-160px] top-[120px] animate-blob-drift-2',
      'w-[260px] h-[260px] bg-[#8BE1FF]/25 left-[120px] bottom-[-120px] animate-blob-drift-3',
    ],
  },
  midnight: {
    base: 'bg-gradient-to-br from-[#090B13] via-[#141727] to-[#1E2240]',
    blobs: [
      'w-[340px] h-[340px] bg-[#6366F1]/32 -left-24 -top-16 animate-blob-drift-1',
      'w-[380px] h-[380px] bg-[#2DD4BF]/24 right-[-140px] top-[160px] animate-blob-drift-2',
      'w-[280px] h-[280px] bg-[#818CF8]/22 left-[140px] bottom-[-160px] animate-blob-drift-3',
    ],
  },
  lagoon: {
    base: 'bg-gradient-to-br from-[#0C171C] via-[#0C2230] to-[#0B2C34]',
    blobs: [
      'w-[360px] h-[360px] bg-[#38BDF8]/30 -left-32 -top-24 animate-blob-drift-1',
      'w-[400px] h-[400px] bg-[#5EEAD4]/24 right-[-160px] top-[150px] animate-blob-drift-2',
      'w-[280px] h-[280px] bg-[#A5F3FC]/24 left-[140px] bottom-[-140px] animate-blob-drift-3',
    ],
  },
};

export const accentGradients = {
  ember: 'from-orange-500 via-amber-500 to-orange-600',
  tide: 'from-cyan-500 via-sky-500 to-blue-600',
  aurora: 'from-violet-500 via-fuchsia-500 to-sky-500',
};
