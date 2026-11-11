create extension if not exists btree_gist;

create type public.user_role as enum ('admin', 'fotografo', 'cliente');
create type public.booking_status as enum ('pendente', 'confirmado', 'cancelado', 'concluido');
create type public.location_type as enum ('estudio', 'externo');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  telefone text,
  role public.user_role not null default 'cliente',
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  duracao_min integer not null check (duracao_min > 0),
  preco numeric(10, 2) not null check (preco >= 0),
  fotos_entregues integer not null check (fotos_entregues >= 0),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  endereco text not null,
  tipo public.location_type not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.photographers (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  especialidade text,
  portfolio_url text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id),
  photographer_id uuid not null references public.photographers (profile_id),
  service_id uuid not null references public.services (id),
  location_id uuid not null references public.locations (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.booking_status not null default 'pendente',
  observacoes text,
  link_galeria text,
  created_at timestamptz not null default now(),
  constraint bookings_end_after_start check (ends_at > starts_at),
  constraint bookings_photographer_no_overlap exclude using gist (
    photographer_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status <> 'cancelado'),
  constraint bookings_location_no_overlap exclude using gist (
    location_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status <> 'cancelado')
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nome, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nome', ''), split_part(new.email, '@', 1)),
    'cliente'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create function public.current_role_name()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role::text
  from public.profiles
  where id = (select auth.uid())
$$;

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.locations enable row level security;
alter table public.photographers enable row level security;
alter table public.bookings enable row level security;

create policy "profiles_select_self_or_admin"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.current_role_name()) = 'admin');
create policy "profiles_update_admin"
  on public.profiles for update to authenticated
  using ((select public.current_role_name()) = 'admin')
  with check ((select public.current_role_name()) = 'admin');

create policy "services_read_authenticated"
  on public.services for select to authenticated using (true);
create policy "services_write_admin"
  on public.services for all to authenticated
  using ((select public.current_role_name()) = 'admin')
  with check ((select public.current_role_name()) = 'admin');

create policy "locations_read_authenticated"
  on public.locations for select to authenticated using (true);
create policy "locations_write_admin"
  on public.locations for all to authenticated
  using ((select public.current_role_name()) = 'admin')
  with check ((select public.current_role_name()) = 'admin');

create policy "photographers_read_authenticated"
  on public.photographers for select to authenticated using (true);
create policy "photographers_write_admin"
  on public.photographers for all to authenticated
  using ((select public.current_role_name()) = 'admin')
  with check ((select public.current_role_name()) = 'admin');

create policy "bookings_read_participants"
  on public.bookings for select to authenticated
  using (
    (select public.current_role_name()) = 'admin'
    or client_id = (select auth.uid())
    or photographer_id = (select auth.uid())
  );
create policy "bookings_insert_client_own"
  on public.bookings for insert to authenticated
  with check (
    client_id = (select auth.uid())
    and (select public.current_role_name()) = 'cliente'
    and status = 'pendente'
  );
create policy "bookings_update_admin"
  on public.bookings for update to authenticated
  using ((select public.current_role_name()) = 'admin')
  with check ((select public.current_role_name()) = 'admin');
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles, public.services, public.locations, public.photographers, public.bookings to authenticated;
grant execute on function public.current_role_name() to authenticated;
