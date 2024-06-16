'use client';

import { FC, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Chain, CustomChainOptions } from '@/lib/types/providers';
import { useProviderStore } from '@/lib/store/use-provider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/components/common/icons';

type CustomChainCreationProps = {
  setCustomChainOptions: (options: CustomChainOptions | undefined) => void;
};

/* -------------------------------------------------------------------------- */
/*                                    FORM                                    */
/* -------------------------------------------------------------------------- */

/**
 * @notice Select a chain from the list of supported chains
 * @dev This will create or retrieve a Tevm client in local storage
 * @dev The state of various chains can be saved/retrieved from local storage, each
 * on their own key
 * @param hydrating Whether the app is still hydrating or not
 */
const CustomChainCreation: FC<CustomChainCreationProps> = ({
  setCustomChainOptions,
}) => {
  /* ---------------------------------- STATE --------------------------------- */
  const [options, setOptions] = useState<Partial<CustomChainOptions>>({});
  const [isValid, setIsValid] = useState<
    Partial<Record<keyof CustomChainOptions, boolean>>
  >({});

  const chains = useProviderStore((state) => state.chains);

  /* -------------------------------- HANDLERS -------------------------------- */
  const updateOptions = <K extends keyof CustomChainOptions>(
    value: unknown,
    key: K,
    subKey?: keyof CustomChainOptions[K],
  ) => {
    if (subKey) {
      const existing = options[key] || {};
      setOptions({
        ...options,
        [key]: {
          ...existing,
          [subKey]: value,
        },
      });
    } else {
      setOptions({ ...options, [key]: value });
    }
  };

  const isValidInput = (key: keyof CustomChainOptions) => {
    return isValid[key] || options[key] === undefined || options[key] === '';
  };

  /* --------------------------------- EFFECTS -------------------------------- */
  useEffect(() => {
    const { chainId, name } = options;

    const valid = {
      chainId:
        !isNaN(Number(chainId)) &&
        chains.every((chain) => chain.id !== options.chainId),
      name:
        !!name &&
        name.length <= 32 &&
        chains.every((chain) => chain.name !== name),
      rpcUrl: !!options.rpcUrl && options.rpcUrl.startsWith('http'),
    };

    // If required fields are valid, options can be passed for creation (with values or default values for the rest)
    if (valid.chainId && valid.name && valid.rpcUrl) {
      setCustomChainOptions({
        chainId: options.chainId!,
        name: options.name!,
        rpcUrl: options.rpcUrl!,
        nativeToken: {
          name: options.nativeToken?.name || 'Ether',
          symbol: options.nativeToken?.symbol || 'ETH',
          decimals: options.nativeToken?.decimals ?? 18,
          slug: options.nativeToken?.slug || 'ethereum',
        },
        hasPriorityFee: options.hasPriorityFee ?? true,
        rollup: options.rollup,
        underlyingChain: options.underlyingChain,
        // these are not used yet
        layer: options.underlyingChain ? 2 : 1,
        evmCompatible: true,
      });
    } else {
      setCustomChainOptions(undefined);
    }

    setIsValid(valid);
  }, [chains, options, setCustomChainOptions]);

  /* --------------------------------- RENDER --------------------------------- */
  return (
    <div className="grid grid-cols-[min-content_1fr] justify-between gap-x-4 gap-y-2">
      {/* id */}
      <Label
        htmlFor="value"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        Chain id *
      </Label>
      <Input
        id="value"
        type="number"
        className={cn(
          'font-mono text-xs sm:min-w-[300px] sm:text-sm',
          !isValidInput('chainId') && 'border-red-500',
        )}
        placeholder="1"
        value={options.chainId}
        onChange={(e) => updateOptions(Number(e.target.value), 'chainId')}
      />
      {/* name */}
      <Label
        htmlFor="name"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        Name *
      </Label>
      <Input
        id="name"
        className={cn(
          'font-mono text-xs sm:min-w-[300px] sm:text-sm',
          !isValidInput('name') && 'border-red-500',
        )}
        placeholder="Ethereum"
        value={options.name}
        onChange={(e) => updateOptions(e.target.value, 'name')}
        max={32}
      />
      {/* rpc url */}
      <Label
        htmlFor="rpcUrl"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        Rpc *
      </Label>
      <Input
        id="rpcUrl"
        className={cn(
          'font-mono text-xs sm:min-w-[300px] sm:text-sm',
          !isValidInput('rpcUrl') && 'border-red-500',
        )}
        placeholder="https://eth-mainnet.g.alchemy.com/v2/"
        value={options.rpcUrl}
        onChange={(e) => updateOptions(e.target.value, 'rpcUrl')}
      />
      <span className="col-span-2 mt-2 font-semibold text-muted-foreground">
        Gas estimations
      </span>
      <span className="col-span-2 text-sm font-semibold text-muted-foreground">
        Native token (default ETH)
      </span>
      {/* native token */}
      <Label
        htmlFor="nativeToken-name"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        Name
      </Label>
      <Input
        id="nativeToken-name"
        className="font-mono text-xs sm:min-w-[300px] sm:text-sm"
        placeholder="Ether"
        value={options.nativeToken?.name}
        min={1}
        max={32}
        onChange={(e) => updateOptions(e.target.value, 'nativeToken', 'name')}
      />
      <Label
        htmlFor="nativeToken-symbol"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        Symbol
      </Label>
      <Input
        id="nativeToken-symbol"
        className="font-mono text-xs sm:min-w-[300px] sm:text-sm"
        placeholder="ETH"
        value={options.nativeToken?.symbol}
        min={1}
        max={10}
        onChange={(e) => updateOptions(e.target.value, 'nativeToken', 'symbol')}
      />
      <Label
        htmlFor="nativeToken-decimals"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        Decimals
      </Label>
      <Input
        id="nativeToken-decimals"
        type="number"
        className="font-mono text-xs sm:min-w-[300px] sm:text-sm"
        placeholder="18"
        value={options.nativeToken?.decimals}
        min={0}
        max={32}
        onChange={(e) =>
          updateOptions(Number(e.target.value), 'nativeToken', 'decimals')
        }
      />
      <Label
        htmlFor="nativeToken-slug"
        className="flex items-center gap-2 whitespace-nowrap text-sm text-muted-foreground"
      >
        Coinmarketcap slug
      </Label>
      <Input
        id="nativeToken-slug"
        className="font-mono text-xs sm:min-w-[300px] sm:text-sm"
        placeholder="ethereum"
        value={options.nativeToken?.slug}
        min={1}
        max={32}
        onChange={(e) => updateOptions(e.target.value, 'nativeToken', 'slug')}
      />
      {/* technical details */}
      <span className="col-span-2 text-sm font-semibold text-muted-foreground">
        Technical configuration
      </span>
      <SelectOption
        value={options.hasPriorityFee?.toString() || 'true'}
        onChange={(value) => updateOptions(value === 'true', 'hasPriorityFee')}
        options={['true', 'false']}
        placeholder="true"
        label="Priority fee"
      />
      <SelectOption
        value={options.rollup || ''}
        onChange={(value) =>
          value === 'None'
            ? updateOptions(undefined, 'rollup')
            : updateOptions(value, 'rollup')
        }
        options={['op-stack', /* 'arbitrum-orbit', */ 'None']}
        placeholder="None"
        label="Rollup framework"
      />
      <SelectOption
        value={options.underlyingChain ?? ''}
        onChange={(value) =>
          value === 'None'
            ? updateOptions(undefined, 'underlyingChain')
            : updateOptions(
                chains.find((chain) => chain.name === value)?.name,
                'underlyingChain',
              )
        }
        options={chains
          .concat({ name: 'None' } as Chain)
          .map((chain) => chain.name)}
        placeholder="None"
        label="Underlying chain"
      />
    </div>
  );
};

type SelectOptionProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  label: string;
};

const SelectOption = ({
  value,
  onChange,
  options,
  placeholder,
  label,
}: SelectOptionProps) => {
  return (
    <>
      <Label
        htmlFor={label.toLowerCase().replace(' ', '-')}
        className="flex items-center gap-2 whitespace-nowrap text-sm text-muted-foreground"
      >
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 min-w-[90px]">
          <SelectValue placeholder={value || placeholder} />
        </SelectTrigger>
        <SelectContent side="top">
          {options.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                                   BUTTONS                                  */
/* -------------------------------------------------------------------------- */

const rawGetLatestBlockNumber = async (
  rpcUrl: string,
): Promise<{
  success: boolean;
  latestBlock?: bigint;
  error?: string;
}> => {
  const data = {
    jsonrpc: '2.0',
    method: 'eth_blockNumber',
    params: [],
    id: 1,
  };

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) return { success: false, error: response.statusText };

    const result = await response.json();

    // Check if the response includes the result field
    if (result.error) {
      return { success: false, error: result.error.message };
    } else {
      return {
        success: true,
        latestBlock: BigInt(parseInt(result.result, 16)),
      };
    }
  } catch (err: unknown) {
    console.error("Couldn't fetch latest block number", err);
    return { success: false, error: 'Unknown error' };
  }
};

type CustomChainCreationButtonsProps = {
  customChainOptions: CustomChainOptions | undefined;
  setChainCreation: (open: boolean) => void;
};

const CustomChainCreationButtons = ({
  customChainOptions,
  setChainCreation,
}: CustomChainCreationButtonsProps) => {
  const [testingRpc, setTestingRpc] = useState(false);
  const addChain = useProviderStore((state) => state.addChain);

  const createChain = async () => {
    if (!customChainOptions) return;
    setTestingRpc(true);
    const loading = toast.loading('Testing RPC...');

    const { success, error, latestBlock } = await rawGetLatestBlockNumber(
      customChainOptions.rpcUrl,
    );

    if (success) {
      toast.success('Chain created successfully', {
        id: loading,
        description: `Chain ${customChainOptions.name} forked at block ${latestBlock}`,
      });

      setChainCreation(false);
      addChain(customChainOptions);
    } else {
      toast.error('RPC url seems to be invalid', {
        id: loading,
        description: error,
      });
    }

    setTestingRpc(false);
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full"
        disabled={testingRpc}
        onClick={() => setChainCreation(false)}
      >
        Cancel
      </Button>
      <Button
        variant="default"
        className="flex w-full items-center gap-2"
        onClick={createChain}
        disabled={!customChainOptions || testingRpc}
      >
        {testingRpc ? <Icons.loading /> : null} Create
      </Button>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                                    MODAL                                   */
/* -------------------------------------------------------------------------- */

type CustomChainCreationModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CustomChainCreationModal = ({
  open,
  setOpen,
}: CustomChainCreationModalProps) => {
  const [customChainOptions, setCustomChainOptions] = useState<
    CustomChainOptions | undefined
  >(undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-2">Custom chain</DialogTitle>
          <DialogDescription>
            <CustomChainCreation
              setCustomChainOptions={setCustomChainOptions}
            />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <CustomChainCreationButtons
            customChainOptions={customChainOptions}
            setChainCreation={setOpen}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomChainCreation;
export { CustomChainCreationButtons, CustomChainCreationModal };
