'use client';

import { useEffect, useMemo, useState } from 'react';

import { Column, ColumnDef } from '@tanstack/react-table';

import { DEFAULTS } from '@/lib/constants/defaults';
import { useSelectionStore } from '@/lib/store/use-selection';
import { Token } from '@/lib/types/airdrop';
import { cn } from '@/lib/utils';
import { parseAirdropInput } from '@/lib/utils/parse';

import TooltipAlert from '@/components/common/tooltip-alert';
import DataTableColumnHeaderSearchable from '@/components/templates/table/column-header';
import AirdropDataTable from '@/components/templates/table/data-table';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const { count: defaultCount, min, max, step } = DEFAULTS.airdropRecipients;

export type ColumnDataType = { recipient: string; amount?: string; tokenId?: string };

const RecipientsSelection = () => {
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

  const [customDataInput, setCustomDataInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

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

  const columns = useMemo(
    () =>
      exampleValues[0].map((value) => ({
        accessorKey: value,
        header: () => (
          <span className="font-semibold">{value.charAt(0).toUpperCase() + value.slice(1)}</span>
        ),
      })),
    [exampleValues],
  );

  const table = useMemo(
    () => ({
      data: customAirdropData.recipients.map((recipient, i) => {
        return {
          recipient,
          tokenId: customAirdropData.ids[i] || '',
          amount: customAirdropData.amounts[i] || '',
        };
      }),
      columns,
    }),
    [customAirdropData, columns],
  );

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
    <div className={cn('flex flex-col gap-2', formDisabled && 'opacity-50')}>
      Recipients amount: {recipientsCount}
      <Slider
        className="mt-2"
        min={min}
        max={max}
        step={step}
        value={[recipientsCount]}
        defaultValue={[defaultCount]}
        onValueChange={(v) => setRecipientsCount(v[0])}
        disabled={formDisabled || customAirdropData.enabled}
      />
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Switch
            id="custom-data"
            checked={customAirdropData.enabled}
            onCheckedChange={(c) => setCustomAirdropData({ ...customAirdropData, enabled: c })}
            disabled={formDisabled}
          />
          <Label
            htmlFor="custom-data"
            className={cn(
              'relative flex w-full items-center justify-between gap-2 transition-opacity',
              !customAirdropData.enabled && 'opacity-80',
            )}
          >
            <span>Use custom airdrop data</span>
            <TooltipAlert
              classNameTrigger={cn(
                !errors.length && 'opacity-0',
                !customAirdropData.enabled && 'opacity-30',
                'text-destructive transition-opacity',
              )}
              classNameContent="bg-destructive"
              content={errors?.join('\n')}
              disabled={!errors.length}
              disableHoverable={!errors.length}
            />
          </Label>
        </div>
        <Textarea
          placeholder={`${exampleValues[1][0]} ${exampleValues[1][1]} ${
            tokenOption?.value === 'ERC1155' ? exampleValues[1][2] : ''
          }\n${exampleValues[2][0]} ${exampleValues[2][1]} ${
            tokenOption?.value === 'ERC1155' ? exampleValues[2][2] : ''
          }\n...`}
          minLength={41}
          disabled={formDisabled || !customAirdropData.enabled}
          className={cn(
            'min-h-[80px] transition-opacity',
            errors.length && customAirdropData.enabled && 'border-destructive',
            customAirdropData.enabled ? '' : 'opacity-50',
          )}
          value={customDataInput}
          onChange={(e) => setCustomDataInput(e.target.value)}
        />
        {customAirdropData.enabled ? (
          errors.length || customDataInput === '' ? (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">The following formats are supported:</span>
              <Tabs defaultValue="text" className="mt-1">
                <TabsList className="w-full">
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="csv">CSV</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>
                <TabsContent value="text">
                  <pre>
                    <span className="font-semibold">{exampleValues[0].join(' ')}</span>
                    <br />
                    {`${exampleValues[1].join(' ')}\n${exampleValues[2].join(' ')}\n...`}
                  </pre>
                </TabsContent>
                <TabsContent value="csv">
                  <pre>
                    <span className="font-semibold">{exampleValues[0].join(',')}</span>
                    <br />
                    {`${exampleValues[1].join(',')}\n${exampleValues[2].join(',')}\n...`}
                  </pre>
                </TabsContent>
                <TabsContent value="json">
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
          ) : (
            <AirdropDataTable data={table.data} columns={table.columns} />
          )
        ) : null}
      </div>
    </div>
  );
};

export default RecipientsSelection;
