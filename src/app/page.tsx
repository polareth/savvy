'use client';

import dynamic from 'next/dynamic';

import { Separator } from '@/components/ui/separator';
import Welcome from '@/components/companion/welcome';

// Import dynamically to avoid SSR issues due to persisted state (see zustand stores)
const Header = dynamic(() => import('@/components/core/header'));
const TxHistory = dynamic(() => import('@/components/core/tx-history'));

/**
 * @notice The home page, where the user can set the configuration and search for an account
 */
const Home = () => {
  return (
    <div className="flex grow flex-col gap-4">
      <Header />
      <Welcome />
      <Separator className="my-4" />
      <TxHistory />
    </div>
  );
};

export default Home;
