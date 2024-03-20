'use client';

import { useMediaQuery } from '@/lib/hooks/use-media-query';
import CallerSelection from '@/components/core/selection/caller';
import ChainSelection from '@/components/core/selection/chain';
import GasPriceSelection from '@/components/core/selection/gas-price';
import NativePriceSelection from '@/components/core/selection/native-price';

/**
 * @notice The configuration menu on desktop to define parameters for the calls/estimations
 * @dev This will display a side menu on desktop and a bottom-sliding menu on mobile.
 * @dev This includes the chain, gas price, native price, and caller selection.
 */
const ConfigMenuDesktop = () => {
  const isTablet = useMediaQuery('(max-width: 1024px)');

  if (isTablet) return null;
  return (
    <nav
      className="hide-scrollbar sticky top-28 z-50 -ml-3 flex min-w-[16rem] max-w-[16rem] flex-col gap-4 overflow-y-scroll px-0.5 lg:min-w-[18rem] lg:max-w-[18rem]"
      style={{ height: 'calc(100vh - 11rem)' }}
    >
      <ChainSelection />
      <GasPriceSelection />
      <NativePriceSelection />
      <CallerSelection />
    </nav>
  );
};

export default ConfigMenuDesktop;
