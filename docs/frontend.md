# Frontend architecture

React 18 + TypeScript (strict mode), Vite, MUI. Routing via
`createBrowserRouter` with a `Layout` component as the root route. State is
split across three layers with strict boundaries — see below.

## File tree

```
src/
├── types/
│   └── domain.ts             Domain & payload types — flow through every layer
│
├── lib/
│   └── userValidation.ts     Shared user-field validator (create + update)
│
├── api/                      Axios instance + raw endpoint functions
│   ├── axiosClient.ts        Configured baseURL + response interceptor
│   └── userApi.ts            One function per endpoint, typed return values
│
├── hooks/                    TanStack Query hooks — components consume these, never axios
│   ├── queryKeys.ts
│   ├── useUsers.ts           list query
│   ├── useUserDetail.ts      detail query
│   ├── useCreateUser.ts      mutation, invalidates list
│   ├── useUpdateUser.ts      mutation, setQueryData on success
│   ├── useAddAddress.ts      mutation, invalidates detail
│   ├── useUpdateAddress.ts   mutation, invalidates detail
│   └── useDeleteAddress.ts   mutation, invalidates detail
│
├── store/                    Zustand — UI-only state, typed UiState interface
│   └── useUiStore.ts         dialog flags, form drafts, snackbar
│
├── pages/                    Route components
│   ├── UserListPage.tsx      Table + Create button + CreateUserDialog
│   └── UserDetailPage.tsx    Profile editor + address list + dialogs
│
├── components/               Reusable building blocks
│   ├── Layout.tsx            Root-route element: Container + Outlet + global Snackbar
│   ├── CreateUserDialog.tsx  Validated create form, wired to useCreateUser
│   ├── AddressDialog.tsx     Add/edit address, wired to useAddAddress/useUpdateAddress
│   ├── AddressListItem.tsx   Single-address row with edit/delete buttons
│   └── ConfirmDialog.tsx     Generic confirm — currently used for address delete
│
├── router.tsx                createBrowserRouter config (Layout + child routes)
├── App.tsx                   <RouterProvider router={router} /> — that's it
├── main.tsx                  QueryClientProvider + MUI theme + <App />
└── vite-env.d.ts             Vite client types + typed VITE_API_BASE_URL
```

## Routing — createBrowserRouter + Layout

`src/router.tsx`:

```tsx
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <UserListPage /> },
      { path: 'users/:id', element: <UserDetailPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
```

`App.tsx` is a one-liner: `<RouterProvider router={router} />`.

`Layout.tsx` renders the route shell — `<Container>` + `<Outlet />` + the
global `<Snackbar>` driven by the Zustand store. Adding a new top-level page
means adding one entry to `router.tsx`, not touching `App.tsx`.

## State boundary — the key rule

Three layers, each with one responsibility. **Crossing the boundary is a
bug**, not a convenience.

| Layer            | Owns                                                  | Used via                          |
| ---------------- | ----------------------------------------------------- | --------------------------------- |
| **TanStack Query** | Anything that came from the API                       | `useQuery` / `useMutation` hooks  |
| **Zustand**        | UI-only state with no server origin                   | `useUiStore` selectors             |
| **Local `useState`** | Transient per-component draft (e.g. profile form)   | inline in the page component       |

### TanStack Query — server data

Anything that comes from the API lives in the query cache. There is no
parallel copy in Zustand, no parallel copy in component state, no
`useEffect` syncing it somewhere. Hooks under `src/hooks/` are the only
place that calls `userApi.ts`; components consume the hooks.

After mutations:

- **`useUpdateUser`** writes the response back with `setQueryData` (no extra
  fetch — the response is the new detail).
- **`useCreateUser`** and the address mutations **`invalidateQueries`** so
  the affected list/detail refetches.

### Zustand — UI state only

`useUiStore` holds:

- `addressDialogOpen`, `editingAddressId`, `addressDraft` — the address dialog
- `pendingDeleteAddressId` — the confirm-delete dialog
- `createUserDialogOpen`, `newUserDraft` — the create-user dialog
- `snackbar` — global toast payload

That's it. **Server data never enters this store.** The bug class this
prevents: dual sources of truth where the UI shows stale data after a
mutation because the local copy wasn't refreshed.

The one exception is the **profile form** on `UserDetailPage`, which uses a
local `useState` for the in-progress draft and re-seeds it from the query
cache via `useEffect` when the user data changes. That keeps the user able
to type freely without the half-typed value leaking back into anything
global — it lives only as long as the page is mounted.

### Axios — the single HTTP client

`src/api/axiosClient.ts` is a configured `axios.create({...})`:

- `baseURL` from `VITE_API_BASE_URL` (defaults to `http://localhost:8080`)
- Response interceptor unwraps the backend's `ApiError.message` into
  `error.message` so hook consumers can render it directly

`userApi.ts` is the only file that calls the axios client. Hooks call
`userApi.ts`. Components call hooks. The chain is one-directional.

## TypeScript

Everything is `.ts` / `.tsx` with `strict` mode on:

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true,
  "noUncheckedSideEffectImports": true
}
```

Domain types in `src/types/domain.ts` (`UserSummary`, `UserDetail`,
`Address`, `CreateUserPayload`, `UpdateUserPayload`, `AddressPayload`) flow
through every layer. Axios calls are generic-parameterized; query/mutation
hooks declare `<TData, TError, TVariables>`; component props have explicit
interfaces; the Zustand store has an explicit `UiState` interface.

Run `npm run typecheck` to verify; `npm run build` runs `tsc -b && vite
build`, so a type error fails the build.

## Validation

`src/lib/userValidation.ts` exports `validateUserFields` — used by both the
create dialog and the profile editor. Rules mirror the backend's Bean
Validation:

- `firstName` / `lastName`: required, max 50 chars
- `email`: required, must match `/^\S+@\S+\.\S+$/`, max 100 chars

`<TextField inputProps={{ maxLength }}>` enforces the caps in the browser
too. When the backend rejects (e.g. duplicate email), the error message is
surfaced inline on the email field via the snackbar.

## Loading / error / empty states

Every page that fetches uses `isLoading` and `isError` from TanStack Query.
`UserListPage` and `UserDetailPage` each render a centered `CircularProgress`
while loading and an MUI `Alert severity="error"` on error.

`UserDetailPage` renders an explicit empty-state message inside the
addresses paper when the user has zero addresses — verified at runtime by
user `u-4` (Linus, seeded with no addresses).
