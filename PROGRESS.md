# MatheuxMed Progress Log

## Milestone 2 — Supabase migration start
Status: In progress
Date: 2026-10-11

Highlights:
- The project is now intentionally tracked on the refactor branch for long-lived work continuity.
- We have a saved project strategy and curriculum outline in the repo.
- We are now replacing browser-exposed Firebase configuration with a Supabase-safe frontend bootstrap.

Implementation details:
- Added environment template for Supabase public configuration.
- Added a dedicated Supabase client bootstrap file for browser usage.
- Updated the landing page to stop depending on Firebase and absolute repository paths.
- Prepared auth logic to work with Supabase Auth instead of Firestore-based Firebase auth.

Next objective:
- Replace remaining `/mathyxo/` absolute paths with deploy-safe relative URLs.
- Finish refactoring auth.js to work with Supabase and graceful fallbacks.
- Connect course overview rendering to curriculum data.
