'use client';

import { useEffect, useMemo, useState } from 'react';

import DataTableRecipients from './data-table-recipients';
import { InfoCircledIcon } from '@radix-ui/react-icons';

import { DEFAULTS } from '@/lib/constants/defaults';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { useSelectionStore } from '@/lib/store/use-selection';
import { Token } from '@/lib/types/airdrop';
import { cn } from '@/lib/utils';
import { parseAirdropInput } from '@/lib/utils/parse';

import TooltipAlert from '@/components/common/tooltip-alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from '@/components/ui/drawer';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

/* -------------------------------------------------------------------------- */
/*                                    BASE                                    */
/* -------------------------------------------------------------------------- */

const { count: defaultCount, min, max, step } = DEFAULTS.airdropRecipients;

const RecipientsSelection = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md
  const formDisabled = useSelectionStore.global((state) => state.formDisabled);
  const {
    customAirdropData,
    recipientsCount,
    tokenOption,
    setCustomAirdropData,
    setRecipientsCount,
  } = useSelectionStore.airdrop((state) => ({
    customAirdropData: state.customAirdropData,
    recipientsCount: state.recipientsCount,
    tokenOption: state.tokenOption,
    setCustomAirdropData: state.setCustomAirdropData,
    setRecipientsCount: state.setRecipientsCount,
  }));

  const exampleValues: string[][] = useMemo(() => {
    if (tokenOption?.value === 'ERC721') {
      return [
        ['recipient', 'tokenId'],
        ['0xAD285b5dF24BDE77A8391924569AF2AD2D4eE4A7', '1'],
        ['0xc06d127E504a944f63Bc750D8F512556c576F3EF', '2'],
      ];
    } else if (tokenOption?.value === 'ERC1155') {
      return [
        ['recipient', 'tokenId', 'amount'],
        ['0xAD285b5dF24BDE77A8391924569AF2AD2D4eE4A7', '1', '10000000000000000000'],
        ['0xc06d127E504a944f63Bc750D8F512556c576F3EF', '2', '10000000000000000000'],
      ];
    }

    return [
      ['recipient', 'amount'],
      ['0xAD285b5dF24BDE77A8391924569AF2AD2D4eE4A7', '10000000000000000000'],
      ['0xc06d127E504a944f63Bc750D8F512556c576F3EF', '10000000000000000000'],
    ];
  }, [tokenOption]);

  const toggleCustomData = () => {
    setCustomAirdropData({ ...customAirdropData, enabled: !customAirdropData.enabled });
  };

  return (
    <div className={cn('flex flex-col gap-2', formDisabled && 'opacity-50')}>
      <RecipientsAmountButton formDisabled={formDisabled} />
      <Slider
        className={cn('my-2 transition-opacity md:mb-4', customAirdropData.enabled && 'opacity-50')}
        min={min}
        max={max}
        step={step}
        value={[recipientsCount]}
        defaultValue={[defaultCount]}
        onValueChange={(v) => setRecipientsCount(v[0])}
        disabled={formDisabled || customAirdropData.enabled}
      />

      {isDesktop ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <Button
              variant={customAirdropData.enabled ? 'default' : 'secondary'}
              className={cn(
                'col-span-1 grow transition-opacity',
                !customAirdropData.enabled && 'opacity-80',
              )}
              onClick={toggleCustomData}
              disabled={formDisabled}
            >
              Custom airdrop data
            </Button>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-xs">
                  <InfoCircledIcon /> Supported formats
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="min-w-[600px]">
                <SupportedFormats exampleValues={exampleValues} />
              </HoverCardContent>
            </HoverCard>
          </div>
          <CustomDataInput formDisabled={formDisabled} exampleValues={exampleValues} />
        </>
      ) : (
        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={customAirdropData.enabled ? 'custom-data' : ''}
          onValueChange={(v) => {
            if (v === 'custom-data' || v === '') toggleCustomData();
          }}
        >
          <AccordionItem value="custom-data" className="border-none">
            <div className="mb-2 grid grid-cols-[1fr,min-content]">
              <AccordionTrigger disabled={formDisabled} className="hover:no-underline" asChild>
                <Button
                  variant={customAirdropData.enabled ? 'default' : 'secondary'}
                  className={cn(
                    'justify-center transition-colors transition-opacity',
                    !customAirdropData.enabled && 'opacity-80',
                  )}
                >
                  Custom airdrop data
                </Button>
              </AccordionTrigger>
              <Drawer>
                <DrawerTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost">
                    <InfoCircledIcon />
                  </Button>
                </DrawerTrigger>
                <DrawerContent onClick={(e) => e.stopPropagation()} className="mb-8 px-2">
                  <DrawerHeader>Supported formats</DrawerHeader>
                  <SupportedFormats exampleValues={exampleValues} />
                </DrawerContent>
              </Drawer>
            </div>
            <AccordionContent>
              <CustomDataInput formDisabled={formDisabled} exampleValues={exampleValues} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              RECIPIENTS AMOUNT                             */
/* -------------------------------------------------------------------------- */

const RecipientsAmountButton = ({ formDisabled }: { formDisabled: boolean }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [customInput, setCustomInput] = useState('0');

  const { recipientsCount, customData, setRecipientsCount } = useSelectionStore.airdrop(
    (state) => ({
      recipientsCount: state.recipientsCount,
      customData: state.customAirdropData,
      setRecipientsCount: state.setRecipientsCount,
    }),
  );

  // Check if the custom recipients amount is valid when the user closes the popover
  const checkCustomInput = (open: boolean) => {
    if (!open && customInput === '') {
      setCustomInput('1');
      setRecipientsCount(1);
    } else if (!open && Number(customInput) <= 0) {
      setCustomInput('1');
      setRecipientsCount(1);
    } else if (!open && Number(customInput) > 1000) {
      setCustomInput('1000');
      setRecipientsCount(1000);
    }

    setDrawerOpen(open);
  };

  if (isDesktop)
    return (
      <Popover onOpenChange={(o) => checkCustomInput(o)}>
        <PopoverTrigger asChild disabled={formDisabled}>
          <Button className="text-sm" variant="outline" disabled={customData.enabled}>
            <pre className="flex items-center">
              {recipientsCount} recipient
              {recipientsCount === 0 || recipientsCount === 1 ? '' : 's'}
            </pre>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-4">
          <Input
            type="number"
            min={1}
            max={1000}
            style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
            value={customInput}
            onChange={(e) => {
              if (!isNaN(Number(e.target.value.toString()))) {
                setCustomInput(e.target.value);
                setRecipientsCount(Number(e.target.value));
              }
            }}
            disabled={formDisabled}
          />
        </PopoverContent>
      </Popover>
    );

  return (
    <Drawer open={drawerOpen} onOpenChange={(o) => checkCustomInput(o)}>
      <DrawerTrigger asChild>
        <Button className="text-sm" variant="outline" disabled={customData.enabled}>
          <pre>
            {recipientsCount} recipient{recipientsCount === 0 || recipientsCount === 1 ? '' : 's'}
          </pre>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mb-8 mt-4 flex flex-col gap-2 border-t py-2">
          <span className="mx-4 mb-1 text-sm text-muted-foreground">Amount of recipients</span>
          <Input
            type="number"
            min={1}
            max={1000}
            style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
            value={customInput}
            onChange={(e) => {
              if (!isNaN(Number(e.target.value.toString()))) {
                setCustomInput(e.target.value);
                setRecipientsCount(Number(e.target.value));
              }
            }}
            disabled={formDisabled}
          />
          <span className="mx-4 text-sm text-muted-foreground">
            Enter any amount between 1 and 1000 to simulate an airdrop over random recipients
          </span>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

/* -------------------------------------------------------------------------- */
/*                                 CUSTOM DATA                                */
/* -------------------------------------------------------------------------- */

const CustomDataInput = ({
  formDisabled,
  exampleValues,
}: {
  formDisabled: boolean;
  exampleValues: string[][];
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md
  const [customDataInput, setCustomDataInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const { customAirdropData, tokenOption, setCustomAirdropData, setRecipientsCount } =
    useSelectionStore.airdrop((state) => ({
      customAirdropData: state.customAirdropData,
      tokenOption: state.tokenOption,
      setCustomAirdropData: state.setCustomAirdropData,
      setRecipientsCount: state.setRecipientsCount,
    }));

  useEffect(() => {
    if (customAirdropData.enabled && customDataInput !== '') {
      const { data, errors } = parseAirdropInput(customDataInput, tokenOption.value as Token['id']);
      if (errors) {
        setRecipientsCount(0);
        setErrors(errors);
        setCustomAirdropData({ recipients: [], amounts: [], ids: [], enabled: true });

        // console.error(errors);
      } else {
        setErrors([]);
        setRecipientsCount(data.recipients.length);
        setCustomAirdropData({ ...data, enabled: true });
      }
    }
  }, [
    customAirdropData.enabled,
    customDataInput,
    setCustomAirdropData,
    setRecipientsCount,
    tokenOption.value,
  ]);

  useEffect(() => {
    if (customDataInput === '') {
      setErrors([]);
    }
  }, [customDataInput]);

  return (
    <div className="relative flex flex-col gap-2">
      {isDesktop ? (
        <TooltipAlert
          classNameTrigger={cn(
            'absolute top-2 right-2',
            !customAirdropData.enabled && 'opacity-30',
            !errors.length && 'opacity-0',
            'text-destructive transition-opacity',
          )}
          classNameContent="bg-destructive"
          content={errors?.join('\n')}
          disabled={!errors.length}
          disableHoverable={!errors.length}
        />
      ) : null}
      <Textarea
        placeholder={`${exampleValues[1][0]} ${exampleValues[1][1]} ${
          tokenOption?.value === 'ERC1155' ? exampleValues[1][2] : ''
        }\n${exampleValues[2][0]} ${exampleValues[2][1]} ${
          tokenOption?.value === 'ERC1155' ? exampleValues[2][2] : ''
        }\n...`}
        minLength={41}
        disabled={formDisabled || !customAirdropData.enabled}
        className={cn(
          'min-h-[80px] font-mono text-xs transition-all md:text-sm',
          errors.length && customAirdropData.enabled && 'border-destructive',
        )}
        value={customDataInput}
        onChange={(e) => setCustomDataInput(e.target.value)}
      />
      {customAirdropData.enabled && errors.length && customDataInput !== '' && !isDesktop ? (
        <div className="flex flex-col text-sm font-medium text-destructive">
          {errors.map((e, i) => (
            <span key={i}>{e}</span>
          ))}
        </div>
      ) : null}
      {customAirdropData.enabled ? (
        <DataTableRecipients data={customAirdropData} keys={exampleValues[0]} />
      ) : null}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              SUPPORTED FORMATS                             */
/* -------------------------------------------------------------------------- */

const SupportedFormats = ({ exampleValues }: { exampleValues: string[][] }) => {
  return (
    <div className="text-sm text-muted-foreground">
      <Tabs defaultValue="text" className="mt-1">
        <TabsList className="w-full">
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="csv">CSV</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>
        <TabsContent value="text" className="overflow-scroll">
          <pre>
            <span className="font-semibold">{exampleValues[0].join(' ')}</span>
            <br />
            <br />
            {`${exampleValues[1].join(' ')}\n${exampleValues[2].join(' ')}\n...`}
          </pre>
        </TabsContent>
        <TabsContent value="csv" className="overflow-scroll">
          <pre>
            <span className="font-semibold">{exampleValues[0].join(',')}</span>
            <br />
            <br />
            {`${exampleValues[1].join(',')}\n${exampleValues[2].join(',')}\n...`}
          </pre>
        </TabsContent>
        <TabsContent value="json" className="overflow-scroll">
          <pre>
            {JSON.stringify(
              exampleValues
                .slice(1)
                .map((v) =>
                  v.reduce((acc, val, i) => ({ ...acc, [exampleValues[0][i]]: val }), {}),
                ),
              null,
              2,
            )}
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecipientsSelection;
