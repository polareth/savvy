'use client';

import dynamic from 'next/dynamic';

import { Separator } from '@/components/ui/separator';

// Import dynamically to avoid SSR issues due to persisted state (see zustand stores)
const ConfigMenu = dynamic(
  () => import('@/components/core/selection/config-menu'),
);
const Header = dynamic(() => import('@/components/core/header'));
const TxHistory = dynamic(() => import('@/components/core/tx-history'));

/**
 * @notice The home page, where the user can set the configuration and search for an account
 */
const Home = () => {
  return (
    <div className="relative flex flex-col space-x-0 pb-6 md:flex-row md:space-x-16">
      <ConfigMenu />
      <div className="flex grow flex-col gap-4">
        <Header />

        <Separator className="my-4" />
        <TxHistory />
      </div>
    </div>
  );
};

export default Home;
