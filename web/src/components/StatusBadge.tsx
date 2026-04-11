import { useState, useRef, useEffect } from "react";
import { LEAD_STATUSES, STATUS_LABELS, STATUS_HEX } from "../types";
import type { LeadStatus } from "../types";

interface Props {
  status: LeadStatus;
  onChange: (status: LeadStatus) => void;
}

export default function StatusBadge({ status, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hex = STATUS_HEX[status];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105"
        style={{
          color: hex,
          background: `${hex}18`,
          border: `1px solid ${hex}30`,
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: hex }}
        />
        {STATUS_LABELS[status]}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 glass rounded-xl shadow-2xl py-1.5 min-w-[160px] border border-border">
          {LEAD_STATUSES.map((s) => {
            const sHex = STATUS_HEX[s];
            return (
              <button
                key={s}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors hover:bg-elevated/80 ${
                  s === status ? "text-white font-medium" : "text-soft"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: sHex }}
                />
                {STATUS_LABELS[s]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
