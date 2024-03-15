import { FC, useMemo } from 'react';
import { formatUnits } from 'viem';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/common/icons';
import TooltipResponsive from '@/components/common/tooltip-responsive';

type CurrencyAmountProps = {
  amount: string | number | bigint;
  symbol?: 'ETH' | 'MATIC' | 'USD' | string;
  decimals?: number;
  full?: boolean;
  icon?: boolean;
  className?: string;
};

/**
 * @notice A component to display a currency amount with its symbol or icon
 * @param amount The amount to display (full number including decimals)
 * @param symbol The symbol of the currency (default: 'ETH')
 * @param decimals The decimals of the currency (default: 18 for ETH)
 * @param full Whether to display the full amount (default: false)
 * @param icon Whether to display the icon of the currency (default: true)
 * @param className Additional classes to apply to the component
 */
const CurrencyAmount: FC<CurrencyAmountProps> = ({
  amount = 0,
  symbol = 'ETH',
  decimals = 18,
  full = false,
  icon = true,
  className,
}) => {
  // Format the amount correctly based on the currency
  const formatted = useMemo(() => {
    return symbol === 'USD' ? amount : formatUnits(BigInt(amount), decimals);
  }, [amount, symbol, decimals]);

  // Format the displayed amount
  const displayedAmount = useMemo(() => {
    const tokenDisplayLimit = symbol === 'MATIC' ? BigInt(1e11) : BigInt(1e13);
    const tokenDisplayPrecision = symbol === 'MATIC' ? 4 : 5;

    switch (symbol) {
      case 'USD':
        if (Number(amount) < 0.01 && Number(amount) !== 0) return '<0.01';
        if (Number(amount) === 0) return '0';
        return `${parseFloat(Number(formatted).toFixed(2))}`;

      default:
        if (BigInt(amount) === BigInt(0)) return '0';
        // 0 < amount < 0.00001 ETH || 0 < amount < 0.0000001 MATIC
        if (BigInt(amount) < tokenDisplayLimit && BigInt(amount) > BigInt(0))
          return '<0.00001';
        return parseFloat(Number(formatted).toFixed(tokenDisplayPrecision));
    }
  }, [amount, formatted, symbol]);

  // Does the currency have an icon?
  const hasIcon = symbol === 'ETH' || symbol === 'MATIC' || symbol === 'USD';

  if (full)
    return (
      <span>
        {formatted.toString()} {symbol}
      </span>
    );

  return (
    <TooltipResponsive
      trigger={
        <div className="inline-flex items-center gap-1">
          {icon && symbol === 'ETH' ? (
            <Icons.ethereum className="h-4 w-4" />
          ) : icon && symbol === 'MATIC' ? (
            <Icons.polygon className="h-4 w-4" />
          ) : icon && symbol === 'USD' ? (
            <span>$</span>
          ) : null}
          {displayedAmount} {!hasIcon ? symbol : null}
        </div>
      }
      content={`${formatted.toString()} ${symbol}`}
      classNameTrigger={cn('w-min whitespace-nowrap', className)}
    />
  );
};

export default CurrencyAmount;
