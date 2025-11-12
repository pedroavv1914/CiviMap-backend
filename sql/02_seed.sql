INSERT INTO issue_categories(name, slug) VALUES
  ('Buraco','buraco'),
  ('Lixo','lixo'),
  ('Iluminação','iluminacao'),
  ('Outros','outros')
ON CONFLICT (slug) DO NOTHING;
