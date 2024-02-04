'use client';

import { FC, useState } from 'react';

import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { ComboboxOption, ComboboxOptionCompatible } from '@/lib/types/templates';

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
  items: ComboboxOptionCompatible[];
  name: string;
  selected: ComboboxOptionCompatible | null;
  setSelected: (item: ComboboxOptionCompatible | null) => void;
};

const ComboBoxResponsive: FC<ComboBoxResponsiveProps> = (props) => {
  const { name, selected, setSelected } = props;
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[150px] justify-start">
            {selected ? <>{selected.label}</> : <>+ Select {name}</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <ItemList setOpen={setOpen} setSelectedItem={setSelected} {...props} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start">
          {selected ? <>{selected.label}</> : <>+ Select {name}</>}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
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
  items: ComboboxOptionCompatible[];
  name: string;
  setOpen: (open: boolean) => void;
  setSelectedItem: (item: ComboboxOptionCompatible | null) => void;
};

const ItemList: FC<ItemListProps> = ({ items, name, setOpen, setSelectedItem }) => {
  return (
    <Command>
      <CommandInput placeholder={`Filter ${name}s...`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {items.map((item) => (
            <CommandItem
              key={item.value}
              value={item.value}
              onSelect={(value) => {
                console.log(items, value, item.value);
                setSelectedItem(
                  items.find((priority) => priority.value.toLowerCase() === value.toLowerCase()) ||
                    null,
                );
                setOpen(false);
              }}
            >
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default ComboBoxResponsive;
