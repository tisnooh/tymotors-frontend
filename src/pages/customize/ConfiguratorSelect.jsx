import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

export function ConfiguratorSelect({ value, onValueChange, placeholder, options, disabled = false, testId }) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        data-testid={testId}
        aria-label={placeholder}
        className="group mt-1 flex h-12 w-full items-center justify-between gap-3 rounded-lg border border-transparent bg-transparent px-1 text-left font-mono text-sm text-white outline-none transition-colors hover:text-[#F2C94C] focus-visible:ring-2 focus-visible:ring-[#E10600]/70 disabled:cursor-not-allowed disabled:text-[#6F7784] data-[state=open]:text-[#F2C94C]"
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#2E394D] bg-[#151A23] text-[#B9C2CF] transition-all group-data-[state=open]:rotate-180 group-data-[state=open]:border-[#E10600]/70 group-data-[state=open]:text-white">
            <ChevronDown className="h-4 w-4" />
          </span>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={8}
          collisionPadding={16}
          className="z-[100] max-h-[min(22rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-[#2E394D] bg-[#0A0B0E]/98 text-white shadow-[0_24px_70px_rgba(0,0,0,0.75),0_0_0_1px_rgba(225,6,0,0.08)] backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <SelectPrimitive.ScrollUpButton className="flex h-8 items-center justify-center border-b border-[#232B3A] text-[#8E97A6]">
            <ChevronUp className="h-4 w-4" />
          </SelectPrimitive.ScrollUpButton>

          <SelectPrimitive.Viewport className="p-2">
            <div className="px-3 pb-2 pt-1 font-mono text-[9px] uppercase tracking-[0.28em] text-[#F2C94C]/70">
              Sélectionnez une option
            </div>
            {options.length === 0 ? (
              <div className="px-3 py-3 font-mono text-xs text-[#8E97A6]">Chargement des options…</div>
            ) : (
              options.map((option, index) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="group/item relative flex h-11 cursor-pointer select-none items-center gap-3 rounded-lg px-3 pr-10 font-mono text-sm text-[#C7CDD6] outline-none transition-colors data-[highlighted]:bg-[#E10600]/15 data-[highlighted]:text-white data-[state=checked]:bg-[#151A23] data-[state=checked]:text-white"
                >
                  <span className="w-6 text-[9px] tracking-[0.16em] text-[#596273] group-data-[state=checked]/item:text-[#F2C94C]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#E10600] text-white">
                    <Check className="h-3.5 w-3.5" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))
            )}
          </SelectPrimitive.Viewport>

          <SelectPrimitive.ScrollDownButton className="flex h-8 items-center justify-center border-t border-[#232B3A] text-[#8E97A6]">
            <ChevronDown className="h-4 w-4" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
