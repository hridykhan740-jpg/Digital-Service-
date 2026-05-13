# Security Specification

## Data Invariants
1. Services and SIM offers are publicly readable.
2. Users can only manage their own profiles (except admins).
3. Submissions belong to a user; only that user or an admin can read them.
4. Notifications are for a specific user, 'SYSTEM', or readable by admins.
5. Notes are private to the creator or readable by admins.

## The Dirty Dozen Payloads
1. Create a submission for another user.
2. Update a service status without admin rights.
3. List all users as a non-admin.
4. Read another user's submission.
5. Create a user profile with a non-zero balance.
6. Inject a large string (1MB) into a service ID.
7. Update someone else's note.
8. Delete a service as a non-admin.
9. Create a notification for another user as a non-system account.
10. Spoof an admin email without verification.
11. Update the 'role' field in own user profile.
12. Read private system notifications.

## Test Strategy
All these payloads must be rejected by the security rules.
