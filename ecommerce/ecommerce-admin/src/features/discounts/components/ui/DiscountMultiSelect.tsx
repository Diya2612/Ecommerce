import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (val: string[]) => void;
  placeholder: string;
}

export const DiscountMultiSelect = ({
  options,
  selected,
  onChange,
  placeholder,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);

  const toggleSelection = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((i) => i !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-12 py-2 text-left font-normal hover:bg-transparent max-w-full overflow-hidden"
        >
          <div className="flex-1 min-w-0 overflow-hidden">
            {selected.length === 0 ? (
              <span className="text-muted-foreground truncate block w-full">
                {placeholder}
              </span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selected.map((val) => (
                  <span
                    key={val}
                    className="bg-slate-100 border px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 max-w-full"
                  >
                    <span className="truncate max-w-[150px]">
                      {options.find((o) => o.value === val)?.label || val}
                    </span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(val);
                      }}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => toggleSelection(option.value)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selected.includes(option.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className={cn("h-4 w-4")} />
                  </div>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
