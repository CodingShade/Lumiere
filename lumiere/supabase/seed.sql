insert into public.services (nome, descricao, duracao_min, preco, fotos_entregues)
select seed.nome, seed.descricao, seed.duracao_min, seed.preco, seed.fotos_entregues
from (values
  ('Ensaio Essencial', 'Um registro leve e natural para guardar seus momentos.', 60, 350.00, 15),
  ('Ensaio Afeto', 'Uma sessão especial para casais, famílias e encontros.', 90, 590.00, 30),
  ('Ensaio Editorial', 'Uma experiência autoral com direção e produção cuidadosa.', 120, 890.00, 45)
) as seed(nome, descricao, duracao_min, preco, fotos_entregues)
where not exists (
  select 1 from public.services existing where existing.nome = seed.nome
);

insert into public.locations (nome, endereco, tipo)
select seed.nome, seed.endereco, seed.tipo::public.location_type
from (values
  ('Estúdio Lumiere', 'Rua das Flores, 120 - Centro', 'estudio'),
  ('Jardim das Palmeiras', 'Av. das Palmeiras, 500 - Jardim', 'externo')
) as seed(nome, endereco, tipo)
where not exists (
  select 1 from public.locations existing where existing.nome = seed.nome
);
