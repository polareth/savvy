'use client';

import { useMemo } from 'react';

import { ComboboxOption } from '@/lib/types/templates';
import { AIRDROP_TOKENS } from '@/lib/constants/solutions/airdrop';
import { useSelectionStore } from '@/lib/store/use-selection';
import { toTokenOption } from '@/lib/utils/combobox';
import { Icon, Icons } from '@/components/common/icons';
import ComboBoxResponsive from '@/components/templates/combobox-responsive';

const TokenSelection = () => {
  const { token, setToken } = useSelectionStore.airdrop((state) => ({
    token: state.tokenOption,
    setToken: state.setTokenOption,
  }));

  const { chainOption, loadingAny, getCurrentChain } = useSelectionStore.global(
    (state) => ({
      chainOption: state.chainOption,
      loadingAny: state.loadingAny,
      getCurrentChain: state.getCurrentChain,
    }),
  );

  const items: ComboboxOption[] = useMemo(
    () =>
      AIRDROP_TOKENS.map((token) => {
        if (chainOption && token.id === 'native') {
          const chain = getCurrentChain();
          if (chain) {
            return {
              label: `${chain.config.nativeCurrency.symbol} (native)`,
              value: token.id,
              icon: Icons[
                chain.config.name.toLowerCase() as keyof typeof Icons
              ] as Icon,
            };
          }
        }

        return toTokenOption(token);
      }),
    [chainOption, getCurrentChain],
  );

  return (
    <ComboBoxResponsive
      items={items}
      label="Token"
      boxWidth="w-[250px]"
      selected={token}
      setSelected={setToken}
      disabled={loadingAny}
    />
  );
};

export default TokenSelection;
