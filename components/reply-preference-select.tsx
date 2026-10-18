"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, HeartHandshake, Loader2 } from "lucide-react";
import { updateReplyPreferenceAction } from "@/app/actions/reply-preference";

type Option = {
  value: string;
  label: string;
};

export function ReplyPreferenceSelect({
  value,
  options,
  label
}: {
  value: string;
  options: Option[];
  label: string;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(value);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrent(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(next: string) {
    if (next === current) {
      setMenuOpen(false);
      return;
    }

    const previous = current;
    setCurrent(next);
    setMenuOpen(false);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("preferredReplyType", next);
        await updateReplyPreferenceAction(formData);
        router.refresh();
      } catch {
        setCurrent(previous);
      }
    });
  }

  const selectedOption = options.find((opt) => opt.value === current);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label={label}
        aria-expanded={menuOpen}
        aria-haspopup="listbox"
        disabled={isPending}
        className="flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-full border border-border/80 bg-surface/90 text-xs font-medium hover:bg-muted/60 active:scale-95 transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 shadow-2xs disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
        ) : (
          <HeartHandshake className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="font-semibold text-foreground">
          {selectedOption?.label ?? current}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-150 ${
            menuOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {menuOpen && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute right-0 mt-1.5 w-48 sm:w-56 rounded-2xl border border-border/80 bg-surface p-1.5 shadow-tactile z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {options.map((option) => {
            const isSelected = current === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className="w-full flex items-center justify-between min-h-[44px] px-3 py-2 rounded-xl text-left text-xs font-medium hover:bg-muted/60 transition-colors text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              >
                <span className={isSelected ? "font-semibold text-foreground" : "text-foreground"}>
                  {option.label}
                </span>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
