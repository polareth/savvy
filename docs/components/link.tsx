import { ReactNode } from 'react';

import { cn } from '../utils';

// TODO TEMP until Link is available
export const Link = ({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={cn('vocs_Link_accent_underlined', className)}
  >
    {children}
  </a>
);
