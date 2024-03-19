import Link from 'next/link';

import { METADATA_EXTRA } from '@/lib/constants/site';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/common/icons';
import NavBar from '@/components/common/nav-bar';
import ThemeToggle from '@/components/common/theme-toggle';

/**
 * @notice The site header
 * @dev This will display the site header with the navigation bar and some social links
 */
const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <NavBar />
      </div>
    </header>
  );
};

export default SiteHeader;
