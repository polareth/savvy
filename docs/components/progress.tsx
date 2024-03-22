import { FC, ReactNode } from 'react';
import { CheckIcon, StarIcon, XIcon } from 'lucide-react';

import { cn } from '../utils';
import { Badge, BadgeIntent } from './badge';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

type ProgressListHeadingProps = {
  title: string;
  caption?: string;
};

type ProgressListContentProps = {
  caption?: string;
  children: ReactNode;
};

type ProgressItemProps = {
  completed: boolean;
  priority?: boolean;
  difficulty?: number;
  children: ReactNode;
};

type DifficultyBadgeProps = {
  difficulty: number;
};

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

type DifficultyData = {
  label: string;
  intent: BadgeIntent;
};

const DifficultyBadge: FC<DifficultyBadgeProps> = ({ difficulty }) => {
  let data: DifficultyData = { label: '', intent: 'none' };
  if (difficulty === -1) data = { label: 'unknown', intent: 'none' };
  if (difficulty === 0) data = { label: 'minor', intent: 'none' };
  if (difficulty === 1) data = { label: 'moderate', intent: 'primary' };
  if (difficulty === 2) data = { label: 'major', intent: 'warning' };
  if (difficulty === 3) data = { label: 'extensive', intent: 'fail' };

  return (
    <Badge intent={data.intent} className="mt-2 justify-self-end">
      {data.label}
    </Badge>
  );
};

/* -------------------------------------------------------------------------- */
/*                                 COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

export const ProgressListHeading: FC<ProgressListHeadingProps> = ({
  title,
  caption,
}) => {
  return (
    <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between">
      <h5 className="vocs_Step_title vocs_Heading mb-0">{title}</h5>
      {caption ? (
        <span className="text-sm text-gray-500">{caption}</span>
      ) : null}
    </div>
  );
};

export const ProgressListContent: FC<ProgressListContentProps> = ({
  children,
}) => {
  return (
    <div className="grid grid-cols-[min-content_1fr_min-content] items-start gap-x-4 gap-y-1">
      {children}
    </div>
  );
};

export const ProgressItem: FC<ProgressItemProps> = ({
  completed,
  priority,
  difficulty,
  children,
}) => {
  return (
    <>
      <div
        className={cn(
          'flex h-full items-start gap-2 pt-3',
          completed || priority ? 'text-accent' : 'text-gray-500',
        )}
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
      <div className={cn(completed && 'font-medium')}>{children}</div>
      {difficulty !== undefined ? (
        <DifficultyBadge difficulty={difficulty} />
      ) : (
        <div />
      )}
    </>
  );
};
