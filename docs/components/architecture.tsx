import { ReactNode } from 'react';
import { ChevronRightIcon } from 'lucide-react';

import { Link } from '../components/link';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

type ArchitectureWrapperProps = {
  nesting: number;
  children: ReactNode;
};

type ArchitectureItemProps = {
  name: string;
  description?: string;
  nested?: number;
  url?: string;
  path?: string;
  children: ReactNode;
};

/* -------------------------------------------------------------------------- */
/*                                 COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

export const ArchitectureWrapper = ({
  nesting,
  children,
}: ArchitectureWrapperProps) => {
  return <div className={`grid grid-cols-${nesting}`}>{children}</div>;
};

export const ArchitectureItem = ({
  name,
  description,
  nested,
  url,
  children,
}: ArchitectureItemProps) => {
  console.log(url);
  const carretAmount = (nested || 0) + 1;

  return (
    <div className="px-6">
      <div className="flex items-center gap-2">
        <h3
          className={`flex items-center text-sm font-bold ${nested === 0 ? 'text-accent' : ''}`}
        >
          <div className="flex">
            {Array(carretAmount)
              .fill(carretAmount)
              .map((_, i) => (
                <ChevronRightIcon
                  key={i}
                  className={`mt-1 h-4 w-4 ${i !== carretAmount - 1 ? 'mr-[-10px]' : ''} ${
                    i === (nested || 0) ? 'text-accent' : 'text-gray-500'
                  }`}
                />
              ))}
          </div>{' '}
          {url ? (
            <Link href={url} className="font-semibold no-underline">
              {name}
            </Link>
          ) : (
            name
          )}
        </h3>
        {description && <p className="text-gray-500">{description}</p>}
      </div>
      {children}
    </div>
  );
};
