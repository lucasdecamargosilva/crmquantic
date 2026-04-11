import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { LEAD_STATUSES, STATUS_LABELS, STATUS_HEX } from "../types";
import type { Lead, LeadStatus } from "../types";
import FunnelChart from "../components/FunnelChart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    const { data } = await supabase.from("leads").select("*");
    setLeads(data ?? []);
    setLoading(false);
  }

  const counts = LEAD_STATUSES.reduce(
    (acc, s) => {
      acc[s] = leads.filter((l) => l.status === s).length;
      return acc;
    },
    {} as Record<LeadStatus, number>
  );

  const dmEnviadas = counts["dm_enviada"] + counts["respondeu"] + counts["interessado"] + counts["fechou"];
  const responderam = counts["respondeu"] + counts["interessado"] + counts["fechou"];
  const taxaResposta = dmEnviadas > 0 ? ((responderam / dmEnviadas) * 100).toFixed(1) : "0";

  const weeklyData = leads.reduce(
    (acc, lead) => {
      const date = new Date(lead.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const key = weekStart.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const chartData = Object.entries(weeklyData)
    .map(([semana, total]) => ({ semana, total }))
    .slice(-8);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted text-sm mt-1">Visao geral da prospeccao</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="glass rounded-2xl p-5 glow-sm">
          <p className="text-muted text-xs font-display font-semibold uppercase tracking-wider">Total de Leads</p>
          <p className="font-display text-4xl font-bold mt-2 bg-gradient-to-r from-accent-bright to-fuchsia-400 bg-clip-text text-transparent">
            {leads.length}
          </p>
        </div>
        <div className="glass rounded-2xl p-5 glow-sm">
          <p className="text-muted text-xs font-display font-semibold uppercase tracking-wider">DMs Enviadas</p>
          <p className="font-display text-4xl font-bold mt-2 bg-gradient-to-r from-purple-300 to-violet-400 bg-clip-text text-transparent">
            {dmEnviadas}
          </p>
        </div>
        <div className="glass rounded-2xl p-5 glow-sm">
          <p className="text-muted text-xs font-display font-semibold uppercase tracking-wider">Taxa de Resposta</p>
          <p className="font-display text-4xl font-bold mt-2 bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
            {taxaResposta}%
          </p>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-6 gap-3 mb-8">
        {LEAD_STATUSES.map((s) => {
          const hex = STATUS_HEX[s];
          return (
            <div key={s} className="glass rounded-xl p-4 text-center group hover:glow-sm transition-all">
              <div
                className="w-3 h-3 rounded-full mx-auto mb-2 status-dot"
                style={{ background: hex }}
              />
              <p className="text-[11px] text-muted font-display">{STATUS_LABELS[s]}</p>
              <p className="font-display text-xl font-bold mt-0.5" style={{ color: hex }}>
                {counts[s]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Funnel */}
      <div className="glass rounded-2xl p-6 mb-6 glow-sm">
        <h3 className="font-display text-xs font-semibold text-muted uppercase tracking-wider mb-5">Funil de Conversao</h3>
        <FunnelChart counts={counts} />
      </div>

      {/* Weekly chart */}
      {chartData.length > 0 && (
        <div className="glass rounded-2xl p-6 glow-sm">
          <h3 className="font-display text-xs font-semibold text-muted uppercase tracking-wider mb-5">Leads por Semana</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="semana"
                tick={{ fill: "#7c6f9b", fontSize: 11, fontFamily: "Outfit" }}
                axisLine={{ stroke: "#2a1f4e" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#7c6f9b", fontSize: 11, fontFamily: "Outfit" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#140e2a",
                  border: "1px solid #2a1f4e",
                  borderRadius: "12px",
                  boxShadow: "0 0 30px -5px rgba(139,92,246,0.2)",
                  fontFamily: "Outfit",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#a99cc8" }}
                itemStyle={{ color: "#c084fc" }}
              />
              <Bar
                dataKey="total"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
