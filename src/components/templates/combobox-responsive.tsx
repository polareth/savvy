'use client';

import { FC, useState } from 'react';

import { ComboboxOption } from '@/lib/types/templates';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Icons } from '@/components/common/icons';

/* -------------------------------------------------------------------------- */
/*                                  COMBOBOX                                  */
/* -------------------------------------------------------------------------- */

type ComboBoxResponsiveProps = {
  items: ComboboxOption[];
  label: string;
  selected: ComboboxOption;
  setSelected: (item: ComboboxOption) => void;
  header?: string;
  disabled?: boolean;
  className?: string;
  footer?: ComboboxOption;
};

/**
 * @notice A responsive combobox that will display a popover on desktop and a drawer on mobile
 * @param items The list of items to display
 * @param label The label to display on the button
 * @param selected The currently selected item
 * @param setSelected The function triggered when an item is selected
 * @param header The header to display in the drawer (default: 'Select a {label}')
 * @param disabled Whether the whole combobox is disabled (default: false)
 * @param className Additional classses to apply to the button
 * @param footer Additional content to display at the bottom of the drawer as a last button
 * @dev Modified from shadcn/ui
 * @see https://ui.shadcn.com/docs/components/combobox
 */
const ComboBoxResponsive: FC<ComboBoxResponsiveProps> = (props) => {
  const { label, className, selected, setSelected, header, disabled } = props;
  const [open, setOpen] = useState<boolean>(false);

  const isDesktop = useMediaQuery('(min-width: 768px)'); // md

  /* --------------------------------- DESKTOP -------------------------------- */
  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            className={cn(
              'flex w-[250px] items-center justify-start',
              className,
            )}
          >
            {selected ? (
              <>
                {selected.icon ? (
                  <selected.icon
                    className="mr-2 h-4 w-4"
                    style={{ stroke: selected.iconColor || '' }}
                  />
                ) : null}
                {selected.label}
              </>
            ) : (
              <>
                <Icons.down className="mr-2 h-4 w-4" /> {label}
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <ItemList
            setOpen={setOpen}
            setSelectedItem={setSelected}
            {...props}
          />
        </PopoverContent>
      </Popover>
    );
  }

  /* --------------------------------- MOBILE --------------------------------- */
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className={cn('flex w-[250px] items-center justify-start', className)}
        >
          {selected ? (
            <>
              {selected.icon ? (
                <selected.icon
                  className="h-4 w-4"
                  style={{ stroke: selected.iconColor || '' }}
                />
              ) : null}
              <span className={cn(selected.icon && 'ml-2')}>
                {selected.label}
              </span>
            </>
          ) : (
            <>
              <Icons.down className="mr-2 h-4 w-4" /> {label}
            </>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <span className="mt-2 text-center font-medium text-muted-foreground">
          {header}
        </span>
        <div className="mt-4 border-t">
          <ItemList
            setOpen={setOpen}
            setSelectedItem={setSelected}
            {...props}
          />
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
  footer?: ComboboxOption;
};

const ItemList: FC<ItemListProps> = ({
  items: _items,
  label,
  setOpen,
  setSelectedItem,
  footer,
}) => {
  const items = _items.concat(footer || []);

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
              onSelect={(value) => {
                setSelectedItem(
                  items.find(
                    (priority) =>
                      priority.value.toString().toLowerCase() ===
                      value.toLowerCase(),
                  ) || items[0],
                );
                setOpen(false);
                item.onClick?.();
              }}
            >
              <div className="flex items-center">
                {item.alwaysIcon && item.icon ? (
                  <item.icon className="mr-2 h-4 w-4" />
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
