import { ReactNode } from 'react';

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
    className={`vocs_Link_accent_underlined ${className}`}
  >
    {children}
  </a>
);
