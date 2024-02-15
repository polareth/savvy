import type { FC, ReactNode } from 'react';

import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

type ContainerLayoutProps = JSX.IntrinsicElements['div'] & {
  children?: ReactNode;
};

const ContainerLayout: FC<ContainerLayoutProps> = ({ className, children, ...rest }) => {
  return (
    <div
      className={twMerge(
        clsx('mx-auto w-full max-w-screen-2xl grow p-4 md:px-8 md:py-10', className),
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default ContainerLayout;
