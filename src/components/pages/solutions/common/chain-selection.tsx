'use client';

import { FC } from 'react';

import { CHAINS } from '@/lib/constants/chains';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { useSelectionStore } from '@/lib/store/use-selection';
import { Chain } from '@/lib/types/chains';
import { ComboboxOption } from '@/lib/types/templates';
import { cn } from '@/lib/utils';
import { toChainOption } from '@/lib/utils/combobox';

import ComboBoxResponsive from '@/components/templates/combobox-responsive';

type ChainSelectionProps = {
  className?: string;
};

const items: ComboboxOption[] = CHAINS.map((chain: Chain) => toChainOption(chain));

const ChainSelection: FC<ChainSelectionProps> = ({ className }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md
  const { chain, formDisabled, setChain } = useSelectionStore.global((state) => ({
    chain: state.chainOption,
    formDisabled: state.formDisabled,
    setChain: state.setChainOption,
  }));

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {isDesktop ? (
        <span className="text-sm font-medium text-muted-foreground">1. Chain</span>
      ) : null}
      <ComboBoxResponsive
        header="Select a chain"
        items={items}
        label="Chain"
        selected={chain}
        setSelected={setChain}
        disabled={formDisabled}
        minimalDisplay={!isDesktop}
      />
    </div>
  );
};

export default ChainSelection;
