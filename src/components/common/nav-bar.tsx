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
import { METADATA_BASE, METADATA_EXTRA, NAVBAR } from '@/lib/constants/site';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Icons } from '@/components/common/icons';
import ThemeToggle from '@/components/common/theme-toggle';

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
    <>
      <nav className="z-popover pointer-events-auto mr-4 hidden items-center lg:flex">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-3 font-semibold transition-opacity duration-200 hover:opacity-75',
            // selected[0] === '/' ? 'text-muted-foreground' : '',
          )}
          aria-label="Home"
        >
          <Icons.logo className="h-6 w-6" />
          <span className="mt-[-2px]">{METADATA_BASE.title?.toString()}</span>
        </Link>
        <NavigationMenu className="ml-4">
          <NavigationMenuList>
            {NAVBAR.map((page, index) =>
              page.children && page.children.length > 0 ? (
                <NavigationMenuItem key={index}>
                  <NavigationMenuTrigger
                    className={cn(
                      'font-semibold',
                      selected[0] === page.slug ? 'text-muted-foreground' : '',
                    )}
                  >
                    {page.name}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href={page.slug || page.url}
                          >
                            <Icons.logo className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              {page.name}
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              {page.description || ''}
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      {page.children.map((child) => {
                        return (
                          <ListItem
                            key={child.slug}
                            href={child.slug}
                            title={child.name}
                            selected={selected.join('') === child.slug}
                          >
                            {child.description || ''}
                          </ListItem>
                        );
                      })}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={index}>
                  <Link
                    href={page.slug || page.url || ''}
                    legacyBehavior
                    passHref
                  >
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      documentation
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ),
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
      <NavIcons className="hidden justify-end lg:flex" />
    </>
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
          className="justify-start px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Icons.menu />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col lg:hidden">
        <MobileLink
          href="/"
          className="flex items-center"
          onOpenChange={setOpen}
        >
          <Icons.logo className="mr-2 h-4 w-4" />
          <span className="font-bold">{METADATA_BASE.title?.toString()}</span>
        </MobileLink>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {NAVBAR.map((page, index) =>
              page.children && page.children.length > 0 ? (
                <Fragment key={index}>
                  <h4 className="font-medium">{page.name}</h4>
                  {page.children.map((child, childIndex) => (
                    <MobileLink
                      key={childIndex}
                      href={child.slug || child.url || ''}
                      onOpenChange={setOpen}
                      className="flex items-center text-muted-foreground"
                    >
                      {selected.join('') === child.slug ? (
                        <ChevronRightIcon
                          className="mr-1 inline-block h-3 w-3 transition"
                          aria-hidden="true"
                        />
                      ) : null}
                      {child.name}
                    </MobileLink>
                  ))}
                </Fragment>
              ) : (
                <MobileLink
                  key={index}
                  href={page.slug || page.url || ''}
                  onOpenChange={setOpen}
                  className="flex items-center text-muted-foreground"
                >
                  {selected.join('') === page.slug ? (
                    <ChevronRightIcon
                      className="mr-1 inline-block h-3 w-3 transition"
                      aria-hidden="true"
                    />
                  ) : null}
                  {page.name}
                </MobileLink>
              ),
            )}
          </div>
        </ScrollArea>
        <div className="grow" />
        <NavIcons className="mt-2 items-end" />
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

/* -------------------------------------------------------------------------- */
/*                                    ICONS                                   */
/* -------------------------------------------------------------------------- */

type NavIconsProps = {
  className?: string;
};

const NavIcons: FC<NavIconsProps> = ({ className }) => {
  return (
    <div className={cn('flex flex-1 items-center space-x-4', className)}>
      <nav className="flex w-full items-center space-x-1 lg:w-auto">
        <Link
          href={METADATA_EXTRA.links.github}
          target="_blank"
          rel="noreferrer"
        >
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
        <Link
          href={METADATA_EXTRA.links.twitter}
          target="_blank"
          rel="noreferrer"
          className="grow lg:grow-0"
        >
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
  );
};

export default NavBar;
