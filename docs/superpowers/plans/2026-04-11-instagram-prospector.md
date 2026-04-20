# Instagram Prospector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a semi-automatic Instagram prospecting system for eyewear stores, with a Python scraper and a React CRM dashboard backed by Supabase.

**Architecture:** Python scripts collect Instagram profiles of eyewear stores, verify their websites for existing virtual try-on features, and export qualified leads to Supabase. A React + Vite frontend provides a CRM with lead management, interaction tracking, and a metrics dashboard. The two systems share only the Supabase database.

**Tech Stack:** Python (Instaloader, requests, BeautifulSoup, supabase-py) | React + Vite + TypeScript + Tailwind CSS + Recharts + React Router | Supabase (PostgreSQL)

---

## File Structure

```
Marketing Social/
├── scraper/
│   ├── instagram.py           # Collect Instagram profiles by hashtag
│   ├── verificador.py         # Check if store website has virtual try-on
│   ├── exportar.py            # Push qualified leads to Supabase
│   ├── config.py              # Supabase URL/key, hashtag list, keywords
│   ├── requirements.txt       # Python dependencies
│   └── data/                  # Local JSON output (gitignored)
│       ├── leads_brutos.json
│       └── leads_filtrados.json
├── web/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env                   # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│   └── src/
│       ├── main.tsx
│       ├── App.tsx             # Router setup
│       ├── lib/
│       │   └── supabase.ts    # Supabase client init
│       ├── types/
│       │   └── index.ts       # Lead, Interacao types
│       ├── pages/
│       │   ├── Leads.tsx      # Lead list with filters
│       │   ├── LeadDetalhe.tsx# Lead detail + interaction timeline
│       │   └── Dashboard.tsx  # Metrics and funnel
│       └── components/
│           ├── StatusBadge.tsx # Colored status badge + dropdown
│           ├── InteracaoForm.tsx # Add interaction form
│           ├── FunnelChart.tsx # Funnel visualization
│           └── Layout.tsx     # Sidebar + page wrapper
├── .gitignore
└── docs/
```

---

## Task 1: Project Scaffolding + Git Init

**Files:**
- Create: `.gitignore`
- Create: `scraper/requirements.txt`
- Create: `scraper/config.py`
- Create: `scraper/data/.gitkeep`

- [ ] **Step 1: Initialize git repo**

```bash
cd "/Users/lucasdecamargosilva/Downloads/Provou Levou/Marketing Social"
git init
```

- [ ] **Step 2: Create .gitignore**

```gitignore
# Python
__pycache__/
*.pyc
.venv/
scraper/data/*.json

# Node
node_modules/
web/dist/

# Env
.env
web/.env
```

- [ ] **Step 3: Create scraper/requirements.txt**

```
instaloader==4.13
requests==2.31.0
beautifulsoup4==4.12.3
supabase==2.10.0
python-dotenv==1.0.1
```

- [ ] **Step 4: Create scraper/config.py**

```python
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

HASHTAGS = [
    "oculosdegrau",
    "oticaonline",
    "oculosdesol",
    "eyewear",
    "oculospersonalizados",
]

PROVADOR_KEYWORDS = [
    "provador virtual",
    "try on",
    "experimentar",
    "virtual fitting",
    "try-on",
    "prova virtual",
]

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
LEADS_BRUTOS_PATH = os.path.join(DATA_DIR, "leads_brutos.json")
LEADS_FILTRADOS_PATH = os.path.join(DATA_DIR, "leads_filtrados.json")
```

- [ ] **Step 5: Create scraper/data/.gitkeep**

Empty file to keep the data directory in git.

- [ ] **Step 6: Create scraper/.env**

```
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here
```

- [ ] **Step 7: Commit**

```bash
git add .gitignore scraper/requirements.txt scraper/config.py scraper/data/.gitkeep
git commit -m "chore: scaffold project with gitignore and scraper config"
```

---

## Task 2: Supabase Database Setup

**Files:**
- Create: `supabase/migrations/001_create_tables.sql`

- [ ] **Step 1: Create SQL migration file**

```sql
-- Tabela de leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instagram TEXT UNIQUE NOT NULL,
    nome_loja TEXT,
    site TEXT,
    seguidores INTEGER DEFAULT 0,
    tem_provador BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'novo'
        CHECK (status IN ('novo', 'dm_enviada', 'respondeu', 'interessado', 'fechou', 'descartado')),
    notas TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de interacoes
CREATE TABLE interacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL
        CHECK (tipo IN ('dm_enviada', 'resposta', 'follow_up', 'nota')),
    conteudo TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Indices
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_instagram ON leads(instagram);
CREATE INDEX idx_interacoes_lead_id ON interacoes(lead_id);
CREATE INDEX idx_interacoes_created_at ON interacoes(created_at);
```

- [ ] **Step 2: Run migration on Supabase**

Go to the Supabase dashboard → SQL Editor → paste and run the SQL above.

- [ ] **Step 3: Verify tables exist**

In Supabase dashboard → Table Editor, confirm `leads` and `interacoes` tables are created with all columns.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/001_create_tables.sql
git commit -m "feat: add database migration for leads and interacoes tables"
```

---

## Task 3: Scraper — instagram.py (Coleta de Perfis)

**Files:**
- Create: `scraper/instagram.py`

- [ ] **Step 1: Create instagram.py**

```python
import argparse
import json
import os
import instaloader
from config import HASHTAGS, DATA_DIR, LEADS_BRUTOS_PATH


def coletar_por_hashtag(hashtag: str, limit: int) -> list[dict]:
    """Coleta perfis de lojas a partir de posts de uma hashtag."""
    loader = instaloader.Instaloader()
    leads = []
    seen = set()

    print(f"Buscando posts com #{hashtag}...")
    posts = instaloader.Hashtag.from_name(loader.context, hashtag).get_posts()

    count = 0
    for post in posts:
        if count >= limit:
            break

        profile = post.owner_profile
        username = profile.username

        if username in seen:
            continue
        seen.add(username)

        # Filtra: so perfis que parecem ser lojas (tem site na bio)
        site = profile.external_url
        if not site:
            continue

        lead = {
            "instagram": username,
            "nome_loja": profile.full_name,
            "site": site,
            "seguidores": profile.followers,
        }
        leads.append(lead)
        count += 1
        print(f"  [{count}/{limit}] @{username} — {site} ({profile.followers} seguidores)")

    return leads


def main():
    parser = argparse.ArgumentParser(description="Coleta perfis de lojas de oculos no Instagram")
    parser.add_argument("--hashtag", type=str, default=None, help="Hashtag especifica para buscar")
    parser.add_argument("--limit", type=int, default=50, help="Limite de perfis por hashtag")
    args = parser.parse_args()

    hashtags = [args.hashtag] if args.hashtag else HASHTAGS
    all_leads = []
    seen_usernames = set()

    for tag in hashtags:
        leads = coletar_por_hashtag(tag, args.limit)
        for lead in leads:
            if lead["instagram"] not in seen_usernames:
                seen_usernames.add(lead["instagram"])
                all_leads.append(lead)

    os.makedirs(DATA_DIR, exist_ok=True)
    with open(LEADS_BRUTOS_PATH, "w", encoding="utf-8") as f:
        json.dump(all_leads, f, ensure_ascii=False, indent=2)

    print(f"\n{len(all_leads)} leads brutos salvos em {LEADS_BRUTOS_PATH}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Test manually**

```bash
cd scraper
pip install -r requirements.txt
python instagram.py --hashtag oticaonline --limit 5
```

Expected: prints 5 profiles with @username, site, followers. Creates `data/leads_brutos.json`.

- [ ] **Step 3: Verify JSON output**

```bash
cat data/leads_brutos.json
```

Expected: JSON array with objects containing `instagram`, `nome_loja`, `site`, `seguidores`.

- [ ] **Step 4: Commit**

```bash
cd ..
git add scraper/instagram.py
git commit -m "feat: add Instagram profile collector script"
```

---

## Task 4: Scraper — verificador.py (Verificacao de Provador)

**Files:**
- Create: `scraper/verificador.py`

- [ ] **Step 1: Create verificador.py**

```python
import json
import requests
from bs4 import BeautifulSoup
from config import PROVADOR_KEYWORDS, LEADS_BRUTOS_PATH, LEADS_FILTRADOS_PATH


def verificar_site(url: str) -> bool:
    """Verifica se o site ja possui provador virtual."""
    try:
        response = requests.get(url, timeout=10, headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        })
        response.raise_for_status()
        html = response.text.lower()

        # Busca keywords no HTML
        for keyword in PROVADOR_KEYWORDS:
            if keyword.lower() in html:
                return True

        # Busca tambem em scripts src (provador pode ser carregado via JS externo)
        soup = BeautifulSoup(html, "html.parser")
        for script in soup.find_all("script", src=True):
            src = script["src"].lower()
            if "provador" in src or "try-on" in src or "fitting" in src:
                return True

        return False
    except Exception as e:
        print(f"  Erro ao acessar {url}: {e}")
        return False


def main():
    with open(LEADS_BRUTOS_PATH, "r", encoding="utf-8") as f:
        leads = json.load(f)

    print(f"Verificando {len(leads)} leads...")
    resultados = []

    for i, lead in enumerate(leads, 1):
        site = lead["site"]
        tem_provador = verificar_site(site)
        lead["tem_provador"] = tem_provador
        status = "JA TEM" if tem_provador else "NAO TEM"
        print(f"  [{i}/{len(leads)}] @{lead['instagram']} — {status} provador")
        resultados.append(lead)

    # Filtra apenas os que NAO tem provador
    filtrados = [l for l in resultados if not l["tem_provador"]]

    with open(LEADS_FILTRADOS_PATH, "w", encoding="utf-8") as f:
        json.dump(filtrados, f, ensure_ascii=False, indent=2)

    print(f"\n{len(filtrados)} leads qualificados (sem provador) de {len(leads)} total")
    print(f"Salvos em {LEADS_FILTRADOS_PATH}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Test manually**

```bash
cd scraper
python verificador.py
```

Expected: reads `data/leads_brutos.json`, checks each site, prints status, creates `data/leads_filtrados.json` with only leads that do NOT have a virtual try-on.

- [ ] **Step 3: Commit**

```bash
cd ..
git add scraper/verificador.py
git commit -m "feat: add website virtual try-on verifier script"
```

---

## Task 5: Scraper — exportar.py (Export to Supabase)

**Files:**
- Create: `scraper/exportar.py`

- [ ] **Step 1: Create exportar.py**

```python
import json
from supabase import create_client
from config import SUPABASE_URL, SUPABASE_KEY, LEADS_FILTRADOS_PATH


def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Erro: SUPABASE_URL e SUPABASE_KEY devem estar definidos no .env")
        return

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    with open(LEADS_FILTRADOS_PATH, "r", encoding="utf-8") as f:
        leads = json.load(f)

    print(f"Exportando {len(leads)} leads para o Supabase...")
    inseridos = 0
    duplicados = 0

    for lead in leads:
        # Checa se ja existe pelo instagram (unique)
        existing = (
            supabase.table("leads")
            .select("id")
            .eq("instagram", lead["instagram"])
            .execute()
        )

        if existing.data:
            print(f"  @{lead['instagram']} — ja existe, pulando")
            duplicados += 1
            continue

        row = {
            "instagram": lead["instagram"],
            "nome_loja": lead["nome_loja"],
            "site": lead["site"],
            "seguidores": lead["seguidores"],
            "tem_provador": lead.get("tem_provador", False),
            "status": "novo",
        }

        supabase.table("leads").insert(row).execute()
        print(f"  @{lead['instagram']} — inserido")
        inseridos += 1

    print(f"\nResultado: {inseridos} inseridos, {duplicados} duplicados ignorados")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Configure .env with real Supabase credentials**

Edit `scraper/.env` with your real Supabase project URL and anon key.

- [ ] **Step 3: Test manually**

```bash
cd scraper
python exportar.py
```

Expected: inserts leads into Supabase `leads` table, skips duplicates. Verify in Supabase Table Editor.

- [ ] **Step 4: Commit**

```bash
cd ..
git add scraper/exportar.py
git commit -m "feat: add Supabase lead exporter script"
```

---

## Task 6: Web App Scaffolding (React + Vite + Tailwind)

**Files:**
- Create: `web/` (entire Vite scaffold)
- Create: `web/.env`
- Create: `web/src/lib/supabase.ts`
- Create: `web/src/types/index.ts`

- [ ] **Step 1: Scaffold Vite project**

```bash
cd "/Users/lucasdecamargosilva/Downloads/Provou Levou/Marketing Social"
npm create vite@latest web -- --template react-ts
cd web
npm install
npm install @supabase/supabase-js react-router-dom recharts
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Configure Tailwind in vite.config.ts**

Replace `web/vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

- [ ] **Step 3: Add Tailwind import to web/src/index.css**

Replace the entire content of `web/src/index.css` with:

```css
@import "tailwindcss";
```

- [ ] **Step 4: Create web/.env**

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

- [ ] **Step 5: Create web/src/lib/supabase.ts**

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

- [ ] **Step 6: Create web/src/types/index.ts**

```typescript
export interface Lead {
  id: string;
  instagram: string;
  nome_loja: string | null;
  site: string | null;
  seguidores: number;
  tem_provador: boolean;
  status: LeadStatus;
  notas: string;
  created_at: string;
  updated_at: string;
}

export type LeadStatus =
  | "novo"
  | "dm_enviada"
  | "respondeu"
  | "interessado"
  | "fechou"
  | "descartado";

export const LEAD_STATUSES: LeadStatus[] = [
  "novo",
  "dm_enviada",
  "respondeu",
  "interessado",
  "fechou",
  "descartado",
];

export interface Interacao {
  id: string;
  lead_id: string;
  tipo: InteracaoTipo;
  conteudo: string;
  created_at: string;
}

export type InteracaoTipo = "dm_enviada" | "resposta" | "follow_up" | "nota";

export const INTERACAO_TIPOS: InteracaoTipo[] = [
  "dm_enviada",
  "resposta",
  "follow_up",
  "nota",
];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  dm_enviada: "DM Enviada",
  respondeu: "Respondeu",
  interessado: "Interessado",
  fechou: "Fechou",
  descartado: "Descartado",
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  novo: "bg-blue-500",
  dm_enviada: "bg-yellow-500",
  respondeu: "bg-purple-500",
  interessado: "bg-orange-500",
  fechou: "bg-green-500",
  descartado: "bg-gray-500",
};
```

- [ ] **Step 7: Verify dev server starts**

```bash
cd web
npm run dev
```

Expected: Vite dev server starts at http://localhost:5173

- [ ] **Step 8: Commit**

```bash
cd ..
git add web/
git commit -m "feat: scaffold React + Vite + Tailwind + Supabase web app"
```

---

## Task 7: Layout Component

**Files:**
- Create: `web/src/components/Layout.tsx`
- Modify: `web/src/App.tsx`

- [ ] **Step 1: Create web/src/components/Layout.tsx**

```tsx
import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Leads", icon: "👤" },
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
];

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      <aside className="w-56 border-r border-gray-800 p-4 flex flex-col gap-2">
        <h1 className="text-lg font-bold mb-6 px-3">Prospector</h1>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-900"
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Replace web/src/App.tsx**

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Leads from "./pages/Leads";
import LeadDetalhe from "./pages/LeadDetalhe";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Leads />} />
          <Route path="/lead/:id" element={<LeadDetalhe />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 3: Create placeholder pages**

Create `web/src/pages/Leads.tsx`:
```tsx
export default function Leads() {
  return <div>Leads</div>;
}
```

Create `web/src/pages/LeadDetalhe.tsx`:
```tsx
export default function LeadDetalhe() {
  return <div>Lead Detalhe</div>;
}
```

Create `web/src/pages/Dashboard.tsx`:
```tsx
export default function Dashboard() {
  return <div>Dashboard</div>;
}
```

- [ ] **Step 4: Update web/src/main.tsx**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 5: Verify in browser**

```bash
cd web && npm run dev
```

Open http://localhost:5173 — should show dark sidebar with "Leads" and "Dashboard" nav items. Clicking each should switch the right panel content.

- [ ] **Step 6: Commit**

```bash
cd ..
git add web/src/
git commit -m "feat: add layout with sidebar navigation and route setup"
```

---

## Task 8: StatusBadge Component

**Files:**
- Create: `web/src/components/StatusBadge.tsx`

- [ ] **Step 1: Create web/src/components/StatusBadge.tsx**

```tsx
import { useState, useRef, useEffect } from "react";
import { LeadStatus, LEAD_STATUSES, STATUS_LABELS, STATUS_COLORS } from "../types";

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
```

- [ ] **Step 2: Commit**

```bash
git add web/src/components/StatusBadge.tsx
git commit -m "feat: add StatusBadge component with inline dropdown"
```

---

## Task 9: Leads Page (Lista de Leads)

**Files:**
- Modify: `web/src/pages/Leads.tsx`

- [ ] **Step 1: Implement Leads.tsx**

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Lead, LeadStatus, LEAD_STATUSES, STATUS_LABELS } from "../types";
import StatusBadge from "../components/StatusBadge";

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<LeadStatus | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, [filtroStatus]);

  async function fetchLeads() {
    setLoading(true);
    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (filtroStatus !== "todos") {
      query = query.eq("status", filtroStatus);
    }

    const { data } = await query;
    setLeads(data ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: LeadStatus) {
    await supabase.from("leads").update({ status }).eq("id", id);
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
  }

  const filtered = leads.filter((l) => {
    const term = busca.toLowerCase();
    return (
      l.instagram.toLowerCase().includes(term) ||
      (l.nome_loja ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Leads</h2>

      {/* Filtros */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por nome ou @instagram..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:border-gray-500"
        />
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as LeadStatus | "todos")}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
        >
          <option value="todos">Todos os status</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Tabela */}
      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-left">
                <th className="pb-3 pr-4">Loja</th>
                <th className="pb-3 pr-4">Instagram</th>
                <th className="pb-3 pr-4">Site</th>
                <th className="pb-3 pr-4">Seguidores</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => navigate(`/lead/${lead.id}`)}
                  className="border-b border-gray-800/50 hover:bg-gray-900/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 pr-4 font-medium">{lead.nome_loja ?? "—"}</td>
                  <td className="py-3 pr-4 text-gray-400">@{lead.instagram}</td>
                  <td className="py-3 pr-4">
                    <a
                      href={lead.site ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-400 hover:underline"
                    >
                      {lead.site ? new URL(lead.site).hostname : "—"}
                    </a>
                  </td>
                  <td className="py-3 pr-4 text-gray-400">
                    {lead.seguidores.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3 pr-4" onClick={(e) => e.stopPropagation()}>
                    <StatusBadge
                      status={lead.status}
                      onChange={(s) => updateStatus(lead.id, s)}
                    />
                  </td>
                  <td className="py-3 text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-gray-500 text-center py-8">Nenhum lead encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:5173 — should show the Leads table. If you have leads in Supabase, they should appear. If not, the "Nenhum lead encontrado" message should show.

- [ ] **Step 3: Commit**

```bash
git add web/src/pages/Leads.tsx
git commit -m "feat: add Leads page with filters, search, and status update"
```

---

## Task 10: InteracaoForm Component

**Files:**
- Create: `web/src/components/InteracaoForm.tsx`

- [ ] **Step 1: Create web/src/components/InteracaoForm.tsx**

```tsx
import { useState } from "react";
import { InteracaoTipo, INTERACAO_TIPOS } from "../types";
import { supabase } from "../lib/supabase";

const TIPO_LABELS: Record<InteracaoTipo, string> = {
  dm_enviada: "DM Enviada",
  resposta: "Resposta",
  follow_up: "Follow-up",
  nota: "Nota",
};

interface Props {
  leadId: string;
  onSaved: () => void;
}

export default function InteracaoForm({ leadId, onSaved }: Props) {
  const [tipo, setTipo] = useState<InteracaoTipo>("dm_enviada");
  const [conteudo, setConteudo] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!conteudo.trim()) return;

    setSaving(true);
    await supabase.from("interacoes").insert({
      lead_id: leadId,
      tipo,
      conteudo: conteudo.trim(),
    });

    setConteudo("");
    setSaving(false);
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value as InteracaoTipo)}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
      >
        {INTERACAO_TIPOS.map((t) => (
          <option key={t} value={t}>
            {TIPO_LABELS[t]}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        placeholder="Descreva a interacao..."
        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
      />
      <button
        type="submit"
        disabled={saving || !conteudo.trim()}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {saving ? "Salvando..." : "Adicionar"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/components/InteracaoForm.tsx
git commit -m "feat: add InteracaoForm component for adding interactions"
```

---

## Task 11: LeadDetalhe Page

**Files:**
- Modify: `web/src/pages/LeadDetalhe.tsx`

- [ ] **Step 1: Implement LeadDetalhe.tsx**

```tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Lead, Interacao, LeadStatus } from "../types";
import StatusBadge from "../components/StatusBadge";
import InteracaoForm from "../components/InteracaoForm";

const TIPO_ICONS: Record<string, string> = {
  dm_enviada: "📩",
  resposta: "💬",
  follow_up: "🔄",
  nota: "📝",
};

export default function LeadDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [interacoes, setInteracoes] = useState<Interacao[]>([]);
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLead();
      fetchInteracoes();
    }
  }, [id]);

  async function fetchLead() {
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      setLead(data);
      setNotas(data.notas ?? "");
    }
    setLoading(false);
  }

  async function fetchInteracoes() {
    const { data } = await supabase
      .from("interacoes")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false });
    setInteracoes(data ?? []);
  }

  async function updateStatus(status: LeadStatus) {
    await supabase.from("leads").update({ status }).eq("id", id);
    setLead((prev) => (prev ? { ...prev, status } : null));
  }

  async function salvarNotas() {
    await supabase.from("leads").update({ notas }).eq("id", id);
    setLead((prev) => (prev ? { ...prev, notas } : null));
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>;
  if (!lead) return <p className="text-gray-500">Lead nao encontrado.</p>;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <button
        onClick={() => navigate("/")}
        className="text-gray-400 hover:text-white text-sm mb-4 inline-block transition-colors"
      >
        ← Voltar
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{lead.nome_loja ?? lead.instagram}</h2>
          <p className="text-gray-400 mt-1">@{lead.instagram} · {lead.seguidores.toLocaleString("pt-BR")} seguidores</p>
        </div>
        <StatusBadge status={lead.status} onChange={updateStatus} />
      </div>

      {/* Links */}
      <div className="flex gap-3 mb-6">
        <a
          href={`https://instagram.com/${lead.instagram}`}
          target="_blank"
          rel="noreferrer"
          className="bg-gray-800 hover:bg-gray-700 text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Abrir Instagram
        </a>
        {lead.site && (
          <a
            href={lead.site}
            target="_blank"
            rel="noreferrer"
            className="bg-gray-800 hover:bg-gray-700 text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Abrir Site
          </a>
        )}
      </div>

      {/* Notas */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Notas</h3>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          onBlur={salvarNotas}
          placeholder="Adicione notas sobre esse lead..."
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500 resize-none"
        />
      </div>

      {/* Interacoes */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Interacoes</h3>
        <InteracaoForm leadId={lead.id} onSaved={fetchInteracoes} />

        <div className="mt-4 space-y-3">
          {interacoes.map((interacao) => (
            <div
              key={interacao.id}
              className="flex gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-800/50"
            >
              <span className="text-lg">{TIPO_ICONS[interacao.tipo] ?? "📌"}</span>
              <div className="flex-1">
                <p className="text-sm">{interacao.conteudo}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(interacao.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          ))}
          {interacoes.length === 0 && (
            <p className="text-gray-500 text-sm">Nenhuma interacao registrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to a lead detail page — should show lead info, notes textarea, interaction form, and interaction timeline.

- [ ] **Step 3: Commit**

```bash
git add web/src/pages/LeadDetalhe.tsx
git commit -m "feat: add LeadDetalhe page with notes and interaction timeline"
```

---

## Task 12: FunnelChart Component

**Files:**
- Create: `web/src/components/FunnelChart.tsx`

- [ ] **Step 1: Create web/src/components/FunnelChart.tsx**

```tsx
import { STATUS_LABELS, STATUS_COLORS, LeadStatus } from "../types";

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
```

- [ ] **Step 2: Commit**

```bash
git add web/src/components/FunnelChart.tsx
git commit -m "feat: add FunnelChart component for visual funnel"
```

---

## Task 13: Dashboard Page

**Files:**
- Modify: `web/src/pages/Dashboard.tsx`

- [ ] **Step 1: Implement Dashboard.tsx**

```tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Lead, LeadStatus, LEAD_STATUSES, STATUS_LABELS, STATUS_COLORS } from "../types";
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

  // Contagem por status
  const counts = LEAD_STATUSES.reduce(
    (acc, s) => {
      acc[s] = leads.filter((l) => l.status === s).length;
      return acc;
    },
    {} as Record<LeadStatus, number>
  );

  // Taxa de resposta
  const dmEnviadas = counts["dm_enviada"] + counts["respondeu"] + counts["interessado"] + counts["fechou"];
  const responderam = counts["respondeu"] + counts["interessado"] + counts["fechou"];
  const taxaResposta = dmEnviadas > 0 ? ((responderam / dmEnviadas) * 100).toFixed(1) : "0";

  // Leads por semana
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

      {/* Cards */}
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

      {/* Status cards */}
      <div className="grid grid-cols-6 gap-3 mb-8">
        {LEAD_STATUSES.map((s) => (
          <div key={s} className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
            <div className={`inline-block w-3 h-3 rounded-full ${STATUS_COLORS[s]} mb-1`} />
            <p className="text-xs text-gray-400">{STATUS_LABELS[s]}</p>
            <p className="text-xl font-bold">{counts[s]}</p>
          </div>
        ))}
      </div>

      {/* Funil */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Funil de Conversao</h3>
        <FunnelChart counts={counts} />
      </div>

      {/* Grafico semanal */}
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
```

- [ ] **Step 2: Verify in browser**

Navigate to Dashboard — should show cards, funnel, and weekly chart. With no data it shows zeros.

- [ ] **Step 3: Commit**

```bash
git add web/src/pages/Dashboard.tsx
git commit -m "feat: add Dashboard page with metrics, funnel, and weekly chart"
```

---

## Task 14: Final Cleanup and Verification

**Files:**
- Modify: `web/src/App.css` (delete if exists)

- [ ] **Step 1: Remove unused default files**

Delete `web/src/App.css`, `web/src/assets/`, and any other Vite default files not being used.

- [ ] **Step 2: Full end-to-end test**

```bash
cd web && npm run dev
```

Test in browser:
1. Leads page loads and shows leads from Supabase (or empty state)
2. Status badge dropdown works and updates Supabase
3. Search filters leads by name and @instagram
4. Status dropdown filter works
5. Clicking a lead navigates to detail page
6. Detail page shows lead info, notes save on blur
7. Adding an interaction works and appears in timeline
8. Dashboard shows correct counts, funnel, and chart
9. Sidebar navigation works between pages

- [ ] **Step 3: Build check**

```bash
cd web && npm run build
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 4: Test scraper pipeline end-to-end**

```bash
cd scraper
python instagram.py --hashtag oticaonline --limit 5
python verificador.py
python exportar.py
```

Verify leads appear in Supabase and in the CRM web app.

- [ ] **Step 5: Final commit**

```bash
cd ..
git add -A
git commit -m "chore: cleanup unused defaults and verify full pipeline"
```
