import { FC } from 'react';

import { TotalFees } from '@/lib/types/tx';
import { useProviderStore } from '@/lib/store/use-provider';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import CurrencyAmount from '@/components/common/currency-amount';

type TotalFeesTableProps = {
  totalFees: TotalFees[number];
  txAmount: number;
  hydrating: boolean;
};

/**
 * @notice A table to display the total fees across all (included) transactions
 * @param totalFees The total fees on the chain (+ submission if relevant), in native tokens and usd
 * @param txAmount The amount of transactions on this chain
 * @param hydrating Whether the component is still hydrating
 */
const TotalFeesTable: FC<TotalFeesTableProps> = ({
  totalFees,
  txAmount,
  hydrating,
}) => {
  // The current chain
  const chain = useProviderStore((state) => state.chain);
  const underlying = chain.custom.tech.underlying?.name;

  if (hydrating) return <Skeleton className="h-24" />;
  return (
    <div className="mb-2 flex flex-col gap-2">
      <div className="flex w-full grow items-center gap-2 whitespace-nowrap">
        <Separator orientation="vertical" className="mr-2 h-4" />
        <span className="grow font-medium">Fees</span>
        {txAmount ? (
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold">{totalFees.gasUsed} gas</span>{' '}
            across {txAmount} transaction{txAmount > 1 ? 's' : ''}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-x-8 gap-y-2 text-sm md:grid md:grid-cols-[1fr_auto_auto]">
        <div className="flex flex-col gap-1 font-medium">
          {underlying && txAmount ? (
            <span className="text-xs font-medium text-muted-foreground">
              Total
            </span>
          ) : null}
          <CurrencyAmount
            amount={
              BigInt(totalFees.costNative.root) +
              BigInt(totalFees.costNative.l1Submission)
            }
            symbol={chain.nativeCurrency.symbol}
            decimals={chain.nativeCurrency.decimals}
            full
          />
          <CurrencyAmount
            amount={
              BigInt(totalFees.costUsd.root) +
              BigInt(totalFees.costUsd.l1Submission)
            }
            symbol="USD"
            full
          />
        </div>
        {underlying && txAmount ? (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                L2 ({chain.name})
              </span>
              <CurrencyAmount
                amount={totalFees.costNative.root}
                symbol={chain.nativeCurrency.symbol}
                decimals={chain.nativeCurrency.decimals}
                full
              />
              <CurrencyAmount
                amount={totalFees.costUsd.root}
                symbol="USD"
                full
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                L1 submission ({underlying})
              </span>
              <CurrencyAmount
                amount={totalFees.costNative.l1Submission}
                symbol={chain.nativeCurrency.symbol}
                decimals={chain.nativeCurrency.decimals}
                full
              />
              <CurrencyAmount
                amount={totalFees.costUsd.l1Submission}
                symbol="USD"
                full
              />
            </div>
            {txAmount ? (
              <div className="col-span-3 text-muted-foreground">
                On average, the L1 submission accounted for{' '}
                <span className="font-semibold">
                  {(
                    (Number(totalFees.costNative.l1Submission) * 100) /
                    (Number(totalFees.costNative.root) +
                      Number(totalFees.costNative.l1Submission))
                  ).toFixed(2)}{' '}
                  %
                </span>{' '}
                of the fees.
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default TotalFeesTable;
