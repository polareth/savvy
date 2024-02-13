import { FC, useEffect, useState } from 'react';

import { useMediaQuery } from '@/lib/hooks/use-media-query';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type TooltipConditionalProps = {
  children: React.ReactNode;
  condition: boolean;
  tooltip: string;
};

const TooltipConditional: FC<TooltipConditionalProps> = ({ children, condition, tooltip }) => {
  const [mounted, setMounted] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md

  useEffect(() => {
    setMounted(true);
  }, []);

  return condition && mounted && isDesktop ? (
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  ) : (
    <>{children}</>
  );
};

export default TooltipConditional;
