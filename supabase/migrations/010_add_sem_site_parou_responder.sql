-- Atualiza CHECK constraint do pipeline pra incluir TODOS os statuses
-- que o scraper Python e o front usam.
--
-- Novos do front: sem_site, parou_responder (antes de "perdida")
-- Existentes que faltavam declarar: mensagem_1, mensagem_2, mensagem_3,
-- email_enviado, fotos_enviadas, reuniao_agendada, testando, stand_by

ALTER TABLE leads
DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE leads
ADD CONSTRAINT leads_status_check
    CHECK (status IN (
        'novo',
        'dm_enviada',
        'mensagem_1',
        'mensagem_2',
        'mensagem_3',
        'email_enviado',
        'fotos_enviadas',
        'respondeu',
        'lead_coletado',
        'interessado',
        'reuniao_agendada',
        'testando',
        'stand_by',
        'fechou',
        'sem_site',
        'parou_responder',
        'perdida',
        'descartado'
    ));
