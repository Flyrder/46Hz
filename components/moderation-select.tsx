"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Check, ChevronDown } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";

export type ModerationOptionTone = "neutral" | "good" | "warning" | "danger";

export interface ModerationOption {
  value: string;
  label: string;
  tone?: ModerationOptionTone;
  badgeText?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ModerationSelectProps {
  id?: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: ModerationOption[];
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export function ModerationSelect({
  id,
  name,
  defaultValue,
  value,
  onChange,
  options,
  ariaLabel,
  disabled = false,
  className,
  required = false
}: ModerationSelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const listboxId = `${selectId}-listbox`;

  const initialValue = value !== undefined ? value : (defaultValue ?? options[0]?.value ?? "");
  const [current, setCurrent] = useState<string>(initialValue);
  const [menuOpen, setMenuOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionsContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize controlled value prop if provided
  useEffect(() => {
    if (value !== undefined) {
      setCurrent(value);
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync highlighted item with current selection when menu opens
  useEffect(() => {
    if (menuOpen) {
      const idx = options.findIndex((opt) => opt.value === current);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [menuOpen, current, options]);

  function handleSelect(nextVal: string) {
    setCurrent(nextVal);
    setMenuOpen(false);
    onChange?.(nextVal);
    triggerRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!menuOpen) {
        setMenuOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev + 1) % options.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!menuOpen) {
        setMenuOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
      }
    } else if (e.key === "Escape") {
      if (menuOpen) {
        e.preventDefault();
        setMenuOpen(false);
      }
    } else if (e.key === "Enter" || e.key === " ") {
      if (menuOpen && highlightedIndex >= 0 && highlightedIndex < options.length) {
        e.preventDefault();
        handleSelect(options[highlightedIndex].value);
      }
    } else if (e.key === "Tab") {
      if (menuOpen) {
        setMenuOpen(false);
      }
    }
  }

  const selectedOption = options.find((opt) => opt.value === current);
  const SelectedIcon = selectedOption?.icon;

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      {/* Native hidden input for 100% Server Action form submission compatibility */}
      <input
        type="hidden"
        name={name}
        value={current}
        required={required}
      />

      {/* Tactile trigger button adhering to KWCAG 2.2 min 44px touch target */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={menuOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setMenuOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full min-h-[44px] flex items-center justify-between px-3.5 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground transition-all select-none shadow-2xs hover:bg-muted/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent",
          disabled && "opacity-50 cursor-not-allowed",
          menuOpen && "border-accent ring-2 ring-accent/20"
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {SelectedIcon && <SelectedIcon className="h-4 w-4 text-muted-foreground shrink-0" />}
          {selectedOption?.tone ? (
            <StatusBadge tone={selectedOption.tone}>
              {selectedOption.badgeText ?? selectedOption.label}
            </StatusBadge>
          ) : null}
          {(!selectedOption?.tone || selectedOption?.badgeText) && (
            <span className="truncate font-semibold text-foreground">
              {selectedOption?.label ?? current}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2",
            menuOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {/* Floating tactile listbox */}
      {menuOpen && (
        <div
          id={listboxId}
          ref={optionsContainerRef}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 mt-1.5 w-full rounded-2xl border border-border/80 bg-surface p-1.5 shadow-tactile z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-64 overflow-y-auto"
        >
          {options.map((option, index) => {
            const isSelected = option.value === current;
            const isHighlighted = index === highlightedIndex;
            const OptionIcon = option.icon;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "w-full flex items-center justify-between min-h-[44px] px-3 py-2 rounded-xl text-left text-xs transition-colors",
                  isHighlighted
                    ? "bg-muted/70 text-foreground"
                    : "text-foreground hover:bg-muted/50",
                  isSelected && "font-semibold"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {OptionIcon && <OptionIcon className="h-4 w-4 text-muted-foreground shrink-0" />}
                  {option.tone ? (
                    <StatusBadge tone={option.tone}>
                      {option.badgeText ?? option.label}
                    </StatusBadge>
                  ) : null}
                  {option.badgeText && (
                    <span className="truncate text-foreground">{option.label}</span>
                  )}
                  {!option.tone && !option.badgeText && (
                    <span className={cn("truncate", isSelected ? "text-foreground font-semibold" : "text-foreground")}>
                      {option.label}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-accent shrink-0 ml-2" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
