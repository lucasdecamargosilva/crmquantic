import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { LEAD_STATUSES, STATUS_LABELS, STATUS_COLORS } from "../types";
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

  if (loading) return <p className="text-gray-500">Carregando...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total de Leads</p>
          <p className="text-3xl font-bold mt-1">{leads.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm">DMs Enviadas</p>
          <p className="text-3xl font-bold mt-1">{dmEnviadas}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Taxa de Resposta</p>
          <p className="text-3xl font-bold mt-1">{taxaResposta}%</p>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3 mb-8">
        {LEAD_STATUSES.map((s) => (
          <div key={s} className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
            <div className={`inline-block w-3 h-3 rounded-full ${STATUS_COLORS[s]} mb-1`} />
            <p className="text-xs text-gray-400">{STATUS_LABELS[s]}</p>
            <p className="text-xl font-bold">{counts[s]}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Funil de Conversao</h3>
        <FunnelChart counts={counts} />
      </div>

      {chartData.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Leads por Semana</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="semana" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
