'use client';

import { FC, useEffect, useState } from 'react';
import { formatGwei, parseGwei } from 'viem';

import { GasControls, GasFeesConfig } from '@/lib/types/gas';
import { DEFAULTS } from '@/lib/constants/defaults';
import { estimatePriorityFeesForBaseFee } from '@/lib/gas';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { useConfigStore } from '@/lib/store/use-config';
import { useProviderStore } from '@/lib/store/use-provider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import GweiAmount from '@/components/common/gwei-amount';
import { Icons } from '@/components/common/icons';
import TooltipResponsive from '@/components/common/tooltip-responsive';

type Priority = 'low' | 'mid' | 'high' | 'custom';

/* -------------------------------------------------------------------------- */
/*                                    BASE                                    */
/* -------------------------------------------------------------------------- */

/**
 * @notice The gas price selection component to define the base and priority fees
 * @dev This includes the underlying base fee (if it's a L2 on top of Ethereum) and the priority fee (if any).
 */
const GasPriceSelection = () => {
  // The priority fee bounds for the selected base fee; meaning the multiplier for the base fee to get the priority fee
  const [priorityFeeBounds, setPriorityFeeBounds] = useState<
    Record<Priority, bigint>
  >({
    low: BigInt(0),
    mid: BigInt(0),
    high: BigInt(0),
    custom: BigInt(0),
  });
  // The currently selected priority fee (low, mid, high, custom)
  const [selectedPriorityFee, setSelectedPriorityFee] =
    useState<Priority>('low');

  // Get the chain and the initialization status from the provider store
  const { chain, initializing } = useProviderStore((state) => ({
    chain: state.chain,
    initializing: state.initializing,
  }));

  // Get the gas fees config, fetching status and getter/setter from the config store
  const {
    gasFeesConfig,
    fetchingGasFeesData,
    getLatestGasFeesData,
    setGasFeesConfig,
  } = useConfigStore((state) => ({
    gasFeesConfig: state.gasFeesConfig,
    fetchingGasFeesData: state.fetchingGasFeesData,
    getLatestGasFeesData: state.getLatestGasFeesData,
    setGasFeesConfig: state.setGasFeesConfig,
  }));

  const loading = initializing || fetchingGasFeesData;

  // Update the priority fee bounds whenever the gas fees config changes
  useEffect(() => {
    if (gasFeesConfig) {
      const { lowerBound, middleBound, upperBound } =
        estimatePriorityFeesForBaseFee(
          gasFeesConfig.nextBaseFeePerGas,
          gasFeesConfig.baseFeeToPriorityFeeBounds,
        );
      setPriorityFeeBounds((bounds) => ({
        low: lowerBound,
        mid: middleBound,
        high: upperBound,
        custom: bounds.custom || BigInt(0),
      }));
    } else {
      setPriorityFeeBounds({
        low: BigInt(0),
        mid: BigInt(0),
        high: BigInt(0),
        custom: BigInt(0),
      });
    }
  }, [gasFeesConfig]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground md:text-sm">
        <Icons.bullet className="mr-0" /> Network condition{' '}
        <TooltipResponsive
          trigger="info"
          content="Simulate network condition by adapting fees (base and priority)"
        />
        <span className="grow" />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 justify-end"
          onClick={getLatestGasFeesData}
          disabled={loading}
        >
          latest
        </Button>
      </div>
      {fetchingGasFeesData ? (
        <div className="flex gap-2 md:flex-col">
          <Button variant="ghost" className="w-full p-0">
            <Skeleton className="h-full w-full rounded-md" />
          </Button>
          <Button variant="ghost" className="w-full p-0">
            <Skeleton className="h-full w-full rounded-md" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 md:flex-col">
          <TooltipResponsive
            trigger={
              <BaseFeeButton
                gasFeesConfig={gasFeesConfig}
                selectedPriorityFee={selectedPriorityFee}
                loading={loading}
                setGasFeesConfig={setGasFeesConfig}
              />
            }
            content="Adjust the block base fee to simulate network congestion"
          />
          {gasFeesConfig?.hasChainPriorityFee ? (
            <TooltipResponsive
              trigger={
                <PriorityFeeButton
                  gasFeesConfig={gasFeesConfig}
                  priorityFeeBounds={priorityFeeBounds}
                  selectedPriorityFee={selectedPriorityFee}
                  loading={loading}
                  setGasFeesConfig={setGasFeesConfig}
                  setPriorityFeeBounds={setPriorityFeeBounds}
                  setSelectedPriorityFee={setSelectedPriorityFee}
                />
              }
              content="Adjust the priority fee based on your rush preference"
            />
          ) : null}
        </div>
      )}
      <div className="flex items-baseline gap-2 text-xs text-muted-foreground md:text-sm">
        <span>Total fee per gas:</span>
        {gasFeesConfig ? (
          <pre className="flex items-center gap-2">
            <GweiAmount
              amount={
                gasFeesConfig.nextBaseFeePerGas +
                (gasFeesConfig.priorityFeePerGas || BigInt(0))
              }
              decimals={gasFeesConfig.gasControls.gweiDecimals}
            />
          </pre>
        ) : (
          <Skeleton className="h-4 w-16 self-end rounded-md" />
        )}
      </div>
      {chain.custom.tech.underlying ? (
        <>
          <div className="mt-2 flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-medium">
              <Icons.bullet className="mr-0 h-2 w-2" />
              Underlying base fee ({chain.custom.tech.underlying.name})
              <TooltipResponsive
                trigger="info"
                content="The base fee of the underlying chain that will mostly influence the cost of the transaction"
              />
            </div>
            {fetchingGasFeesData ? (
              <Button variant="ghost" className="w-full p-0">
                <Skeleton className="h-full w-full rounded-md" />
              </Button>
            ) : (
              <BaseFeeButton
                gasFeesConfig={gasFeesConfig}
                selectedPriorityFee={selectedPriorityFee}
                loading={loading}
                setGasFeesConfig={setGasFeesConfig}
                type="underlyingBase"
                gasControls={
                  chain.custom.tech.underlying.custom.config.gasControls
                }
              />
            )}
          </div>
          <div className="mt-1 flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-medium">
              <Icons.bullet className="mr-0 h-2 w-2" />
              Underlying blob base fee ({chain.custom.tech.underlying.name})
              <TooltipResponsive
                trigger="info"
                content="The blob base fee of the underlying chain that will mostly influence the cost of the transaction"
              />
            </div>
            {fetchingGasFeesData ? (
              <Button variant="ghost" className="w-full p-0">
                <Skeleton className="h-full w-full rounded-md" />
              </Button>
            ) : (
              <BaseFeeButton
                gasFeesConfig={gasFeesConfig}
                selectedPriorityFee={selectedPriorityFee}
                loading={loading}
                setGasFeesConfig={setGasFeesConfig}
                type="underlyingBlob"
                gasControls={
                  chain.custom.tech.underlying.custom.config.gasControls
                }
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  BASE FEE                                  */
/* -------------------------------------------------------------------------- */

type BaseFeeButtonProps = {
  gasFeesConfig: GasFeesConfig | null;
  selectedPriorityFee: Priority;
  loading: boolean;
  setGasFeesConfig: (gasFeesConfig: GasFeesConfig) => void;
  type?: 'base' | 'underlyingBase' | 'underlyingBlob';
  gasControls?: GasControls;
};

type BaseFeeContentProps = Omit<BaseFeeButtonProps, 'loading'>;

/* --------------------------------- BUTTON --------------------------------- */
/**
 * @notice The base fee button component to define the base fee on click (opens a popover)
 * @dev This includes the base fee slider and input to adjust the block base fee
 * @param gasFeesConfig The gas fees configuration for the chain
 * @param selectedPriorityFee The currently selected priority fee (low, mid, high, custom)
 * @param loading The loading status of the gas fees data (or initialization)
 * @param setGasFeesConfig The setter for the gas fees configuration
 * @param type Whether it's the base fee, the underlying base fee or the underlying blob base fee
 * @param gasControls The gas controls for the base fee (min, max, step) - chain or underlying
 */
const BaseFeeButton: FC<BaseFeeButtonProps> = ({
  gasFeesConfig,
  selectedPriorityFee,
  loading,
  setGasFeesConfig,
  type = 'base',
  gasControls = gasFeesConfig?.gasControls,
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md
  const [drawerOpen, setDrawerOpen] = useState(false);

  // The base fee; either the underlying base fee or the chain base fee
  const baseFee =
    type === 'underlyingBase' && gasFeesConfig?.underlyingNextBaseFeePerGas
      ? gasFeesConfig.underlyingNextBaseFeePerGas
      : type === 'underlyingBlob' && gasFeesConfig?.underlyingBlobBaseFeePerGas
        ? gasFeesConfig.underlyingBlobBaseFeePerGas
        : gasFeesConfig?.nextBaseFeePerGas || BigInt(0);

  if (isDesktop)
    return (
      <Popover>
        <PopoverTrigger asChild disabled={loading} className="w-full">
          <Button className="text-sm" variant="outline">
            <pre>
              <GweiAmount
                amount={baseFee}
                decimals={gasFeesConfig?.gasControls.gweiDecimals}
              />
            </pre>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-4">
          <BaseFeeContent
            gasFeesConfig={gasFeesConfig}
            selectedPriorityFee={selectedPriorityFee}
            setGasFeesConfig={setGasFeesConfig}
            type={type}
            gasControls={gasControls}
          />
        </PopoverContent>
      </Popover>
    );

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerTrigger className="grow" asChild>
        <Button className="text-sm" variant="outline">
          <pre>
            <GweiAmount
              amount={baseFee}
              decimals={gasFeesConfig?.gasControls.gweiDecimals}
            />
          </pre>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mb-8 mt-4 flex flex-col gap-2 border-t py-2">
          <span className="mx-4 mb-1 text-sm text-muted-foreground">
            {type === 'underlyingBase'
              ? 'Underlying base fee (Gwei)'
              : type === 'underlyingBlob'
                ? 'Underlying blob base fee (Gwei)'
                : 'Base fee (Gwei)'}
          </span>
          <BaseFeeContent
            gasFeesConfig={gasFeesConfig}
            selectedPriorityFee={selectedPriorityFee}
            setGasFeesConfig={setGasFeesConfig}
            type={type}
            gasControls={gasControls}
          />
          <span className="mx-4 text-sm text-muted-foreground">
            Simulate network congestion by using the slider or input to adjust
            the block base fee.
          </span>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

/* --------------------------------- CONTENT -------------------------------- */
/**
 * @notice The base fee content component to define the base fee slider and input
 * @dev This includes the base fee slider and input to adjust the block base fee
 * @param gasFeesConfig The gas fees configuration for the chain
 * @param selectedPriorityFee The currently selected priority fee (low, mid, high, custom)
 * @param setGasFeesConfig The setter for the gas fees configuration
 * @param type Whether it's the base fee, the underlying base fee or the underlying blob base fee
 * @param gasControls The gas controls for the base fee (min, max, step) - chain or underlying
 */
const BaseFeeContent: FC<BaseFeeContentProps> = ({
  gasFeesConfig,
  selectedPriorityFee,
  setGasFeesConfig,
  type,
  gasControls,
}) => {
  // The base fee; either the underlying base fee or the chain base fee
  const baseFee =
    type === 'underlyingBase' && gasFeesConfig?.underlyingNextBaseFeePerGas
      ? gasFeesConfig.underlyingNextBaseFeePerGas
      : type === 'underlyingBlob' && gasFeesConfig?.underlyingBlobBaseFeePerGas
        ? gasFeesConfig.underlyingBlobBaseFeePerGas
        : gasFeesConfig?.nextBaseFeePerGas || BigInt(0);

  // Update the base fee whenever the slider or input value changes
  const updateGasFeesConfig = (v: bigint) => {
    if (gasFeesConfig) {
      type === 'underlyingBase'
        ? setGasFeesConfig({
            ...gasFeesConfig,
            underlyingNextBaseFeePerGas: v,
          })
        : type === 'underlyingBlob'
          ? setGasFeesConfig({
              ...gasFeesConfig,
              underlyingBlobBaseFeePerGas: v,
            })
          : setGasFeesConfig({
              ...gasFeesConfig,
              nextBaseFeePerGas: v,
              priorityFeePerGas:
                selectedPriorityFee !== 'custom'
                  ? (v *
                      gasFeesConfig.baseFeeToPriorityFeeBounds[
                        selectedPriorityFee
                      ]) /
                    DEFAULTS.precision
                  : gasFeesConfig.priorityFeePerGas,
            });
    }
  };

  return (
    <>
      <Slider
        min={Number(gasControls?.min ?? parseGwei('0'))}
        max={Number(gasControls?.max ?? parseGwei('1000'))}
        step={Number(gasControls?.step ?? parseGwei('0.001'))}
        value={[Number(baseFee || 0)]}
        defaultValue={[0]}
        onValueChange={(v) => updateGasFeesConfig(BigInt(v[0]))}
      />
      <Input
        type="number"
        min={Number(gasControls?.min) || 0}
        max={Number(gasControls?.max) || 1000}
        style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
        value={formatGwei(baseFee).toString()}
        onChange={(e) => updateGasFeesConfig(parseGwei(e.target.value))}
      />
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                               PRIORITY FEE                                 */
/* -------------------------------------------------------------------------- */

type PriorityFeeButtonProps = {
  gasFeesConfig: GasFeesConfig | null;
  priorityFeeBounds: Record<Priority, bigint>;
  selectedPriorityFee: Priority;
  loading: boolean;
  setGasFeesConfig: (gasFeesConfig: GasFeesConfig) => void;
  setPriorityFeeBounds: (priorityFeeBounds: Record<Priority, bigint>) => void;
  setSelectedPriorityFee: (v: Priority) => void;
};

type PriorityFeeContentProps = Omit<PriorityFeeButtonProps, 'loading'> & {
  selectedPriorityFee: Priority;
  customInput: string;
  setSelectedPriorityFee: (v: Priority) => void;
  setCustomInput: (v: string) => void;
};

// TODO Explain priority fee calculation/prediction
//  {/* Priority fee (derived from the selected base fee, using historical data + give link) */}

/* --------------------------------- BUTTON --------------------------------- */
/**
 * @notice The priority fee button component to define the priority fee on click (opens a popover)
 * @dev This includes the priority fee toggle group to adjust the priority fee
 * @param gasFeesConfig The gas fees configuration for the chain
 * @param priorityFeeBounds The priority fee bounds for the selected base fee; meaning the multiplier for the base fee to get the priority fee
 * @param selectedPriorityFee The currently selected priority fee (low, mid, high, custom)
 * @param loading The loading status of the gas fees data (or initialization)
 * @param setGasFeesConfig The setter for the gas fees configuration
 * @param setPriorityFeeBounds The setter for the priority fee bounds
 * @param setSelectedPriorityFee The setter for the selected priority fee
 */
const PriorityFeeButton: FC<PriorityFeeButtonProps> = ({
  gasFeesConfig,
  priorityFeeBounds,
  selectedPriorityFee,
  loading,
  setGasFeesConfig,
  setPriorityFeeBounds,
  setSelectedPriorityFee,
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [customInput, setCustomInput] = useState('0');

  // Check if the custom input is valid when the user closes the popover
  // If not valid, revert to the 'low' priority fee and reset custom input to 0
  const checkCustomInput = (open: boolean) => {
    if (!open && selectedPriorityFee === 'custom' && customInput === '') {
      setCustomInput('0');
      setSelectedPriorityFee('low');
    }

    setDrawerOpen(open);
  };

  if (isDesktop)
    return (
      <Popover onOpenChange={(o) => checkCustomInput(o)}>
        <PopoverTrigger asChild disabled={loading} className="w-full">
          <Button className="text-sm" variant="outline">
            <pre>
              <GweiAmount
                amount={priorityFeeBounds[selectedPriorityFee]}
                decimals={gasFeesConfig?.gasControls.gweiDecimals}
              />{' '}
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
          <PriorityFeeContent
            gasFeesConfig={gasFeesConfig}
            priorityFeeBounds={priorityFeeBounds}
            selectedPriorityFee={selectedPriorityFee}
            customInput={customInput}
            setGasFeesConfig={setGasFeesConfig}
            setPriorityFeeBounds={setPriorityFeeBounds}
            setSelectedPriorityFee={setSelectedPriorityFee}
            setCustomInput={setCustomInput}
          />
        </PopoverContent>
      </Popover>
    );

  return (
    <Drawer open={drawerOpen} onOpenChange={(o) => checkCustomInput(o)}>
      <DrawerTrigger className="grow" asChild>
        <Button className="text-sm" variant="outline">
          <pre>
            <GweiAmount
              amount={priorityFeeBounds[selectedPriorityFee]}
              decimals={gasFeesConfig?.gasControls.gweiDecimals}
            />{' '}
            <span className="text-muted-foreground">
              (
              {selectedPriorityFee === 'low'
                ? 'slow'
                : selectedPriorityFee === 'mid'
                  ? 'std'
                  : selectedPriorityFee === 'high'
                    ? 'fast'
                    : 'custom'}
              )
            </span>
          </pre>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mb-8 mt-4 flex flex-col gap-2 border-t py-2">
          <span className="mx-4 mb-1 text-sm text-muted-foreground">
            Priority fee (Gwei)
          </span>
          <PriorityFeeContent
            gasFeesConfig={gasFeesConfig}
            priorityFeeBounds={priorityFeeBounds}
            selectedPriorityFee={selectedPriorityFee}
            customInput={customInput}
            setGasFeesConfig={setGasFeesConfig}
            setPriorityFeeBounds={setPriorityFeeBounds}
            setSelectedPriorityFee={setSelectedPriorityFee}
            setCustomInput={setCustomInput}
          />
          <span className="mx-4 text-sm text-muted-foreground">
            Adjust the priority fee based on your rush preference.
          </span>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

/* --------------------------------- CONTENT -------------------------------- */
/**
 * @notice The priority fee content component to define the priority fee toggle group
 * @dev This includes the priority fee toggle group to adjust the priority fee and a custom input
 * @param gasFeesConfig The gas fees configuration for the chain
 * @param priorityFeeBounds The priority fee bounds for the selected base fee; meaning the multiplier for the base fee to get the priority fee
 * @param selectedPriorityFee The currently selected priority fee (low, mid, high, custom)
 * @param customInput The custom input for the priority fee
 * @param setGasFeesConfig The setter for the gas fees configuration
 * @param setPriorityFeeBounds The setter for the priority fee bounds
 * @param setSelectedPriorityFee The setter for the selected priority fee
 * @param setCustomInput The setter for the custom input
 */
const PriorityFeeContent: FC<PriorityFeeContentProps> = ({
  gasFeesConfig,
  priorityFeeBounds,
  selectedPriorityFee,
  customInput,
  setGasFeesConfig,
  setPriorityFeeBounds,
  setSelectedPriorityFee,
  setCustomInput,
}) => {
  return (
    <ToggleGroup
      type="single"
      value={selectedPriorityFee}
      className="flex w-full flex-wrap gap-y-1"
      onValueChange={(v) => {
        if (v) setSelectedPriorityFee(v as Priority);
        if (v && gasFeesConfig) {
          setGasFeesConfig({
            ...gasFeesConfig,
            priorityFeePerGas: priorityFeeBounds[v as Priority],
          });
        }
      }}
    >
      <ToggleGroupItem
        value="low"
        aria-label="Select low priority fee"
        className="flex grow flex-col py-6"
      >
        <span>slow</span>
        <pre className="text-muted-foreground">
          <GweiAmount
            amount={priorityFeeBounds['low']}
            decimals={gasFeesConfig?.gasControls.gweiDecimals}
          />
        </pre>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="mid"
        aria-label="Select standard priority fee"
        className="flex grow flex-col py-6"
      >
        <span>standard</span>
        <pre className="text-muted-foreground">
          <GweiAmount
            amount={priorityFeeBounds['mid']}
            decimals={gasFeesConfig?.gasControls.gweiDecimals}
          />
        </pre>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="high"
        aria-label="Select high priority fee"
        className="flex grow flex-col py-6"
      >
        <span>fast</span>
        <pre className="text-muted-foreground">
          <GweiAmount
            amount={priorityFeeBounds['high']}
            decimals={gasFeesConfig?.gasControls.gweiDecimals}
          />
        </pre>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="custom"
        aria-label="Select custom priority fee"
        className="flex w-full grow justify-between gap-4 py-6"
      >
        <span
          className={cn(
            'transition-color',
            customInput !== '' &&
              selectedPriorityFee === 'custom' &&
              'text-primary',
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
            if (!isNaN(Number(e.target.value.toString()))) {
              setCustomInput(e.target.value);
              setPriorityFeeBounds({
                ...priorityFeeBounds,
                custom: parseGwei(e.target.value),
              });
            }
          }}
        />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default GasPriceSelection;
