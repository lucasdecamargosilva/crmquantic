# Instagram Prospector — Lojas de Oculos

**Data:** 2026-04-11
**Objetivo:** Prospectar lojas de oculos no Instagram que nao possuem provador virtual, para oferecer o Provou Levou via DM.

---

## Visao Geral

Sistema semi-automatico de prospeccao composto por:

1. **Scraper Python** — coleta perfis de lojas de oculos no Instagram, verifica se o site ja tem provador virtual, e exporta os leads qualificados para o Supabase.
2. **CRM Web (React + Vite + Supabase)** — gerencia os leads, registra interacoes e exibe metricas no dashboard.

Fluxo: Scraper coleta → Voce aprova → Envia DM manualmente → Registra no CRM

---

## Mensagem de Abordagem (DM)

Estrutura da mensagem:
- Abertura: "Percebi que voces nao tem provador de oculos ainda"
- Breve explicacao do provador virtual Provou Levou
- Resultado: aumento de conversao em ate 13%
- Prova social: cacifebrand.com.br e califabrand.com.br como clientes

---

## Estrutura do Projeto (Monorepo)

```
Marketing Social/
├── scraper/
│   ├── instagram.py         # Coleta perfis por hashtag/seguidores
│   ├── verificador.py       # Verifica se site tem provador
│   ├── exportar.py          # Envia leads pro Supabase
│   └── requirements.txt
├── web/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Leads.tsx          # Lista de leads com filtros
│   │   │   ├── LeadDetalhe.tsx    # Ficha do lead + timeline
│   │   │   └── Dashboard.tsx      # Metricas e funil
│   │   ├── components/
│   │   ├── lib/
│   │   │   └── supabase.ts        # Client Supabase
│   │   └── App.tsx
│   └── package.json
└── docs/
```

---

## Banco de Dados (Supabase)

### Tabela `leads`

| Coluna       | Tipo      | Descricao                                                                 |
|--------------|-----------|---------------------------------------------------------------------------|
| id           | uuid      | PK, default gen_random_uuid()                                            |
| instagram    | text      | @perfil (unique)                                                         |
| nome_loja    | text      | Nome da loja                                                             |
| site         | text      | URL do site (da bio do Instagram)                                        |
| seguidores   | integer   | Numero de seguidores                                                     |
| tem_provador | boolean   | Se ja possui provador virtual no site                                    |
| status       | text      | novo, dm_enviada, respondeu, interessado, fechou, descartado             |
| notas        | text      | Anotacoes gerais                                                         |
| created_at   | timestamp | Data de coleta, default now()                                            |
| updated_at   | timestamp | Ultima atualizacao, default now()                                        |

### Tabela `interacoes`

| Coluna     | Tipo      | Descricao                                             |
|------------|-----------|-------------------------------------------------------|
| id         | uuid      | PK, default gen_random_uuid()                         |
| lead_id    | uuid      | FK → leads.id (ON DELETE CASCADE)                     |
| tipo       | text      | dm_enviada, resposta, follow_up, nota                 |
| conteudo   | text      | Texto da interacao                                    |
| created_at | timestamp | Data da interacao, default now()                      |

### Fluxo de Status

```
novo → dm_enviada → respondeu → interessado → fechou
                  ↘ descartado (a qualquer momento)
```

---

## Scraper Python

### instagram.py — Coleta de Perfis

- Busca por hashtags: #oculosdegrau, #oticaonline, #oculosdesol, #eyewear, #oculospersonalizados
- Busca por seguidores de concorrentes/lojas grandes do nicho
- Extrai: @perfil, nome, site (da bio), numero de seguidores
- Usa Instaloader (nao precisa de API oficial)
- Salva lista bruta em JSON local (`data/leads_brutos.json`)

### verificador.py — Verificacao de Provador

- Acessa o site de cada lead coletado
- Busca por keywords no HTML: "provador virtual", "try on", "experimentar", "virtual fitting"
- Marca tem_provador = true/false
- Filtra: so mantem os que NAO tem provador
- Salva resultado em `data/leads_filtrados.json`

### exportar.py — Exportacao para Supabase

- Le o JSON filtrado
- Insere na tabela leads com status "novo"
- Evita duplicatas checando pelo campo instagram (unique)

### Uso

```bash
python instagram.py --hashtag oticaonline --limit 50
python verificador.py
python exportar.py
```

Volume recomendado: 10-20 lojas por dia.

---

## CRM Web (React + Vite + Supabase)

### Tela 1 — Lista de Leads

- Tabela com colunas: nome, @instagram, site, seguidores, status, data
- Filtros por status (novo, dm_enviada, respondeu, interessado, fechou, descartado)
- Busca por nome ou @instagram
- Acao rapida: clicar no status para mudar via dropdown inline
- Clicar no lead abre a ficha de detalhe

### Tela 2 — Detalhe do Lead

- Dados do lead: nome, @instagram, site, seguidores
- Botao para abrir perfil do Instagram
- Alterar status via dropdown
- Area de notas editavel
- Timeline de interacoes em ordem cronologica
- Botao "Adicionar interacao": selecionar tipo (dm_enviada, resposta, follow_up, nota) + campo de texto

### Tela 3 — Dashboard

- Cards no topo: total de leads por status
- Funil visual: novo → dm_enviada → respondeu → interessado → fechou
- Taxa de resposta: respondeu / dm_enviada (percentual)
- Leads adicionados por semana (grafico de barras simples)

### Visual

- Tema escuro, limpo, funcional
- Sem autenticacao (CRM interno de uso pessoal)
- Responsivo mas otimizado para desktop

---

## Stack Tecnica

| Componente | Tecnologia |
|------------|------------|
| Frontend   | React + Vite + TypeScript |
| Estilo     | Tailwind CSS |
| Banco      | Supabase (PostgreSQL) |
| Graficos   | Recharts |
| Scraper    | Python + Instaloader + requests + BeautifulSoup |
| Roteamento | React Router |

---

## Fora de Escopo (por enquanto)

- Autenticacao/login
- Envio automatico de DMs (risco de ban)
- Template de mensagem editavel no CRM
- Verificacao automatica recorrente
- Integracao com WhatsApp
