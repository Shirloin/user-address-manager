# Frontend features

A walkthrough of every user-facing feature, grouped by page, with the hooks
and store slices that back each one.

## Routes

| Path           | Page                      |
| -------------- | ------------------------- |
| `/`            | User list                 |
| `/users/:id`   | User detail               |
| anything else  | Redirect to `/`           |

Defined in `src/router.tsx` with `createBrowserRouter`; the root route
renders the `Layout` (`Container` + `Outlet` + global `Snackbar`).

---

## 1. User list (`/`)

**File:** `src/pages/UserListPage.tsx`

### What it does

- Fetches the user list via `useUsers()` → `GET /api/users`.
- Renders an MUI `Table` with columns: Email, First name, Last name, Actions.
- Each row is clickable and navigates to `/users/:id`. A "View" button inside
  the actions cell does the same — but stops event propagation so it doesn't
  fire twice.
- Header row carries a **Create user** button on the right.
- Shows a `CircularProgress` while loading and an `Alert` on error.
- Shows a centered "No users to display." row if the list comes back empty.

### Backing pieces

| Concern                | Where                                                   |
| ---------------------- | ------------------------------------------------------- |
| Server data            | `useUsers()` → query key `['users']`                    |
| "Create" button state  | `useUiStore.openCreateUserDialog()`                     |
| Create dialog mount    | `<CreateUserDialog />` rendered at the bottom of the page |

---

## 2. Create user (modal)

**File:** `src/components/CreateUserDialog.tsx`

### What it does

- Opens when `useUiStore(s => s.createUserDialogOpen)` is true.
- Three fields: First name, Last name, Email — each with `inputProps.maxLength`
  matching the backend cap (50 / 50 / 100).
- Validates locally on submit via `validateUserFields(draft)`:
  - required, trimmed
  - email matches `/^\S+@\S+\.\S+$/`
  - length within caps
- On submit calls `useCreateUser().mutateAsync(trimUserFields(draft))`
  (`POST /api/users`).
- On success: invalidates the users query (the list refetches), shows a
  success snackbar, closes the dialog.
- On server-side failure:
  - If the message mentions `email` (e.g. duplicate-email rejection from
    the backend's case-insensitive uniqueness check), the error is also set
    inline on the email field.
  - The error always shows in the snackbar.
- Buttons disable while the mutation is in-flight; closing the dialog is
  prevented during save.

### Backing pieces

| Concern              | Where                                                                     |
| -------------------- | ------------------------------------------------------------------------- |
| Dialog open + draft  | `useUiStore` — `createUserDialogOpen`, `newUserDraft`, `updateNewUserDraft` |
| Mutation             | `useCreateUser()`                                                         |
| Validation           | `src/lib/userValidation.ts`                                               |
| Feedback             | `useUiStore.showSnackbar('success' \| 'error', ...)`                      |

---

## 3. User detail (`/users/:id`)

**File:** `src/pages/UserDetailPage.tsx`

### What it does

- Reads `id` from `useParams<{ id: string }>()`.
- Fetches detail via `useUserDetail(id)` → `GET /api/users/{id}`.
- Renders:
  - **Back to users** button (top-left, navigates to `/`).
  - **Profile** paper — editable First name, Last name, Email + Save button.
  - **Addresses** paper — header with Add address button, then either the
    empty state or a list of address rows.
- Shows a `CircularProgress` while loading.
- Shows an `Alert` on error or when the id can't be resolved.

### Profile editor

- Local `useState` holds the in-progress draft. **It is never copied into
  Zustand.** A `useEffect` re-seeds it from the query cache when the server
  data changes, so navigating between users picks up the right defaults.
- Save runs `validateUserFields(profile)` — same rules as create — then
  calls `useUpdateUser().mutateAsync(trimUserFields(profile))`
  (`PUT /api/users/{id}`).
- On success: query cache is updated via `setQueryData` (no extra fetch);
  success snackbar fires.
- On server-side failure mentioning `email`: same inline-on-email behaviour
  as the create dialog.

### Address list

- Each row is an `AddressListItem` with Edit and Delete icon buttons.
- Empty state (`No addresses yet. Add the first one above.`) renders when
  `user.addresses.length === 0` — exercised at runtime by seed user `u-4`
  (Linus).

### Backing pieces

| Concern                  | Where                                                       |
| ------------------------ | ----------------------------------------------------------- |
| Server data              | `useUserDetail(id)` → query key `['users', id]`             |
| Profile mutation         | `useUpdateUser(id)`                                         |
| Address dialog open      | `useUiStore.openAddAddressDialog()` / `openEditAddressDialog(addr)` |
| Address delete confirm   | `useUiStore.requestDeleteAddress(id)` / `cancelDeleteAddress()` |
| Validation               | `src/lib/userValidation.ts`                                 |

---

## 4. Address add / edit (modal)

**File:** `src/components/AddressDialog.tsx`

### What it does

- One dialog handles **both** add and edit. The mode is driven by
  `useUiStore(s => s.editingAddressId)`: `null` ⇒ add, otherwise ⇒ edit.
- The draft (`addressDraft`) lives in Zustand and is pre-filled by
  `openEditAddressDialog(address)` when editing.
- Local validation on submit — every field required (matches backend
  `@NotBlank`).
- Submit dispatches:
  - **Add**: `useAddAddress(userId).mutateAsync(payload)` → `POST /api/users/{id}/addresses`
  - **Edit**: `useUpdateAddress(userId).mutateAsync({ addressId, payload })` → `PUT /api/addresses/{id}`
- Both mutations invalidate the user detail query, so the address list
  refreshes immediately. Snackbar reports outcome.

---

## 5. Address delete (confirm dialog)

**File:** `src/components/ConfirmDialog.tsx` (generic) — invoked from
`UserDetailPage`.

### What it does

- Delete icon on the row calls `requestDeleteAddress(addr.id)`, which sets
  `pendingDeleteAddressId` in Zustand. The confirm dialog opens.
- The dialog message includes the street + city so the user can verify
  what's about to disappear.
- Confirm calls `useDeleteAddress(userId).mutateAsync(addressId)` →
  `DELETE /api/addresses/{id}`. On success: detail query invalidated, list
  refetches without the row, success snackbar.
- Cancelling clears `pendingDeleteAddressId`.
- The dialog also blocks closing while the mutation is in flight.

---

## 6. Global snackbar

**File:** `src/components/Layout.tsx`

The `Snackbar` is mounted once at the layout level. Every page surface
posts via `useUiStore.showSnackbar(severity, message)`. Auto-hides after 4s
or on explicit close. This is what's behind every "Profile saved.",
"Address deleted.", "Create failed: …" toast.

---

## State boundary recap

- **Server data** (users, user detail, addresses) → TanStack Query cache.
  Read with `useQuery`, written with `useMutation`, invalidated/refilled on
  success. **Never copied into Zustand.**
- **UI state** (dialog flags, form drafts in flight, snackbar payload) →
  Zustand `useUiStore`.
- **Transient per-page state** (the profile-form draft on `UserDetailPage`)
  → local `useState`, re-seeded from the query cache via `useEffect`.

Each component knows exactly which channel it's reading from. There is no
fourth place the same data could be living.
