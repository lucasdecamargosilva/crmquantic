import { useState, useRef, useEffect } from "react";
import { LEAD_STATUSES, STATUS_LABELS, STATUS_COLORS } from "../types";
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`${STATUS_COLORS[status]} text-white text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity`}
      >
        {STATUS_LABELS[status]}
      </button>
      {open && (
        <div className="absolute z-10 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 min-w-[140px]">
          {LEAD_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 transition-colors ${
                s === status ? "text-white font-medium" : "text-gray-300"
              }`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${STATUS_COLORS[s]}`} />
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
