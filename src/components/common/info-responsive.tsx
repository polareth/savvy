import { FC, ReactNode } from 'react';

import { useMediaQuery } from '@/lib/hooks/use-media-query';

import { Icon as IconType } from '@/components/common/icons';
import PopoverInfo from '@/components/common/popover-info';
import TooltipInfo from '@/components/common/tooltip-info';

type InfoResponsiveProps = {
  content: string | ReactNode;
  classNameTrigger?: string;
  classNameContent?: string;
  disabled?: boolean;
  disableHoverable?: boolean;
  Icon?: IconType;
};

const InfoResponsive: FC<InfoResponsiveProps> = (props) => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md
  const { disableHoverable, ...rest } = props;

  if (isDesktop) return <TooltipInfo {...props} />;
  return <PopoverInfo {...rest} />;
};

export default InfoResponsive;
