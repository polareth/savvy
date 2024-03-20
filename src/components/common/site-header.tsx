'use client';

import dynamic from 'next/dynamic';

import NavBar from '@/components/common/nav-bar';

// Import dynamically to avoid SSR issues due to persisted state (see zustand stores)
const ConfigMenuMobile = dynamic(
  () => import('@/components/core/selection/config-menu/mobile'),
);

/**
 * @notice The site header
 * @dev This will display the site header with the navigation bar and some social links
 */
const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <ConfigMenuMobile />
        <NavBar />
      </div>
    </header>
  );
};

export default SiteHeader;
