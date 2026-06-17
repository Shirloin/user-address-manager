# User → Address flow

A brief end-to-end design of the one-to-many relationship between users and
addresses: data model, API surface, request flow, frontend state boundary,
and the invariants worth calling out.

## Data model

```
User (1) ──── (N) Address
  id              id
  email           userId    (foreign key)
  firstName       street, city, state, zip, country
  lastName
  addresses[]    ← composed (UserDetailDto inlines them)
```

Stored in-memory in two `ConcurrentHashMap`s
(`InMemoryUserRepository`, `InMemoryAddressRepository`). `User` itself does
*not* hold an address list field — the composition only appears in the
read-side DTO (`UserDetailDto`). This keeps writes single-aggregate and
avoids dual-source-of-truth.

## API surface

User-scoped where the relationship matters, address-scoped once an address
has its own id:

```
GET    /api/users              → list (summary, no addresses)
GET    /api/users/{id}         → detail (includes addresses[])
POST   /api/users              → create user
PUT    /api/users/{id}         → update profile
POST   /api/users/{id}/addresses   → add address  (parent in path)
PUT    /api/addresses/{addressId}  → edit address (flat, id is enough)
DELETE /api/addresses/{addressId}  → delete address
```

Rationale: creating an address requires the user context (ownership), so it
nests under the user. Once the address has an id, that id is globally
unique, so edit/delete don't need the parent — and we avoid forcing the
client to remember the `userId` for those calls.

## Request flow — "add an address"

```
UserDetailPage
  └─ AddressDialog  ──┐ submit
                      ▼
            useAddAddress(userId).mutate(payload)
                      │  POST /api/users/{id}/addresses
                      ▼
            AddressController
                      │
                      ▼
            AddressService  (validate, build Address with new UUID)
                      │
                      ▼
            InMemoryAddressRepository.save(addr)
                      │  201 + AddressDto
                      ▼
            onSuccess: queryClient.invalidateQueries(['users', userId])
                      │
                      ▼
            useUserDetail refetches → list re-renders with the new row
            showSnackbar('success', 'Address added.')
```

Edit and delete follow the same shape but invalidate the same
`['users', id]` key so the user detail view stays consistent without manual
cache patching.

## Frontend state boundary

| Lives in       | What                                                              |
| -------------- | ----------------------------------------------------------------- |
| TanStack Query | `['users']` list, `['users', id]` detail (with addresses)         |
| Zustand UI     | Which dialog is open, in-flight draft, pending delete id, snackbar payload |
| `useState`     | Profile form draft on `UserDetailPage`, re-seeded from query cache |

Server data is never copied into Zustand — that's how the addresses list
stays a single source of truth across the dialog, the row, and the confirm.

## Invariants worth calling out

- **Email uniqueness** is enforced server-side (case-insensitive). Frontend
  surfaces the failure inline on the email field if the message mentions
  `email`.
- **Address ownership** is enforced at the service layer on edit/delete:
  the address's `userId` is the truth, even though the URL doesn't carry
  it.
- **Cascade**: deleting a user is out of scope here, but if added, it would
  have to cascade-delete addresses to avoid orphans.
