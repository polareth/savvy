import type { FC, ReactNode } from 'react';

import SiteHeader from '@/components/common/site-header';

/* ----------------------------------- SEO ---------------------------------- */

/* -------------------------------- COMPONENT ------------------------------- */
type BaseLayoutProps = {
  children: ReactNode;
};

const BaseLayout: FC<BaseLayoutProps> = ({ children }) => {
  return (
    <>
      <SiteHeader />
      <main className="relative flex grow flex-col">{children}</main>
    </>
  );
};

BaseLayout.displayName = 'BaseLayout';

export default BaseLayout;
