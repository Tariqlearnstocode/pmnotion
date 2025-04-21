export interface User {
  id: string;
  email: string;
  name: string;
  role: 'landlord' | 'technician' | 'assistant';
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  viewType: 'kanban' | 'table' | 'calendar';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Field {
  id: string;
  collectionId: string;
  name: string;
  type: 'text' | 'select' | 'date' | 'checkbox' | 'file' | 'number' | 'user';
  options?: string[]; // For select fields
  required: boolean;
  order: number;
}

export interface Entry {
  id: string;
  collection_id: string;
  status_id: string;
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  entry_values: EntryValue[];
}

export interface EntryValue {
  id: string;
  entry_id: string;
  field_id: string;
  value: string | null;
}

export interface Status {
  id: string;
  collectionId: string;
  name: string;
  color: string;
  order: number;
}

export interface Comment {
  id: string;
  entry_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: Pick<User, 'id' | 'name' | 'email'> | null;
}

export interface File {
  id: string;
  entryId: string;
  fieldId: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export interface Document {
  id: string;
  collectionId: string;
  name: string;
  type: 'lease' | 'inspection' | 'maintenance' | 'application' | 'other';
  url: string;
  size: number;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  metadata: {
    propertyId?: string;
    unitId?: string;
    tenantId?: string;
    tags?: string[];
    status?: 'active' | 'expired' | 'archived';
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultViewType: 'kanban' | 'table' | 'calendar';
  fields: Omit<Field, 'id' | 'collectionId'>[];
  statuses: Omit<Status, 'id' | 'collectionId'>[];
}