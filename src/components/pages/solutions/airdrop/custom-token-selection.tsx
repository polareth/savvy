'use client';

import { useState } from 'react';

import { isAddress } from 'viem';

import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { useSelectionStore } from '@/lib/store/use-selection';
import { cn } from '@/lib/utils';

import TooltipAlert from '@/components/common/tooltip-alert';
import TooltipInfo from '@/components/common/tooltip-info';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CustomTokenSelection = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md
  const formDisabled = useSelectionStore.global((state) => state.formDisabled);
  const { customToken, toggleCustomToken } = useSelectionStore.airdrop((state) => ({
    customToken: state.customToken,
    toggleCustomToken: state.toggleCustomToken,
  }));

  if (isDesktop)
    return (
      <div
        className={cn(
          'mt-2 grid grid-cols-5 items-end gap-2 transition-opacity',
          formDisabled && 'opacity-50',
        )}
      >
        <Button
          variant={customToken ? 'default' : 'secondary'}
          className={cn('col-span-1 transition-opacity', !customToken && 'opacity-80')}
          onClick={toggleCustomToken}
          disabled={formDisabled}
        >
          Custom token
        </Button>
        <CustomTokenSelectionInputs />
      </div>
    );

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={customToken ? 'token-addresses' : ''}
      onValueChange={(v) => {
        if (v === 'token-addresses' || v === '') toggleCustomToken();
      }}
    >
      <AccordionItem value="token-addresses" className="border-none">
        <AccordionTrigger disabled={formDisabled} className="hover:no-underline" asChild>
          <Button
            variant={customToken ? 'default' : 'secondary'}
            className={cn(
              'col-span-1 w-full justify-center transition-colors transition-opacity',
              !customToken && 'opacity-80',
            )}
          >
            Custom token
          </Button>
        </AccordionTrigger>
        <AccordionContent>
          <CustomTokenSelectionInputs />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const CustomTokenSelectionInputs = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md
  const [invalidToken, setInvalidToken] = useState<boolean>(false);
  const [invalidHolder, setInvalidHolder] = useState<boolean>(false);

  const formDisabled = useSelectionStore.global((state) => state.formDisabled);
  const {
    customToken,
    customTokenAddress,
    customTokenOwnerOrHolder,
    setCustomTokenAddress,
    setcustomTokenOwnerOrHolder,
  } = useSelectionStore.airdrop((state) => ({
    customToken: state.customToken,
    customTokenAddress: state.customTokenAddress,
    customTokenOwnerOrHolder: state.customTokenOwnerOrHolder,
    setCustomTokenAddress: state.setCustomTokenAddress,
    setcustomTokenOwnerOrHolder: state.setcustomTokenOwnerOrHolder,
  }));

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
    <>
      <div className="relative col-span-5 mt-8 flex w-full flex-col gap-2 md:col-span-2 md:mt-0">
        <Label
          htmlFor="custom-token-address"
          className={cn(
            'absolute left-0 top-[-1.2rem] flex w-full justify-between gap-2',
            !customToken && 'opacity-30',
          )}
        >
          Token address
          {isDesktop ? (
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
          ) : null}
        </Label>
        <Input
          id="custom-token-address"
          value={customTokenAddress}
          onChange={(e) =>
            checkAddressAndUpdate(e.target.value, setCustomTokenAddress, setInvalidToken)
          }
          disabled={!customToken || formDisabled}
          placeholder="0x..."
        />
        {!isDesktop && invalidToken && customToken ? (
          <div className="text-xs font-medium text-destructive">
            The address does not pass the checksum test
          </div>
        ) : null}
      </div>
      <div className="relative col-span-5 mt-8 flex w-full flex-col gap-2 md:col-span-2 md:mt-0">
        <Label
          htmlFor="custom-token-owner-holder"
          className={cn(
            'absolute left-0 top-[-1.2rem] flex w-full justify-between gap-2',
            !customToken && 'opacity-30',
          )}
        >
          <div className="flex items-center gap-2">
            Owner/Holder
            {isDesktop ? (
              <TooltipInfo
                content="The owner of the contract with the ability to mint tokens or a holder with sufficient balance to cover the airdrop"
                disabled={!customToken}
                disableHoverable
              />
            ) : null}
          </div>
          {isDesktop ? (
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
          ) : null}
        </Label>
        <Input
          id="custom-token-owner-holder"
          value={customTokenOwnerOrHolder}
          onChange={(e) =>
            checkAddressAndUpdate(e.target.value, setcustomTokenOwnerOrHolder, setInvalidHolder)
          }
          disabled={!customToken || formDisabled}
          placeholder="0x..."
        />
        {!isDesktop ? (
          <div className="text-xs text-muted-foreground">
            The owner of the contract with the ability to mint tokens{' '}
            <span className="font-semibold">or</span> a holder with sufficient balance to cover the
            airdrop
          </div>
        ) : null}
        {!isDesktop && invalidHolder && customToken ? (
          <div className="text-xs font-medium text-destructive">
            The address does not pass the checksum test
          </div>
        ) : null}
      </div>
    </>
  );
};

export default CustomTokenSelection;
