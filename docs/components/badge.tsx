import { FC, ReactNode } from 'react';
import clsx from 'clsx';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type BadgeIntent = 'none' | 'primary' | 'success' | 'fail' | 'warning';

type BadgeProps = {
  children: ReactNode;
  intent?: BadgeIntent;
  className?: string;
};

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

// Modified from fiveoutofnine => https://github.com/fiveoutofnine/www/blob/7029233ccdc727c73e0e2f1defcdb6ce19dc0872/components/ui/badge/styles.tsx#L16
const badgeStyles =
  'px-2 h-4 rounded w-fit flex justify-center items-center font-medium text-xs whitespace-nowrap';
const badgeIntents = {
  none: 'vocs_Callout_note',
  primary: 'vocs_Callout_tip',
  success: 'vocs_Callout_success',
  fail: 'vocs_Callout_danger',
  warning: 'vocs_Callout_warning',
};

// vocs_Callout_warning
// note, info, danger, tip, success
/* -------------------------------------------------------------------------- */
/*                                 COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

export const Badge: FC<BadgeProps> = ({
  children,
  intent = 'none',
  className,
}) => {
  return (
    <div className={clsx(badgeStyles, badgeIntents[intent], className)}>
      {children}
    </div>
  );
};
