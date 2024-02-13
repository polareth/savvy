import { FC, ReactNode } from 'react';

import { InfoCircledIcon } from '@radix-ui/react-icons';
import { PopoverContent } from '@radix-ui/react-popover';

import { Icon as IconType } from '@/components/common/icons';
import { Popover, PopoverTrigger } from '@/components/ui/popover';

type PopoverInfoProps = {
  content: string | ReactNode;
  classNameTrigger?: string;
  classNameContent?: string;
  disabled?: boolean;
  Icon?: IconType;
};

const PopoverInfo: FC<PopoverInfoProps> = ({
  content,
  classNameTrigger,
  classNameContent,
  disabled = false,
  Icon = InfoCircledIcon,
}) => {
  return (
    <Popover>
      <PopoverTrigger disabled={disabled} className={classNameTrigger} asChild>
        <Icon className="h-4 w-4" />
      </PopoverTrigger>
      {disabled ? null : (
        <PopoverContent className={classNameContent}>
          <div className="text-sm">{content}</div>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default PopoverInfo;
