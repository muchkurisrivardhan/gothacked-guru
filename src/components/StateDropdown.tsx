import { useEffect, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

export default function StateDropdown({ value, onChange, options }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: "center" });
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between gap-2.5 min-w-[200px] text-xs font-mono border rounded-full px-3.5 py-2 text-gray-200 bg-ink/40 outline-none transition-colors ${
          open ? "border-signal" : "border-line"
        }`}
      >
        <span>{selected?.label ?? options[0]?.label}</span>
        <span
          className="text-ghost text-[11px] transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute top-[calc(100%+6px)] left-0 w-60 max-h-[300px] overflow-y-auto overflow-x-hidden bg-panel border border-line rounded-2xl p-1.5 z-[60] shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(61,220,132,0.08)]"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                data-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer text-[13px] font-mono transition-colors ${
                  isSelected ? "bg-signal/10 text-signal" : "text-ghost hover:bg-signal/10 hover:text-gray-200"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <span className="text-signal font-mono">✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
