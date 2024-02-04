'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ComponentPropsWithoutRef, ElementRef, type FC, forwardRef, Fragment } from 'react';

import clsx from 'clsx';

import { METADATA_BASE, NAVBAR_MAIN } from '@/lib/constants/site';
import type { PageSlug } from '@/lib/types/site';
import { cn } from '@/lib/utils';

import { Icons } from '@/components/common/icons';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

type SubNavBarProps = {
  selected?: PageSlug;
};

const NavBar = () => {
  const selected = usePathname() as PageSlug;

  return (
    <Fragment>
      <DesktopNavBar selected={selected} />
      <MobileNavBar selected={selected} />
    </Fragment>
  );
};

/* -------------------------------------------------------------------------- */
/*                                   DESKTOP                                  */
/* -------------------------------------------------------------------------- */

const DesktopNavBar: FC<SubNavBarProps> = () => {
  return (
    // <nav className="z-popover border-gray-6 pointer-events-auto sticky top-0 hidden h-12 items-center border-b bg-white px-4 dark:bg-black md:flex">
    <nav className="mr-4 hidden md:flex">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      href="/"
                    >
                      <Icons.logo className="h-6 w-6" />
                      <div className="mb-2 mt-4 text-lg font-medium">
                        {METADATA_BASE.title?.toString()}
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        {METADATA_BASE.description?.toString()}
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                {NAVBAR_MAIN.map((page) => {
                  return (
                    <ListItem key={page.slug} href={page.slug} title={page.name}>
                      {page.description || ''}
                    </ListItem>
                  );
                })}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
};

/* -------------------------------------------------------------------------- */
/*                                   MOBILE                                   */
/* -------------------------------------------------------------------------- */

const MobileNavBar: FC<SubNavBarProps> = ({ selected }) => {
  return (
    <nav className="z-popover border-gray-6 pointer-events-auto sticky top-0 flex h-12 items-center border-b bg-white px-4 dark:bg-black md:hidden">
      <Icons.logo />
      {NAVBAR_MAIN.map((page) => {
        const pageSelected = selected === page.slug;

        return (
          <Link
            key={page.slug}
            href={page.slug}
            className={clsx('ml-2', pageSelected ? 'bg-gray-4 cursor-default' : '')}
          >
            {page.name}
          </Link>
        );
      })}
      {/* <div className="flex-grow" /> */}
    </nav>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  LIST ITEM                                 */
/* -------------------------------------------------------------------------- */

const ListItem = forwardRef<ElementRef<'a'>, ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  },
);

ListItem.displayName = 'ListItem';

export default NavBar;
