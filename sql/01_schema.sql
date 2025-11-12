CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  name varchar NOT NULL,
  email varchar NOT NULL UNIQUE,
  password_hash varchar NOT NULL,
  role varchar NOT NULL CHECK (role IN ('citizen','admin','staff')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS issue_categories (
  id serial PRIMARY KEY,
  name varchar NOT NULL,
  slug varchar NOT NULL UNIQUE,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY,
  title varchar NOT NULL,
  description text,
  status varchar NOT NULL CHECK (status IN ('open','in_review','in_progress','resolved','closed')) DEFAULT 'open',
  category_id integer REFERENCES issue_categories(id),
  created_by uuid REFERENCES users(id),
  location geometry(Point,4326) NOT NULL,
  address varchar,
  neighborhood varchar,
  city varchar,
  priority_score numeric DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  ai_suggested_category_id integer REFERENCES issue_categories(id)
);

CREATE INDEX IF NOT EXISTS idx_issues_location ON issues USING GIST (location);

CREATE TABLE IF NOT EXISTS issue_photos (
  id uuid PRIMARY KEY,
  issue_id uuid REFERENCES issues(id) ON DELETE CASCADE,
  url varchar NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS issue_votes (
  id uuid PRIMARY KEY,
  issue_id uuid REFERENCES issues(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(issue_id, user_id)
);

CREATE TABLE IF NOT EXISTS issue_comments (
  id uuid PRIMARY KEY,
  issue_id uuid REFERENCES issues(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS issue_status_history (
  id uuid PRIMARY KEY,
  issue_id uuid REFERENCES issues(id) ON DELETE CASCADE,
  old_status varchar NOT NULL CHECK (old_status IN ('open','in_review','in_progress','resolved','closed')),
  new_status varchar NOT NULL CHECK (new_status IN ('open','in_review','in_progress','resolved','closed')),
  changed_by uuid REFERENCES users(id),
  created_at timestamp DEFAULT now()
);
