import { STATUS_LABELS, STATUS_HEX } from "../types";
import type { LeadStatus } from "../types";

const FUNNEL_STEPS: LeadStatus[] = [
  "novo",
  "dm_enviada",
  "respondeu",
  "interessado",
  "fechou",
];

interface Props {
  counts: Record<LeadStatus, number>;
}

export default function FunnelChart({ counts }: Props) {
  const maxCount = Math.max(...FUNNEL_STEPS.map((s) => counts[s] || 0), 1);

  return (
    <div className="space-y-3">
      {FUNNEL_STEPS.map((step) => {
        const count = counts[step] || 0;
        const width = Math.max((count / maxCount) * 100, 6);
        const hex = STATUS_HEX[step];

        return (
          <div key={step} className="flex items-center gap-4">
            <span className="font-display text-xs font-semibold text-muted w-28 text-right">
              {STATUS_LABELS[step]}
            </span>
            <div className="flex-1 h-9 bg-abyss rounded-xl overflow-hidden">
              <div
                className="h-full rounded-xl flex items-center px-4 transition-all duration-700 ease-out"
                style={{
                  width: `${width}%`,
                  background: `linear-gradient(90deg, ${hex}90, ${hex})`,
                  boxShadow: count > 0 ? `0 0 20px -5px ${hex}60` : "none",
                }}
              >
                <span className="text-xs font-bold text-white drop-shadow-sm">{count}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
