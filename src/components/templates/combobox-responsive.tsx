'use client';

import { FC, useState } from 'react';

import { ChevronDownIcon } from 'lucide-react';

import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { ComboboxOption } from '@/lib/types/templates';

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
  selected: ComboboxOption | null;
  setSelected: (item: ComboboxOption | null) => void;
};

const ComboBoxResponsive: FC<ComboBoxResponsiveProps> = (props) => {
  const { label, selected, setSelected } = props;
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex w-[250px] items-center justify-start">
            {selected ? (
              <>
                {selected.icon ? <selected.icon className="mr-2 h-4 w-4" /> : null}
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
        <Button variant="outline" className="flex w-[150px] items-center justify-start">
          {selected ? (
            <>
              {selected.icon ? <selected.icon className="mr-2 h-4 w-4" /> : null}
              {selected.label}
            </>
          ) : (
            <>
              <ChevronDownIcon className="mr-2 h-4 w-4" /> {label}
            </>
          )}
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
  items: ComboboxOption[];
  label: string;
  setOpen: (open: boolean) => void;
  setSelectedItem: (item: ComboboxOption | null) => void;
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
              value={item.value}
              onSelect={(value) => {
                setSelectedItem(
                  items.find((priority) => priority.value.toLowerCase() === value.toLowerCase()) ||
                    null,
                );
                setOpen(false);
              }}
            >
              <div className="flex items-center">
                {item.icon ? <item.icon className="mr-2 h-4 w-4" /> : null}
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
