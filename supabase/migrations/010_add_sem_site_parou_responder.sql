-- Adiciona status "sem_site" e "parou_responder" no pipeline
-- Ambos ficam ANTES de "perdida" (lead engajou mas teve um motivo específico
-- pra não fechar) — separados pra dar mais insight de motivo de queda.

ALTER TABLE leads
DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE leads
ADD CONSTRAINT leads_status_check
    CHECK (status IN (
        'novo',
        'dm_enviada',
        'respondeu',
        'lead_coletado',
        'interessado',
        'fechou',
        'sem_site',
        'parou_responder',
        'perdida',
        'descartado'
    ));
