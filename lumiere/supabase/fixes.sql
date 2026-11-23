alter table public.locations
  alter column endereco drop not null;

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
