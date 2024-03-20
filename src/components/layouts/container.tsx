'use client';

import type { FC, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Import dynamically to avoid SSR issues due to persisted state (see zustand stores)
const ConfigMenuDesktop = dynamic(
  () => import('@/components/core/selection/config-menu/desktop'),
);

type ContainerLayoutProps = JSX.IntrinsicElements['div'] & {
  children?: ReactNode;
};

/**
 * @notice The container layout component for all pages
 */
const ContainerLayout: FC<ContainerLayoutProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'mx-auto flex w-full max-w-screen-2xl grow flex-col p-4 md:px-8 md:py-10',
          className,
        ),
      )}
      {...rest}
    >
      <div className="flex grow flex-col space-x-0 pb-6 md:flex-row md:space-x-16">
        <ConfigMenuDesktop />
        {children}
      </div>
    </div>
  );
};

export default ContainerLayout;
