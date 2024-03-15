'use client';

import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  Fragment,
  useState,
  type FC,
} from 'react';
import Link, { LinkProps } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRightIcon } from 'lucide-react';

import type { PageSlug } from '@/lib/types/site';
import { METADATA_BASE, NAVBAR_SOLUTIONS } from '@/lib/constants/site';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Icons } from '@/components/common/icons';

type SubNavBarProps = {
  selected?: string[];
};

/**
 * @notice The main navigation bar for the app
 * @dev This will basically display a genuine navigation bar on desktop and a mobile-friendly one on mobile;
 * meaning a side sheet that can be toggled with a button.
 */
const NavBar = () => {
  // Find the selected page based on the current pathname to highlight
  const selected = (usePathname() as PageSlug)
    .split('/')
    .slice(1)
    .map((slug) => `/${slug}`);

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

const DesktopNavBar: FC<SubNavBarProps> = ({ selected = [''] }) => {
  return (
    <nav className="z-popover pointer-events-auto mr-4 hidden items-center md:flex">
      <Link
        href="/"
        className={cn(
          'flex items-center gap-2 font-semibold transition-opacity duration-200 hover:opacity-75',
          // selected[0] === '/' ? 'text-muted-foreground' : '',
        )}
        aria-label="Home"
      >
        <Icons.logo className="h-8 w-8" />
        {METADATA_BASE.title?.toString()}
      </Link>
      {/* <NavigationMenu className="ml-4">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={cn(
                'font-semibold',
                selected[0] === '/solutions' ? 'text-muted-foreground' : '',
              )}
            >
              Solutions
            </NavigationMenuTrigger>
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
                {NAVBAR_SOLUTIONS.map((page) => {
                  return (
                    <ListItem
                      key={page.slug}
                      href={page.slug}
                      title={page.name}
                      selected={selected.join('') === page.slug}
                    >
                      {page.description || ''}
                    </ListItem>
                  );
                })}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu> */}
    </nav>
  );
};

/* -------------------------------------------------------------------------- */
/*                                   MOBILE                                   */
/* -------------------------------------------------------------------------- */

const MobileNavBar: FC<SubNavBarProps> = ({ selected = [''] }) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="justify-start px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Icons.menu />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <MobileLink
          href="/"
          className="flex items-center"
          onOpenChange={setOpen}
        >
          <Icons.logo className="mr-2 h-4 w-4" />
          <span className="font-bold">{METADATA_BASE.title?.toString()}</span>
        </MobileLink>
        {/* <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            <h4 className="font-medium">Solutions</h4>
            {NAVBAR_SOLUTIONS.map((item) =>
              item.slug ? (
                <MobileLink
                  key={item.slug}
                  href={item.slug}
                  onOpenChange={setOpen}
                  className="flex items-center text-muted-foreground"
                >
                  {selected.join('') === item.slug ? (
                    <ChevronRightIcon
                      className="mr-1 inline-block h-3 w-3 transition"
                      aria-hidden="true"
                    />
                  ) : null}
                  {item.name}
                </MobileLink>
              ) : null,
            )}
          </div>
        </ScrollArea> */}
      </SheetContent>
    </Sheet>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  LIST ITEM                                 */
/* -------------------------------------------------------------------------- */

const ListItem = forwardRef<
  ElementRef<'a'>,
  ComponentPropsWithoutRef<'a'> & { selected?: boolean }
>(({ className, title, children, selected, ...props }, ref) => {
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
          <div className="flex items-center text-sm font-medium leading-none">
            {selected ? (
              <ChevronRightIcon
                className="mr-1 inline-block h-3 w-3 transition"
                aria-hidden="true"
              />
            ) : null}
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = 'ListItem';

/* -------------------------------------------------------------------------- */
/*                                  MOBILE LINK                               */
/* -------------------------------------------------------------------------- */

type MobileLinkProps = LinkProps & {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
};

const MobileLink = ({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) => {
  const router = useRouter();

  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  );
};

MobileLink.displayName = 'MobileLink';

export default NavBar;
