import { FC, useEffect, useState } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type TooltipConditionalProps = {
  children: React.ReactNode;
  condition: boolean;
  tooltip: string;
};

const TooltipConditional: FC<TooltipConditionalProps> = ({ children, condition, tooltip }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return condition && mounted ? (
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  ) : (
    <>{children}</>
  );
};

export default TooltipConditional;
