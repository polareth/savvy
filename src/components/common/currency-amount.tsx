import { FC } from 'react';

import { Icons } from '@/components/common/icons';
import TooltipPopoverResponsive from '@/components/common/tooltip-popover-responsive';

type CurrencyAmountProps = {
  amount: string | number | bigint;
  symbol?: 'ETH' | 'MATIC' | 'USD' | string;
  noIcon?: boolean;
};

const CurrencyAmount: FC<CurrencyAmountProps> = ({ amount, symbol, noIcon = false }) => {
  if (symbol === 'USD')
    return (
      <span>
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
          Number(amount),
        )}
      </span>
    );

  if (symbol === 'MATIC')
    return (
      <TooltipPopoverResponsive
        trigger={
          <span className="inline-flex items-center gap-1">
            {noIcon ? null : <Icons.polygon className="mr-2 h-4 w-4" />}{' '}
            {parseFloat(Number(amount).toFixed(4))}
          </span>
        }
        content={`${amount.toString()} MATIC`}
      />
    );

  if (symbol === 'ETH')
    return (
      <TooltipPopoverResponsive
        trigger={
          <span className="inline-flex items-center gap-1">
            {noIcon ? null : <Icons.ethereum className="h-4 w-4" />}{' '}
            {parseFloat(Number(amount).toFixed(4))}
          </span>
        }
        content={`${amount.toString()} ETH`}
      />
    );

  return (
    <TooltipPopoverResponsive
      trigger={
        <span>
          {Number(amount).toFixed(4)} {symbol}
        </span>
      }
      content={`${amount.toString()} ${symbol}`}
    />
  );
};

export default CurrencyAmount;
