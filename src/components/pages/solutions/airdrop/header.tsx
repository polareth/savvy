'use client';

import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { useSelectionStore } from '@/lib/store/use-selection';

import AirdropMethodSelection from '@/components/pages/solutions/airdrop/airdrop-method-selection';
import TokenSelection from '@/components/pages/solutions/airdrop/token-selection';

const Header = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md
  const tokenOption = useSelectionStore.airdrop((state) => state.tokenOption);

  return (
    <div className="flex flex-col justify-between gap-2 md:flex-row">
      <div className="flex grow flex-wrap items-end gap-x-1 gap-y-1">
        <span className="text-xl font-semibold tracking-wide">Airdrop</span>
        <span className="mb-[2px] text-sm text-muted-foreground">{tokenOption.label}</span>
      </div>
      {isDesktop ? (
        <>
          <TokenSelection />
          <AirdropMethodSelection />
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <TokenSelection />
          <AirdropMethodSelection />
        </div>
      )}
    </div>
  );
};

export default Header;
