# Tech stack

## Backend

| Tool                     | Version   | Why                                                                                       |
| ------------------------ | --------- | ----------------------------------------------------------------------------------------- |
| **Java**                 | 17+       | Language target. Tested on JDK 23, compiled at `--release 17`.                            |
| **Spring Boot**          | 3.4.1     | Web framework. Brings auto-configured Tomcat, Jackson, `@RestControllerAdvice`, validation. |
| **Spring Web**           | (starter) | REST controllers + JSON serialization out of the box.                                     |
| **Spring Validation**    | (starter) | Jakarta Bean Validation (`@NotBlank`, `@Email`, `@Size`) wired into `@Valid` request bodies. |
| **Lombok**               | 1.18.34   | Removes boilerplate: `@Data`, `@Builder`, `@RequiredArgsConstructor`, `@Slf4j`. Configured as an annotation processor in the compiler plugin. |
| **Maven**                | 3.9+      | Build tool. Wrapper (`mvnw` / `mvnw.cmd`) committed so the build runs without a global install. |

Persistence: **none** — in-memory `ConcurrentHashMap`-backed repositories
behind interfaces. JPA and H2 were considered and dropped to keep the
review focused on layering rather than infrastructure.

## Frontend

| Tool                  | Version   | Why                                                                                       |
| --------------------- | --------- | ----------------------------------------------------------------------------------------- |
| **React**             | 18.3      | UI library.                                                                               |
| **TypeScript**        | 5.6, `strict` | Type safety on every layer: API responses, hooks, props, Zustand slices.              |
| **Vite**              | 5.4       | Dev server + bundler. Fast HMR, native ESM in dev.                                        |
| **MUI (Material UI)** | 6.2       | Component library. Table, Dialog, Snackbar, form controls — everything the UI needs.      |
| **MUI Icons**         | 6.2       | Just for the add/edit/delete glyphs and arrows.                                           |
| **React Router**      | 6.28      | `createBrowserRouter` for the route config, `Outlet` for the layout.                      |
| **TanStack Query**    | 5.62      | Single source of truth for **server data** — caching, invalidation, mutation lifecycle.   |
| **Zustand**           | 5.0       | Single source of truth for **UI state only** — dialog open flags, form drafts, snackbar.  |
| **Axios**             | 1.7       | Single configured HTTP client, used inside the query/mutation functions.                  |

The split between TanStack Query (server data) and Zustand (UI state) is the
deliberate state-management boundary — explained in
[frontend architecture](./frontend.md).

## What's intentionally absent

| Not used                       | Why                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| Database / JPA / H2            | In-memory repos behind interfaces keep the review focused on layering. Swappable in one class.   |
| Authentication / authorization | Out of scope; would add Spring Security setup with no real users to gate.                        |
| Automated test suite           | Out of scope; the deliverable is the live app + curl-verifiable endpoints.                       |
| Formik / Yup / React Hook Form | Five form fields, two forms. A plain `validateUserFields` helper covers it.                      |
| Redux / Recoil / Jotai         | Zustand is enough for the small slice of UI state we actually need.                              |
