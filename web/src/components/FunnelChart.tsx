import { STATUS_LABELS, STATUS_COLORS } from "../types";
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
    <div className="space-y-2">
      {FUNNEL_STEPS.map((step) => {
        const count = counts[step] || 0;
        const width = Math.max((count / maxCount) * 100, 4);
        return (
          <div key={step} className="flex items-center gap-3">
            <span className="text-sm text-gray-400 w-28 text-right">
              {STATUS_LABELS[step]}
            </span>
            <div className="flex-1 h-8 bg-gray-900 rounded-lg overflow-hidden">
              <div
                className={`h-full ${STATUS_COLORS[step]} rounded-lg flex items-center px-3 transition-all duration-500`}
                style={{ width: `${width}%` }}
              >
                <span className="text-xs font-bold text-white">{count}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
