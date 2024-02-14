'use client';

import { FC, useState } from 'react';

import { ChevronDownIcon } from 'lucide-react';

import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { ComboboxOption } from '@/lib/types/templates';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/* -------------------------------------------------------------------------- */
/*                                  COMBOBOX                                  */
/* -------------------------------------------------------------------------- */

type ComboBoxResponsiveProps = {
  items: ComboboxOption[];
  label: string;
  boxWidth?: string;
  selected: ComboboxOption;
  setSelected: (item: ComboboxOption) => void;
  header?: string;
  disabled?: boolean;
  minimalDisplay?: boolean;
};

const ComboBoxResponsive: FC<ComboBoxResponsiveProps> = (props) => {
  const { label, boxWidth, selected, disabled, header, minimalDisplay, setSelected } = props;
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            className={cn('flex items-center justify-start', boxWidth || 'w-full')}
          >
            {selected ? (
              <>
                {selected.icon ? (
                  <selected.icon
                    className="mr-2 h-4 w-4"
                    style={{ stroke: selected.iconColor || 'currentColor' }}
                  />
                ) : null}
                {selected.label}
              </>
            ) : (
              <>
                <ChevronDownIcon className="mr-2 h-4 w-4" /> {label}
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <ItemList setOpen={setOpen} setSelectedItem={setSelected} {...props} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className={cn('flex items-center justify-start', !minimalDisplay && 'w-[250px]')}
        >
          {selected ? (
            <>
              {selected.icon ? (
                <selected.icon
                  className="h-4 w-4"
                  style={{ stroke: selected.iconColor || 'currentColor' }}
                />
              ) : null}
              {minimalDisplay ? null : (
                <span className={cn(selected.icon && 'ml-2')}>{selected.label}</span>
              )}
            </>
          ) : (
            <>
              <ChevronDownIcon className="mr-2 h-4 w-4" /> {label}
            </>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <span className="mt-2 text-center font-medium text-muted-foreground">{header}</span>
        <div className="mt-4 border-t">
          <ItemList setOpen={setOpen} setSelectedItem={setSelected} {...props} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

/* -------------------------------------------------------------------------- */
/*                                    LIST                                    */
/* -------------------------------------------------------------------------- */

type ItemListProps = {
  items: ComboboxOption[];
  label: string;
  setOpen: (open: boolean) => void;
  setSelectedItem: (item: ComboboxOption) => void;
};

const ItemList: FC<ItemListProps> = ({ items, label, setOpen, setSelectedItem }) => {
  return (
    <Command>
      <CommandInput placeholder={`Filter ${label.toLowerCase()}s...`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {items.map((item) => (
            <CommandItem
              key={item.value}
              value={item.value.toString()}
              disabled={item.disabled}
              onSelect={(value) => {
                setSelectedItem(
                  items.find(
                    (priority) => priority.value.toString().toLowerCase() === value.toLowerCase(),
                  ) || items[0],
                );
                setOpen(false);
              }}
            >
              <div className="flex items-center">
                {item.icon ? (
                  <item.icon
                    className="mr-2 h-4 w-4"
                    style={{ stroke: item.iconColor || 'currentColor' }}
                  />
                ) : null}
                {item.label}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default ComboBoxResponsive;
