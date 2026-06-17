# User & Address Manager

Manage users and their addresses (one user, many addresses).

```
.
├── backend/    Spring Boot 3.4 REST API on http://localhost:8080
├── frontend/   React 18 + TypeScript SPA on http://localhost:5173
└── docs/       Detailed documentation (see links below)
```

---

## Run it locally

You need **JDK 17+**, **Node 18+**, and **npm**. That's it — no database, no
extra services.

### 1. Configure environment (do this first)

Before starting either app, review the environment configuration and decide
whether the defaults work for you. The defaults assume the backend on port
`8080` and the frontend on `5173` — if either is in use locally, you must
override them before the next steps.

```bash
cd frontend
cp .env.example .env   # then edit VITE_API_BASE_URL if you changed the backend port
```

The backend reads `backend/src/main/resources/application.properties` —
edit `server.port` there if `8080` is taken. See
[Environment configuration](#environment-configuration) below for the full
list of variables and defaults.

### 2. Start the backend

```bash
cd backend
./mvnw spring-boot:run        # macOS / Linux
.\mvnw.cmd spring-boot:run    # Windows
```

Wait for `Started UserServiceApplication`. The API is on
<http://localhost:8080/api/users>.

### 3. Start the frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

Both apps come up empty of user input but pre-seeded with four sample users
(one with two addresses, one with none — to exercise the empty state).

---

## Environment configuration

Both apps fall back to sensible defaults if you skip this step, but you
should review the table below **before** running anything locally so the
frontend can reach the backend. The settings here are the overrides for any
non-default setup.

### Frontend — `frontend/.env` (optional)

Only the API base URL is configurable. A template lives at
`frontend/.env.example`:

| Variable             | Default                  | When to set it                                              |
| -------------------- | ------------------------ | ----------------------------------------------------------- |
| `VITE_API_BASE_URL`  | `http://localhost:8080`  | If you moved the backend to a different host or port.       |

To override:

```bash
cd frontend
cp .env.example .env   # then edit .env
```

`frontend/.env` (and any `.env.*.local`) is gitignored — local overrides
never get pushed.

### Backend — `backend/src/main/resources/application.properties`

| Property              | Default | When to change it                                  |
| --------------------- | ------- | -------------------------------------------------- |
| `server.port`         | `8080`  | If 8080 is in use locally. Remember to also update `VITE_API_BASE_URL`. |
| `spring.application.name` | `user-service` | No reason to change.                       |

Spring Boot also accepts these as CLI flags, e.g.
`java -jar target/user-service-0.0.1-SNAPSHOT.jar --server.port=9000`.

---

## Documentation

| Doc                                         | What's in it                                                                |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| [Tech stack](./docs/tech-stack.md)          | Languages, frameworks, and libraries used on each side, with brief rationale |
| [Backend architecture](./docs/backend.md)   | Package layout, SOLID applied concretely, exception handling, validation     |
| [Frontend architecture](./docs/frontend.md) | Router + Layout, the TanStack-Query / Zustand / Axios state boundary, file tree |
| [API reference](./docs/api.md)              | Every endpoint, request/response shapes, error envelope, validation rules    |
| [Frontend features](./docs/features.md)     | What each page/dialog does, end-to-end                                       |

---

## Out of scope

No authentication, no database (in-memory `ConcurrentHashMap`), no automated
tests, no client-side validation library. These are deliberate trade-offs for
the time-boxed exercise — discussed under each doc's "Design choices" section.
