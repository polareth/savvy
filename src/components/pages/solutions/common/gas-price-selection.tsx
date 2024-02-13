'use client';

import { FC, useCallback, useEffect, useState } from 'react';

import { formatGwei, parseGwei } from 'viem';

import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { useSelectionStore } from '@/lib/store/use-selection';
import { GasFeesData } from '@/lib/types/estimate';
import { cn, toastErrorWithContact } from '@/lib/utils';
import { estimatePriorityFeesForBaseFee, getGasFeesData } from '@/lib/utils/gas';

import GweiAmount from '@/components/common/gwei-amount';
import TooltipConditional from '@/components/common/tooltip-conditional';
import TooltipInfo from '@/components/common/tooltip-info';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type Priority = 'low' | 'mid' | 'high' | 'custom';

/* -------------------------------------------------------------------------- */
/*                                    BASE                                    */
/* -------------------------------------------------------------------------- */

type GasPriceSelectionProps = {
  className?: string;
};

const GasPriceSelection: FC<GasPriceSelectionProps> = ({ className }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md
  const [loading, setLoading] = useState(true);

  const [priorityFeeBounds, setPriorityFeeBounds] = useState<Record<Priority, bigint>>({
    low: BigInt(0),
    mid: BigInt(0),
    high: BigInt(0),
    custom: BigInt(0),
  });

  const { chain, gasFeesData, formDisabled, getCurrentChain, setGasFeesData } =
    useSelectionStore.global((state) => ({
      chain: state.chainOption,
      gasFeesData: state.gasFeesData,
      formDisabled: state.formDisabled,
      getCurrentChain: state.getCurrentChain,
      setGasFeesData: state.setGasFeesData,
    }));

  const fetchAndUpdateGasPrice = useCallback(
    async (chainId: number) => {
      setLoading(true);
      const gasFeesData = await getGasFeesData(chainId);
      setGasFeesData(gasFeesData);
      setLoading(false);

      // Display an error if we should get rewards data but failed to do so
      if (
        gasFeesData.hasChainPriorityFee &&
        Object.values(gasFeesData.baseFeeToPriorityFeeBounds).some((v) => v === BigInt(0))
      ) {
        toastErrorWithContact(
          'Error: gas fees',
          'Failed to retrieve enough fees history to calculate appropriate max priority fees.',
        );
      }
    },
    [setGasFeesData],
  );

  useEffect(() => {
    // chain.value is the chain id; retrieved from the chain selection
    if (chain) fetchAndUpdateGasPrice(Number(chain.value));
  }, [chain, fetchAndUpdateGasPrice]);

  useEffect(() => {
    if (gasFeesData) {
      const { lowerBound, middleBound, upperBound } = estimatePriorityFeesForBaseFee(
        gasFeesData.nextBaseFeePerGas,
        gasFeesData.baseFeeToPriorityFeeBounds,
      );
      setPriorityFeeBounds((bounds) => ({
        low: lowerBound,
        mid: middleBound,
        high: upperBound,
        custom: bounds.custom || BigInt(0),
      }));
    } else {
      setPriorityFeeBounds({ low: BigInt(0), mid: BigInt(0), high: BigInt(0), custom: BigInt(0) });
    }
  }, [gasFeesData]);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {isDesktop ? (
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          2. Network condition{' '}
          <TooltipInfo content="Simulate network condition by adapting fees (base and priority)" />
          <span className="grow" />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 justify-end"
            onClick={() => fetchAndUpdateGasPrice(Number(chain.value))}
          >
            reset
          </Button>
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        {loading ? (
          <>
            <Button variant="ghost" className="p-0">
              <Skeleton className="h-full w-full rounded-md" />
            </Button>
            {!gasFeesData || gasFeesData.hasChainPriorityFee ? (
              <Button variant="ghost" className="p-0">
                <Skeleton className="h-full w-full rounded-md" />
              </Button>
            ) : null}
          </>
        ) : (
          <>
            <TooltipConditional
              condition={!formDisabled}
              tooltip="Adjust the block base fee to simulate network congestion"
            >
              <BaseFeeButton
                gasFeesData={gasFeesData}
                formDisabled={formDisabled}
                setGasFeesData={setGasFeesData}
                minimalDisplay={!isDesktop}
              />
            </TooltipConditional>
            {gasFeesData?.hasChainPriorityFee ? (
              <TooltipConditional
                condition={!formDisabled}
                tooltip="Adjust the priority fee based on your rush preference"
              >
                <PriorityFeeButton
                  gasFeesData={gasFeesData}
                  priorityFeeBounds={priorityFeeBounds}
                  formDisabled={formDisabled}
                  setGasFeesData={setGasFeesData}
                  setPriorityFeeBounds={setPriorityFeeBounds}
                />
              </TooltipConditional>
            ) : null}
          </>
        )}
      </div>
      <div className="flex gap-2 text-sm text-muted-foreground">
        <span>Total fee per gas:</span>
        {gasFeesData ? (
          <pre className="flex items-center gap-2">
            <GweiAmount amount={gasFeesData.totalFeePerGas} />
          </pre>
        ) : (
          <Skeleton className="h-4 w-16 self-end rounded-md" />
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  BASE FEE                                  */
/* -------------------------------------------------------------------------- */

type BaseGasButtonProps = {
  gasFeesData: GasFeesData | null;
  formDisabled: boolean;
  setGasFeesData: (gasFeesData: GasFeesData) => void;
  minimalDisplay?: boolean;
};

const BaseFeeButton: FC<BaseGasButtonProps> = ({
  gasFeesData,
  formDisabled,
  setGasFeesData,
  minimalDisplay,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild disabled={formDisabled} className="w-full">
        <Button className="text-sm" variant={minimalDisplay ? 'outline' : 'secondary'}>
          <pre>
            <GweiAmount amount={gasFeesData?.nextBaseFeePerGas || BigInt(0)} />
          </pre>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-4">
        <Slider
          min={Number(gasFeesData?.gasControls?.min ?? parseGwei('0'))}
          max={Number(gasFeesData?.gasControls?.max ?? parseGwei('1000'))}
          step={Number(gasFeesData?.gasControls?.step ?? parseGwei('0.001'))}
          value={[Number(gasFeesData?.nextBaseFeePerGas || 0)]}
          defaultValue={[0]}
          onValueChange={(v) => {
            gasFeesData
              ? setGasFeesData({ ...gasFeesData, nextBaseFeePerGas: BigInt(v[0]) })
              : null;
          }}
          disabled={formDisabled}
        />
        <Input
          type="number"
          min={Number(gasFeesData?.gasControls?.min) || 0}
          max={Number(gasFeesData?.gasControls?.max) || 1000}
          style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
          value={formatGwei(gasFeesData?.nextBaseFeePerGas || BigInt(0)).toString()}
          onChange={(e) => {
            gasFeesData
              ? setGasFeesData({
                  ...gasFeesData,
                  nextBaseFeePerGas: parseGwei(e.target.value),
                })
              : null;
          }}
          disabled={formDisabled}
        />
      </PopoverContent>
    </Popover>
  );
};

/* -------------------------------------------------------------------------- */
/*                               PRIORITY FEE                                 */
/* -------------------------------------------------------------------------- */

type PriorityFeeButtonProps = {
  gasFeesData: GasFeesData | null;
  priorityFeeBounds: Record<Priority, bigint>;
  formDisabled: boolean;
  setGasFeesData: (gasFeesData: GasFeesData) => void;
  setPriorityFeeBounds: (priorityFeeBounds: Record<Priority, bigint>) => void;
};

const PriorityFeeButton: FC<PriorityFeeButtonProps> = ({
  gasFeesData,
  priorityFeeBounds,
  formDisabled,
  setGasFeesData,
  setPriorityFeeBounds,
}) => {
  const [selectedPriorityFee, setSelectedPriorityFee] = useState<'low' | 'mid' | 'high' | 'custom'>(
    'low',
  );
  const [customInput, setCustomInput] = useState('0');

  // Check if the custom input is valid when the user closes the popover
  const checkCustomInput = (open: boolean) => {
    if (!open && selectedPriorityFee === 'custom' && customInput === '') {
      setCustomInput('0');
      setSelectedPriorityFee('low');
    }
  };

  return (
    <Popover onOpenChange={(o) => checkCustomInput(o)}>
      <PopoverTrigger asChild disabled={formDisabled} className="w-full">
        <Button className="text-sm" variant="secondary">
          <pre>
            <GweiAmount amount={priorityFeeBounds[selectedPriorityFee]} />{' '}
            <span className="text-muted-foreground">
              (
              {selectedPriorityFee === 'low'
                ? 'slow'
                : selectedPriorityFee === 'mid'
                ? 'standard'
                : selectedPriorityFee === 'high'
                ? 'fast'
                : 'custom'}
              )
            </span>
          </pre>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex min-w-[450px] flex-col gap-4">
        <ToggleGroup
          type="single"
          value={selectedPriorityFee}
          className="grid w-full grid-cols-3 gap-y-1"
          onValueChange={(v) => {
            if (v) setSelectedPriorityFee(v as Priority);
            if (gasFeesData) {
              setGasFeesData({
                ...gasFeesData,
                totalFeePerGas: gasFeesData?.nextBaseFeePerGas + priorityFeeBounds[v as Priority],
              });
            }
          }}
          disabled={formDisabled}
        >
          <ToggleGroupItem
            value="low"
            aria-label="Select low priority fee"
            className="flex w-full flex-col py-6"
          >
            <span>slow</span>
            <pre className="text-muted-foreground">
              <GweiAmount amount={priorityFeeBounds['low']} />
            </pre>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="mid"
            aria-label="Select standard priority fee"
            className="flex w-full flex-col py-6"
          >
            <span>standard</span>
            <pre className="text-muted-foreground">
              <GweiAmount amount={priorityFeeBounds['mid']} />
            </pre>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="high"
            aria-label="Select high priority fee"
            className="flex w-full flex-col py-6"
          >
            <span>fast</span>
            <pre className="text-muted-foreground">
              <GweiAmount amount={priorityFeeBounds['high']} />
            </pre>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="custom"
            aria-label="Select custom priority fee"
            className="col-span-3 flex w-full justify-between gap-4 py-6"
          >
            <span
              className={cn(
                'transition-color',
                customInput !== '' && selectedPriorityFee === 'custom' && 'text-primary',
              )}
            >
              custom
            </span>
            <Input
              type="number"
              min={0}
              max={1000}
              style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
              value={customInput}
              onChange={(e) => {
                if (!isNaN(Number(e.target.value))) {
                  setCustomInput(e.target.value);
                  setPriorityFeeBounds({
                    ...priorityFeeBounds,
                    custom: parseGwei(e.target.value),
                  });
                }
              }}
              disabled={formDisabled}
            />
          </ToggleGroupItem>
        </ToggleGroup>
        <span>
          {/* Priority fee (derived from the selected base fee, using historical data + give link) */}
        </span>
      </PopoverContent>
    </Popover>
  );
};

export default GasPriceSelection;
