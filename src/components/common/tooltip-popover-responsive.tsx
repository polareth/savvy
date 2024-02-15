import { FC, ReactNode } from 'react';

import { useMediaQuery } from '@/lib/hooks/use-media-query';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type TooltipPopoverResponsiveProps = {
  trigger: ReactNode;
  content: string | ReactNode;
  classNameTrigger?: string;
  classNameContent?: string;
  disabled?: boolean;
  disableHoverable?: boolean;
};

const TooltipPopoverResponsive: FC<TooltipPopoverResponsiveProps> = ({
  trigger,
  content,
  classNameTrigger,
  classNameContent,
  disabled,
  disableHoverable,
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md

  if (isDesktop)
    return (
      <TooltipProvider>
        <Tooltip disableHoverableContent={disableHoverable}>
          <TooltipTrigger disabled={disabled} className={classNameTrigger}>
            {trigger}
          </TooltipTrigger>
          {disabled ? null : (
            <TooltipContent className={classNameContent}>
              {typeof content === 'string' ? <div className="text-sm">{content}</div> : content}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );

  return (
    <Popover>
      <PopoverTrigger disabled={disabled} className={classNameTrigger} asChild>
        {trigger}
      </PopoverTrigger>
      {disabled ? null : (
        <PopoverContent className={classNameContent}>
          {typeof content === 'string' ? <div className="text-sm">{content}</div> : content}
        </PopoverContent>
      )}
    </Popover>
  );
};

export default TooltipPopoverResponsive;
