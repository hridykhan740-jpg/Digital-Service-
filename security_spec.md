# Security Specification for Àbdüllāh Aĺ Hỗŝŝâîň Telecom

## Data Invariants
1. A user profile (`users/{userId}`) can only be created by the authenticated user with that `userId`.
2. A user's `balance` and `role` can only be modified by an Admin.
3. Submissions (`submissions/{id}`) must have a `userId` matching the creator's UID.
4. Users can only read their own submissions.
5. Admins have full read/write access to all collections except for specific immutable fields.
6. Public collections like `services` and `sim_offers` are read-only for users and writeable by Admins.

## The Dirty Dozen (Attack Vectors)
1. **Self-Promotion**: A user tries to set their `role` to 'admin' during creation.
2. **Infinite Credit**: A user tries to set their `balance` to 999999 during creation.
3. **Identity Theft**: A user tries to read another user's profile.
4. **Submission Spoofing**: A user creates a submission with another user's `userId`.
5. **Private Data Leak**: A user lists all `submissions` without a filter.
6. **Price Tampering**: A user tries to update a `sim_offer` price.
7. **Service Sabotage**: A user tries to delete a `service` definition.
8. **Status Faking**: A user tries to update their own submission status to 'completed'.
9. **Orphaned Writes**: A user creates a submission referencing a non-existent user.
10. **Resource Exhaustion**: A user sends a 1MB string in the `name` field of their profile.
11. **Shadow Updates**: A user updates their profile and adds a hidden `isAdmin` field.
12. **Timestamp Fraud**: A user provides a past `createdAt` timestamp.

## Security Controls
- Standard RBAC based on `ADMIN_EMAILS`.
- Helper functions for validation.
- `affectedKeys().hasOnly()` for granular update control.
- `isValidId()` for path variable hardening.
- `request.auth.token.email_verified` check.
