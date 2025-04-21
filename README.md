🏠 PM Flow

A Modular Workspace for Small Property Managers
Think Notion, purpose-built for landlords.

🔍 What It Is
PM Flow is a flexible, kanban-based management system for mom-and-pop landlords. It gives them structure when they need it — but freedom to customize everything. Instead of forcing users into a rigid property management portal, PM Flow lets them build their own workflows, just like they would in Notion.

Whether it’s maintenance tracking, application reviews, tenant notices, or unit inspections, landlords define how they want to work.

🧠 Key Concept: Workspace > Portal
No portals. No dashboards. No bloat.
Just a clean, modular workspace where users create collections for anything they manage.
Each collection supports custom fields, kanban boards, file uploads, and smart forms.
⚙️ Core Features

🧱 1. Custom Collections
Landlords create collections like:

“Maintenance Requests”
“Rental Applications”
“Inspection Reports”
“Tenant Notices”
“Unit Turnovers”
“Task List for Property A”
Each collection:

Has its own custom fields (text, select, file, checkbox, date, etc.)
Uses a visual view (kanban, table, or calendar)
Has entries (cards/rows) that move through custom stages
Think: Trello meets Airtable, but designed for landlords.
📝 2. Form Builder for Each Collection
Every collection can generate a public or private form
Great for:
Tenants submitting maintenance requests
Applicants filling out a rental application
Owners uploading inspection checklists
Submitted forms create new entries in the appropriate kanban board
💬 3. Built-In Communication
Every entry supports:

Auto-confirmations (email/text on form submission)
Status-change alerts (“Your application is now under review”)
Internal comments (visible only to the landlord)
Optional message logs (track what was sent when)
🗃️ 4. File Uploads & Storage
Attach lease agreements, inspection photos, receipts, and more
Organize by collection or property
Files live inside each entry and are previewable inline
🔒 5. User Roles
Landlord (default): full access
Technician/Contractor: see assigned cards only
Tenant/Applicant: submit forms (no login required)
Virtual Assistant (optional): restricted access to selected collections
📊 6. Dashboards, Views & Filtering
View entries in:
Kanban (status-driven)
Table (spreadsheet-style)
Calendar (for date-driven workflows like inspections)
Filter by unit, date, urgency, property, or assignee
Sort and group by any field
🔄 7. Template Workflows
While users can build from scratch, you can offer pre-configured templates like:

“Maintenance Tracker” (with fields: issue, photo, urgency, assigned tech, etc.)
“Tenant Application Review”
“Eviction Notice Tracker”
“Inspection Log”
Users can start with a template and fully customize it.

🧩 Real-World Examples


Use Case	Collection Name	Custom Fields	View Type
Maintenance	Maintenance Requests	Issue, Photo, Status, Assigned To, Paid Status	Kanban
Tenant Applications	Rental Applications	Name, Income, Co-Tenants, Status, Files	Kanban
Inspections	Unit Inspections	Property, Inspector, Date, Photos, Status	Calendar
Legal Notices	Notices & Filings	Type, Sent Date, Status, Court Date, PDF Copy	Table
Turnover Checklist	Unit Prep & Turnovers	Property, Task, Status, Photo, Expense	Kanban
🧱 Powered by Supabase

Database: dynamic structure using collections, fields, entries, entry_values
Auth: Supabase Auth for user management
Storage: Supabase Storage for file uploads
Realtime: Live updates to kanban boards and entries
Notification System: Email (SendGrid), SMS (Twilio)
🎯 Who It’s For

Landlords with under 10 units (SFHs, duplexes)
Self-managing property owners
Folks juggling spreadsheets, Google Forms, and group texts
Landlords who say:
“I don’t need a portal — I just need to stay organized.”
