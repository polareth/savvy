import { FC, ReactNode } from 'react';

import { InfoCircledIcon } from '@radix-ui/react-icons';

import { Icon as IconType } from '@/components/common/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type TooltipInfoProps = {
  content: string | ReactNode;
  classNameTrigger?: string;
  classNameContent?: string;
  disabled?: boolean;
  disableHoverable?: boolean;
  Icon?: IconType;
};

const TooltipInfo: FC<TooltipInfoProps> = ({
  content,
  classNameTrigger,
  classNameContent,
  disabled = false,
  disableHoverable = false,
  Icon = InfoCircledIcon,
}) => {
  return (
    <TooltipProvider>
      <Tooltip disableHoverableContent={disableHoverable}>
        <TooltipTrigger disabled={disabled} className={classNameTrigger}>
          <Icon className="h-4 w-4" />
        </TooltipTrigger>
        {disabled ? null : (
          <TooltipContent className={classNameContent}>
            <div className="text-sm">{content}</div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipInfo;
