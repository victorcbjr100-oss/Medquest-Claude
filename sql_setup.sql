-- ================================================
-- MedQuest Pro — SQL Setup Completo
-- Execute no Supabase > SQL Editor
-- ================================================

-- 1. QUESTÕES
create table if not exists questoes (
  id bigint generated always as identity primary key,
  pergunta text not null,
  opcoes jsonb not null,
  resposta int not null,
  comentario text,
  tema text not null,
  subtema text,
  dificuldade text default 'media' check (dificuldade in ('facil','media','dificil')),
  ano int,
  banca text,
  created_at timestamptz default now()
);

-- 2. RESPOSTAS
create table if not exists respostas (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  questao_id bigint references questoes(id) on delete cascade not null,
  opcao_escolhida int not null,
  acertou boolean not null,
  modo text default 'normal' check (modo in ('normal','simulado')),
  respondido_em timestamptz default now()
);

-- 3. FAVORITOS
create table if not exists favoritos (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  questao_id bigint references questoes(id) on delete cascade not null,
  criado_em timestamptz default now(),
  unique(user_id, questao_id)
);

-- 4. COMENTÁRIOS
create table if not exists comentarios (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  questao_id bigint references questoes(id) on delete cascade not null,
  texto text not null,
  criado_em timestamptz default now()
);

-- 5. PERFIS
create table if not exists perfis (
  id uuid references auth.users(id) on delete cascade primary key,
  nome text,
  role text default 'user' check (role in ('user','admin')),
  idade int,
  nivel text,
  universidade text,
  ano_formatura int,
  criado_em timestamptz default now()
);

-- 6. ANOTAÇÕES (caderno)
create table if not exists anotacoes (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  titulo text,
  texto text not null,
  criado_em timestamptz default now()
);

-- Trigger: cria perfil ao cadastrar usuário
create or replace function criar_perfil()
returns trigger as $$
begin
  insert into perfis (id, nome)
  values (new.id, new.raw_user_meta_data->>'nome')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure criar_perfil();

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

alter table questoes enable row level security;
alter table respostas enable row level security;
alter table favoritos enable row level security;
alter table comentarios enable row level security;
alter table perfis enable row level security;
alter table anotacoes enable row level security;

-- Questões: leitura pública, escrita só admin
create policy "questoes_select" on questoes for select using (true);
create policy "questoes_insert_admin" on questoes for insert with check ((select role from perfis where id = auth.uid()) = 'admin');
create policy "questoes_update_admin" on questoes for update using ((select role from perfis where id = auth.uid()) = 'admin');
create policy "questoes_delete_admin" on questoes for delete using ((select role from perfis where id = auth.uid()) = 'admin');

-- Respostas
create policy "respostas_select" on respostas for select using (auth.uid() = user_id);
create policy "respostas_insert" on respostas for insert with check (auth.uid() = user_id);

-- Favoritos
create policy "favoritos_select" on favoritos for select using (auth.uid() = user_id);
create policy "favoritos_insert" on favoritos for insert with check (auth.uid() = user_id);
create policy "favoritos_delete" on favoritos for delete using (auth.uid() = user_id);

-- Comentários
create policy "comentarios_select" on comentarios for select using (true);
create policy "comentarios_insert" on comentarios for insert with check (auth.uid() = user_id);
create policy "comentarios_delete" on comentarios for delete using (auth.uid() = user_id);

-- Perfis
create policy "perfis_select" on perfis for select using (auth.uid() = id);
create policy "perfis_update" on perfis for update using (auth.uid() = id);
create policy "perfis_upsert" on perfis for insert with check (auth.uid() = id);

-- Anotações
create policy "anotacoes_select" on anotacoes for select using (auth.uid() = user_id);
create policy "anotacoes_insert" on anotacoes for insert with check (auth.uid() = user_id);
create policy "anotacoes_delete" on anotacoes for delete using (auth.uid() = user_id);

-- ================================================
-- Para promover alguém a admin:
-- update perfis set role = 'admin' where id = '<uuid>';
-- O UUID está em: Supabase > Authentication > Users
-- ================================================
