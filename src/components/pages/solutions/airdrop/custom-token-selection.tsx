'use client';

import { useState } from 'react';

import { isAddress } from 'viem';

import { useSelectionStore } from '@/lib/store/use-selection';
import { cn } from '@/lib/utils';

import TooltipAlert from '@/components/common/tooltip-alert';
import TooltipInfo from '@/components/common/tooltip-info';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const CustomTokenSelection = () => {
  const formDisabled = useSelectionStore.global((state) => state.formDisabled);
  const {
    customToken,
    customTokenAddress,
    customTokenOwnerOrHolder,
    toggleCustomToken,
    setCustomTokenAddress,
    setcustomTokenOwnerOrHolder,
  } = useSelectionStore.airdrop((state) => ({
    customToken: state.customToken,
    customTokenAddress: state.customTokenAddress,
    customTokenOwnerOrHolder: state.customTokenOwnerOrHolder,
    toggleCustomToken: state.toggleCustomToken,
    setCustomTokenAddress: state.setCustomTokenAddress,
    setcustomTokenOwnerOrHolder: state.setcustomTokenOwnerOrHolder,
  }));

  const [invalidToken, setInvalidToken] = useState<boolean>(false);
  const [invalidHolder, setInvalidHolder] = useState<boolean>(false);

  // Use string instead of 0xstring to have an empty input + placeholder
  // Add a label
  // If invalid put in red + "⚠︎ Invalid address" next to label
  // If not checked, opacity + disabled (with a transition on opacity)

  const checkAddressAndUpdate = (
    address: string,
    setAddress: (v: string) => void,
    setInvalid: (v: boolean) => void,
  ) => {
    if (!isAddress(address) && address !== '') {
      setInvalid(true);
    } else {
      setInvalid(false);
    }
    setAddress(address);
  };

  return (
    <div className="flex items-center justify-between gap-8">
      <div className="flex items-center space-x-2">
        <Switch
          id="custom-token"
          checked={customToken}
          onCheckedChange={toggleCustomToken}
          disabled={formDisabled}
        />
        <Label htmlFor="custom-token">Use a custom token</Label>
      </div>
      <div
        className={cn(
          'flex grow justify-end gap-2 transition-opacity',
          customToken ? '' : 'opacity-50',
        )}
      >
        <div className="relative flex w-full flex-col gap-2">
          <Label
            htmlFor="custom-token-address"
            className={cn(
              'absolute left-0 top-[-1.2rem] flex w-full justify-between gap-2',
              !customToken && 'opacity-30',
            )}
          >
            Token address
            <TooltipAlert
              classNameTrigger={cn(
                !invalidToken && 'opacity-0',
                'text-destructive transition-opacity',
              )}
              classNameContent="bg-destructive"
              content="The address does not pass the checksum test"
              disabled={!invalidToken}
              disableHoverable={!invalidToken}
            />
          </Label>
          <Input
            id="custom-token-address"
            value={customTokenAddress}
            onChange={(e) =>
              checkAddressAndUpdate(e.target.value, setCustomTokenAddress, setInvalidToken)
            }
            disabled={!customToken || formDisabled}
            placeholder="0x..."
            className={cn(invalidToken && 'border-destructive')}
          />
        </div>
        <div className="relative flex w-full flex-col gap-2">
          <Label
            htmlFor="custom-token-owner-holder"
            className={cn(
              'absolute left-0 top-[-1.2rem] flex w-full justify-between gap-2',
              !customToken && 'opacity-30',
            )}
          >
            <div className="flex items-center gap-2">
              Owner/Holder
              <TooltipInfo
                content="The owner of the contract with the ability to mint tokens or a holder with sufficient balance to cover the airdrop"
                disabled={!customToken}
                disableHoverable
              />
            </div>
            <TooltipAlert
              classNameTrigger={cn(
                !invalidHolder && 'opacity-0',
                'text-destructive transition-opacity',
              )}
              classNameContent="bg-destructive"
              content="The address does not pass the checksum test"
              disabled={!invalidHolder}
              disableHoverable={!invalidHolder}
            />
          </Label>
          <Input
            id="custom-token-owner-holder"
            value={customTokenOwnerOrHolder}
            onChange={(e) =>
              checkAddressAndUpdate(e.target.value, setcustomTokenOwnerOrHolder, setInvalidHolder)
            }
            disabled={!customToken || formDisabled}
            placeholder="0x..."
            className={cn(invalidHolder && 'border-destructive')}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomTokenSelection;
