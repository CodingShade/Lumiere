create or replace function public.create_photographer(
  p_profile_id uuid,
  p_especialidade text,
  p_portfolio_url text,
  p_ativo boolean
)
returns public.photographers
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_role public.user_role;
  created_photographer public.photographers;
begin
  if public.current_role_name() is distinct from 'admin' then
    raise exception using errcode = '42501', message = 'Apenas administradores podem gerenciar fotógrafos.';
  end if;

  select profile.role
    into target_role
    from public.profiles as profile
    where profile.id = p_profile_id
    for update;

  if not found then
    raise exception using errcode = '23503', message = 'O usuário selecionado não foi encontrado.';
  end if;

  if target_role is distinct from 'cliente' then
    raise exception using errcode = '23514', message = 'Selecione um usuário com perfil de cliente.';
  end if;

  insert into public.photographers (profile_id, especialidade, portfolio_url, ativo)
  values (p_profile_id, p_especialidade, p_portfolio_url, p_ativo)
  returning * into created_photographer;

  update public.profiles
    set role = 'fotografo'
    where id = p_profile_id and role = 'cliente';

  if not found then
    raise exception using errcode = '23514', message = 'Não foi possível atualizar o perfil do usuário.';
  end if;

  return created_photographer;
end;
$$;

create or replace function public.delete_photographer(p_profile_id uuid)
returns public.photographers
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_photographer public.photographers;
begin
  if public.current_role_name() is distinct from 'admin' then
    raise exception using errcode = '42501', message = 'Apenas administradores podem gerenciar fotógrafos.';
  end if;

  delete from public.photographers
    where profile_id = p_profile_id
    returning * into deleted_photographer;

  if not found then
    return null;
  end if;

  update public.profiles
    set role = 'cliente'
    where id = p_profile_id and role = 'fotografo';

  if not found then
    raise exception using errcode = '23514', message = 'Não foi possível restaurar o perfil como cliente.';
  end if;

  return deleted_photographer;
end;
$$;

create or replace function public.create_demo_photographer(
  p_profile_id uuid,
  p_especialidade text,
  p_portfolio_url text,
  p_ativo boolean
)
returns public.photographers
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_role public.user_role;
  created_photographer public.photographers;
begin
  if (select auth.role()) is distinct from 'service_role' then
    raise exception using errcode = '42501', message = 'Operação restrita ao servidor.';
  end if;

  select profile.role
    into target_role
    from public.profiles as profile
    where profile.id = p_profile_id
    for update;

  if not found then
    raise exception using errcode = '23503', message = 'O perfil do usuário não foi encontrado.';
  end if;

  if target_role not in ('cliente', 'fotografo') then
    raise exception using errcode = '23514', message = 'O perfil selecionado não pode ser vinculado como fotógrafo.';
  end if;

  insert into public.photographers (profile_id, especialidade, portfolio_url, ativo)
  values (p_profile_id, p_especialidade, p_portfolio_url, p_ativo)
  on conflict (profile_id) do update
    set especialidade = excluded.especialidade,
        portfolio_url = excluded.portfolio_url,
        ativo = excluded.ativo
  returning * into created_photographer;

  update public.profiles
    set role = 'fotografo'
    where id = p_profile_id;

  return created_photographer;
end;
$$;

revoke all on function public.create_photographer(uuid, text, text, boolean) from public, anon;
revoke all on function public.delete_photographer(uuid) from public, anon;
revoke all on function public.create_demo_photographer(uuid, text, text, boolean) from public, anon, authenticated;
grant execute on function public.create_photographer(uuid, text, text, boolean) to authenticated;
grant execute on function public.delete_photographer(uuid) to authenticated;
grant usage on schema public to service_role;
grant execute on function public.create_demo_photographer(uuid, text, text, boolean) to service_role;
