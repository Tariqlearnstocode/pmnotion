/*
  # Initial Schema Setup for PM Flow

  1. Tables
    - users: System users (landlords, technicians, assistants)
    - collections: Custom workspaces for organizing data
    - fields: Custom fields for collections
    - statuses: Workflow stages for collections
    - entries: Items within collections
    - entry_values: Field values for entries
    - comments: Comments on entries
    - documents: Document storage and management
    
  2. Security
    - RLS policies for each table
    - Secure file access
    
  3. Indexes
    - Optimized queries for common operations
*/

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text not null,
  role text not null check (role in ('landlord', 'technician', 'assistant')),
  created_at timestamptz default now()
);

-- Collections table
create table if not exists collections (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  icon text not null default '📋',
  view_type text not null check (view_type in ('kanban', 'table', 'calendar')),
  owner_id uuid references users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Fields table
create table if not exists fields (
  id uuid primary key default uuid_generate_v4(),
  collection_id uuid references collections(id) on delete cascade,
  name text not null,
  type text not null check (type in ('text', 'select', 'date', 'checkbox', 'file', 'number', 'user')),
  options jsonb, -- For select fields
  required boolean default false,
  "order" integer not null,
  created_at timestamptz default now()
);

-- Statuses table
create table if not exists statuses (
  id uuid primary key default uuid_generate_v4(),
  collection_id uuid references collections(id) on delete cascade,
  name text not null,
  color text not null,
  "order" integer not null,
  created_at timestamptz default now()
);

-- Entries table
create table if not exists entries (
  id uuid primary key default uuid_generate_v4(),
  collection_id uuid references collections(id) on delete cascade,
  status_id uuid references statuses(id) on delete restrict,
  created_by uuid references users(id) on delete restrict,
  assigned_to uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Entry values table
create table if not exists entry_values (
  id uuid primary key default uuid_generate_v4(),
  entry_id uuid references entries(id) on delete cascade,
  field_id uuid references fields(id) on delete cascade,
  value text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Comments table
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  entry_id uuid references entries(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Documents table
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  collection_id uuid references collections(id) on delete cascade,
  name text not null,
  type text not null check (type in ('lease', 'inspection', 'maintenance', 'application', 'other')),
  url text not null,
  size integer not null,
  created_by uuid references users(id) on delete restrict,
  created_at timestamptz default now(),
  expires_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

-- Enable RLS
alter table users enable row level security;
alter table collections enable row level security;
alter table fields enable row level security;
alter table statuses enable row level security;
alter table entries enable row level security;
alter table entry_values enable row level security;
alter table comments enable row level security;
alter table documents enable row level security;

-- RLS Policies
create policy "Users can read own data"
  on users for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can read collections they own"
  on collections for select
  to authenticated
  using (owner_id = auth.uid());

create policy "Users can create collections"
  on collections for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "Users can update own collections"
  on collections for update
  to authenticated
  using (owner_id = auth.uid());

-- Indexes
create index if not exists idx_collections_owner on collections(owner_id);
create index if not exists idx_fields_collection on fields(collection_id);
create index if not exists idx_entries_collection on entries(collection_id);
create index if not exists idx_entry_values_entry on entry_values(entry_id);
create index if not exists idx_comments_entry on comments(entry_id);
create index if not exists idx_documents_collection on documents(collection_id);

-- Updated at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_collections_updated_at
  before update on collections
  for each row
  execute function update_updated_at();

create trigger update_entries_updated_at
  before update on entries
  for each row
  execute function update_updated_at();

create trigger update_entry_values_updated_at
  before update on entry_values
  for each row
  execute function update_updated_at();