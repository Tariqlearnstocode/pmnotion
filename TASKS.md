# Frontend Supabase Integration

**Note:** Assistant will proceed through tasks automatically without asking for confirmation.

Connect the existing React frontend to the Supabase backend defined in the schema. Replace hardcoded data with live data and implement basic CRUD operations for core features.

## Completed Tasks

- [x] Project Setup (React, Vite, TS, Tailwind)
- [x] Supabase Schema Definition (`supabase/migrations/`)
- [x] Basic Routing (`src/App.tsx`)
- [x] Initial UI Components/Pages Structure (`src/components`, `src/pages`)
- [x] Create Supabase Client Initialization (`src/lib/supabaseClient.ts`)
- [x] Implement Authentication Flow (Login/Signup UI & Logic)
    - [x] Create Login/Signup UI Components (`src/components/auth/`)
    - [x] Create Login/Signup Pages (`src/pages/`)
    - [x] Add Auth Routes (`src/App.tsx`)
    - [x] Implement Supabase Auth Logic (`signIn`/`signUp`)
    - [x] Manage Auth State (Context/State Management + `onAuthStateChange`)
    - [x] Protect Routes (`src/App.tsx`)
- [x] Fetch and Display Collections (`src/pages/Collections.tsx`)
- [x] Implement Collection Creation (`src/components/collections/NewCollectionForm.tsx`)
- [x] Fetch and Display Single Collection Details (`src/pages/Collection.tsx`)
- [x] Fetch and Display Fields for a Collection
- [x] Fetch and Display Entries for a Collection (`src/pages/Collection.tsx`)
- [x] Fetch and Display Entry Values
- [x] Implement Kanban View (`src/components/collections/KanbanView.tsx`)
- [x] Implement Table View (`src/components/collections/TableView.tsx`)
- [x] Implement Calendar View (`src/components/collections/CalendarView.tsx`)
- [x] Implement Entry Creation/Update/Deletion (Service functions and modal logic)
- [x] Implement Field Creation/Update/Deletion (Service functions and modal UI setup)
- [x] Fix user creation in `users` table on signup & display logged-in user info (Trigger added manually, context updated)
- [x] Create Profile Page (Display user name, email, role)
- [x] Implement Status Management (Service functions and modal integration)
- [x] Implement Public Form Submission (Basic page and route structure done; RLS/Service logic needed)
- [x] Implement File Uploads (Supabase Storage)
- [x] Implement Form Builder UI 
    - [x] Basic structure (Palette, Canvas, Properties)
    - [x] DND Palette -> Canvas
    - [x] DND Reordering on Canvas
    - [x] Implement Field Property Editing (Details Panel)
    - [x] Implement Form Builder Save/Load Mechanism (Basic collection.form_definition)
- [x] Implement Comments Feature

## In Progress Tasks

- [ ] Implement Document Management (`documents` table integration)
    - [x] Create/Refactor Service Functions (`src/services/documents.ts` - Supabase logic)
    - [x] Create UI for Listing/Managing Documents (e.g., `DocumentList.tsx`)
    - [x] Create UI for Uploading Documents (e.g., `DocumentUploadModal.tsx`)
    - [x] Integrate Document List & Upload into Collection Page (`src/pages/Collection.tsx`)
    - [ ] (Optional) Allow associating documents with specific entries (`src/components/entries/EntryFormModal.tsx`)
- [ ] Refine RLS Policies
- [ ] Implement Notifications (Email via Supabase Functions)

## Future Tasks

- [ ] Implement Field Management Save Logic (`FieldManagerModal.tsx`)
- [ ] Implement Status Management Save Logic (`StatusManagerModal.tsx`)
- [ ] Refine Public Form Submission (RLS, Service Logic, Security Checks)
- [ ] Create Preset Templates (e.g., Maintenance Tracker, Application Tracker, Property Directory) for faster user setup.

## Implementation Plan

1.  **Initialize Supabase:** Set up the `supabase-js` client.
2.  **Authentication:** Secure the app with Supabase Auth.
3.  **Core Reads:** Fetch and display existing data (Collections, Entries, Fields, Values). Start with Collections list.
4.  **Core Writes:** Implement creation/update/deletion for Collections, Fields, Entries, Values. Start with Collection creation.
5.  **Views:** Build out the Kanban, Table, and Calendar displays.
6.  **Advanced Features:** Implement forms, file uploads, comments, notifications.
7.  **Permissions:** Refine RLS.

### Relevant Files

- `supabase/migrations/20250420190401_green_union.sql` - Database schema definition.
- `src/App.tsx` - ✅ Main application routing (with auth routes & protection).
- `src/pages/Collections.tsx` - ✅ Page to display list of collections (fetches from Supabase).
- `src/pages/Collection.tsx` - ✅ Page to display a single collection's view (fetches collection, fields, entries).
- `src/components/collections/NewCollectionForm.tsx` - ✅ Form component for creating new collections (uses Supabase).
- `src/services/collections.ts` - ✅ Service functions for collection & field CRUD.
- `src/services/entries.ts` - ✅ Service functions for entry CRUD (create, read, update status, update values, delete).
- `src/types/index.ts` - ✅ Type definitions (updated Collection, Entry, EntryValue types).
- `package.json` - Project dependencies, including `@supabase/supabase-js`.
- `.env` - Environment variables for Supabase keys (ensure this is populated).
- `src/lib/supabaseClient.ts` - ✅ Supabase client instance.
- `src/components/auth/LoginForm.tsx` - ✅ Login form UI component.
- `src/components/auth/SignupForm.tsx` - ✅ Signup form UI component.
- `src/pages/LoginPage.tsx` - ✅ Login page component (with Supabase logic).
- `src/pages/SignupPage.tsx` - ✅ Signup page component (with Supabase logic).
- `src/context/AuthContext.tsx` - ✅ Auth context provider and hook.
- `src/main.tsx` - ✅ App entry point (wrapped with AuthProvider).
- `src/components/collections/KanbanView.tsx` - ✅ Kanban view component (fetches data, basic DND implemented).
- `src/components/collections/TableView.tsx` - ✅ Table view component.
- `src/components/collections/CalendarView.tsx` - ✅ Calendar view component.
- `src/components/entries/EntryFormModal.tsx` - ✅ Modal form for creating/editing entries (logic implemented).
- `src/components/fields/FieldManagerModal.tsx` - ✅ Modal UI for managing fields (placeholder save logic).

## Current Task: Implement Document Management

**Description:** Allow users to create, upload, view, and manage documents within the application. This includes associating documents with collection entries.

**Files Involved:**
*   `src/components/documents/DocumentManager.tsx` (New)
*   `src/components/documents/DocumentViewer.tsx` (New)
*   `src/services/documents.ts` (New)
*   `src/pages/Collection.tsx` (Integrate document management features)
*   `src/components/entries/EntryFormModal.tsx` (Add document association field)
*   `TASKS.md` (Update task status) 