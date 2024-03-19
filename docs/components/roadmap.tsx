import { FC, ReactNode } from 'react';
import { CheckIcon, StarIcon, XIcon } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

type RoadmapListProps = {
  children: ReactNode;
};

type RoadmapItemProps = {
  completed: boolean;
  priority?: boolean;
  children: ReactNode;
};

/* -------------------------------------------------------------------------- */
/*                                 COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

export const RoadmapList: FC<RoadmapListProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-[min-content_1fr] items-start gap-x-4 gap-y-1">
      {children}
    </div>
  );
};

export const RoadmapItem: FC<RoadmapItemProps> = ({
  completed,
  priority,
  children,
}) => {
  return (
    <>
      <div
        className={`mt-3 flex h-full items-start gap-2 ${
          completed || priority ? 'text-accent' : 'text-gray-500'
        }`}
      >
        <div className="mt-[-5px]">
          {completed ? (
            <CheckIcon className="h-4 w-4" />
          ) : priority ? (
            <StarIcon className="h-4 w-4" />
          ) : (
            <XIcon className="h-4 w-4" />
          )}
        </div>
      </div>
      <div className={completed ? 'font-medium' : ''}>{children}</div>
    </>
  );
};
