INSERT INTO public.courses (id, title, description, metadata)
VALUES (
  '10000000-0000-4000-8000-000000000001',
  'Cybersecurity per sviluppatori',
  'Fondamenti di sicurezza applicativa attraverso scenari concreti di un gestionale SaaS multi-tenant.',
  '{"slug":"cybersecurity-per-sviluppatori"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.chapters (id, course_id, title, position, content)
VALUES (
  '10000000-0000-4000-8000-000000000101',
  '10000000-0000-4000-8000-000000000001',
  '1.1 — Che cosa dobbiamo proteggere, e perché?',
  1,
  '{"lesson":"cybersecurity-1-1"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;