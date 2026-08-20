---
name: Local backup design
description: Durable conventions for backing up the mobile app's device-local data.
---

The mobile app stores user data locally, so backup/restore should use a versioned JSON document containing every AsyncStorage-backed collection. Restore must replace the local collections only after explicit confirmation.

**Why:** Reinstalling or changing devices can remove device-local data even when the app itself is unchanged.

**How to apply:** Add new local storage keys to the backup document whenever a new user-data provider is introduced. Recreate OS-level notification registrations during restore because notification IDs are installation-specific.