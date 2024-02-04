import Link from 'next/link';

import { METADATA_EXTRA } from '@/lib/constants/site';

import { Icons } from '@/components/common/icons';
import NavBar from '@/components/common/nav-bar';
import ThemeToggle from '@/components/common/theme-toggle';
import { buttonVariants } from '@/components/ui/button';

const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <NavBar />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Link href={METADATA_EXTRA.links.github} target="_blank" rel="noreferrer">
              <div
                className={buttonVariants({
                  size: 'icon',
                  variant: 'ghost',
                })}
              >
                <Icons.gitHub className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </div>
            </Link>
            <Link href={METADATA_EXTRA.links.twitter} target="_blank" rel="noreferrer">
              <div
                className={buttonVariants({
                  size: 'icon',
                  variant: 'ghost',
                })}
              >
                <Icons.twitter className="h-4 w-4 fill-current" />
                <span className="sr-only">Twitter</span>
              </div>
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
