import { FC, ReactNode } from 'react';

import { AlertTriangle } from 'lucide-react';

import { Icon } from '@/components/common/icons';
import TooltipInfo from '@/components/common/tooltip-info';

type TooltipAlertProps = {
  content: string | ReactNode;
  classNameTrigger?: string;
  classNameContent?: string;
  disabled?: boolean;
  disableHoverable?: boolean;
};

const TooltipAlert: FC<TooltipAlertProps> = ({
  content,
  classNameTrigger,
  classNameContent,
  disabled = false,
  disableHoverable = false,
}) => {
  return (
    <TooltipInfo
      content={content}
      classNameTrigger={classNameTrigger}
      classNameContent={classNameContent}
      disabled={disabled}
      disableHoverable={disableHoverable}
      Icon={AlertTriangle as Icon}
    />
  );
};

export default TooltipAlert;
