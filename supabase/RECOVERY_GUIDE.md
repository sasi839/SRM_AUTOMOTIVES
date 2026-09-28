# SRM AUTOMOTIVES — BACKEND DISASTER RECOVERY & BACKUP GUIDE

This document provides step-by-step instructions for backing up and restoring database records, website images, and access permissions for the SRM AUTOMOTIVES backend.

---

## 1. WHAT DATA IS BACKED UP

The system manages four core components:
1. **`site_content`**: Editable business metadata (name, owner, phone numbers, WhatsApp, email, address, Google Maps URL).
2. **`site_images`**: Website image records (Hero Slides, Service Cards, Our Works / Gallery items) with display order and active states.
3. **`admin_users` & RLS Policies**: Authorized admin user IDs and Row Level Security policies.
4. **`website-images` Storage Bucket**: Uploaded image assets stored in Supabase Storage under `hero/`, `services/`, and `gallery/`.

---

## 2. RECOVERY MECHANISMS & LOCATIONS

| Backup Resource | Location / Path | Purpose |
| :--- | :--- | :--- |
| **Migrations** | `supabase/migrations/` | Sequential schema changes and RLS policies. |
| **Default Seed Data** | `supabase/seed.sql` | Default records for initial deployment or restoration. |
| **Full Restore Script** | `supabase/backup/full_backup_restore.sql` | Standalone point-in-time recovery script. |
| **Self-Service Restore** | Admin Dashboard (`/admin`) | Soft-delete recovery for deactivated items. |

---

## 3. HOW TO RESTORE DATABASE CONTENT

### Method A: Admin Dashboard Self-Service Recovery (Instant)
If an image or slide was accidentally deactivated or removed:
1. Log in to the Admin Dashboard at `/admin`.
2. Navigate to the relevant tab (**Hero Slides**, **Services**, or **Our Works**).
3. Items marked **"Inactive"** remain saved in the database.
4. Click the **"Active"** toggle or **"Save"** button to instantly restore the item to the public website.

### Method B: Supabase SQL Editor (Full Point-in-Time Restore)
If database tables or content were lost or corrupt:
1. Open your Supabase Project Dashboard.
2. Go to the **SQL Editor** tab.
3. Open the contents of [`supabase/backup/full_backup_restore.sql`](file:///home/sasikumar/Documents/vibe%20code/SRM%20AUTOMOTIVES/supabase/backup/full_backup_restore.sql).
4. Click **Run**.
5. The complete database schema, security policies, storage bucket rules, and default seed records will be re-established.

---

## 4. HOW TO RESTORE WEBSITE IMAGES (SUPABASE STORAGE)

### Exporting / Backing Up Storage Assets
You can back up the `website-images` bucket using the Supabase CLI or Storage API:
```bash
# Using Supabase CLI to pull storage objects
supabase storage download website-images ./storage_backup
```

### Restoring Storage Bucket
1. If the `website-images` bucket is missing, run [`supabase/migrations/20260928000002_phase3_storage.sql`](file:///home/sasikumar/Documents/vibe%20code/SRM%20AUTOMOTIVES/supabase/migrations/20260928000002_phase3_storage.sql) or `full_backup_restore.sql` in the SQL Editor.
2. In the Supabase Dashboard, navigate to **Storage > website-images**.
3. Re-upload folder structures (`hero/`, `services/`, `gallery/`) if physical files were deleted.

---

## 5. CREDENTIALS & SECURITY SAFEGUARDS

- **Never commit `.env` containing production passwords or service-role keys.**
- Only standard `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are used in client code.
- Public users are strictly read-only (`SELECT`) via Row Level Security (RLS). All write operations require an authorized account in `admin_users`.
