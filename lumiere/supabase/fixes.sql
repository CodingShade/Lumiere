alter table public.locations
  alter column endereco drop not null;

create or replace view public.photographer_directory as
select
  photographers.profile_id,
  profiles.nome,
  photographers.especialidade
from public.photographers as photographers
join public.profiles as profiles on profiles.id = photographers.profile_id
where photographers.ativo = true;

revoke all on public.photographer_directory from public, anon;
grant select on public.photographer_directory to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nome, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nome', ''),
      nullif(split_part(coalesce(new.email, new.phone, ''), '@', 1), ''),
      'Novo usuário'
    ),
    'cliente'
  );
  return new;
end;
$$;
