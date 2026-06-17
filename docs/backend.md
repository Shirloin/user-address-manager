# Backend architecture

Spring Boot 3.4 REST API, Java 17+, Lombok. Strict layering with one
concern per package.

## Package layout

```
com.assessment.userservice
├── UserServiceApplication.java       Spring Boot entry point
│
├── controller/                       HTTP only — maps requests to service calls
│   ├── UserController                /api/users + nested /addresses POST
│   └── AddressController             /api/addresses
│
├── service/                          Business logic, interface + impl
│   ├── UserService          ─┐
│   ├── UserServiceImpl       │      Constructor-injected via @RequiredArgsConstructor
│   ├── AddressService        │      Implementations are @Service beans
│   └── AddressServiceImpl   ─┘
│
├── repository/                       Data access, interface + in-memory impl
│   ├── UserRepository       ─┐
│   ├── InMemoryUserRepository│      @Repository, ConcurrentHashMap-backed
│   ├── AddressRepository     │
│   └── InMemoryAddressRepository ┘
│
├── model/                            Domain entities (no persistence annotations)
│   ├── User
│   └── Address
│
├── dto/                              Separate request and response shapes
│   ├── UserSummaryDto, UserDetailDto, AddressDto         (responses)
│   ├── CreateUserRequest, UpdateUserRequest              (user requests)
│   ├── CreateAddressRequest, UpdateAddressRequest        (address requests)
│
├── mapper/                           Model → DTO conversion
│   ├── UserMapper
│   └── AddressMapper
│
├── exception/                        Custom exceptions + advice + error envelope
│   ├── ResourceNotFoundException     → 404
│   ├── InvalidRequestException       → 400
│   ├── ApiError                      { status, message, timestamp }
│   └── GlobalExceptionHandler        @RestControllerAdvice
│
└── config/
    ├── WebConfig                     CORS for http://localhost:5173 on /api/**
    └── DataSeeder                    CommandLineRunner — seeds 4 users at startup
```

## SOLID, applied concretely

This isn't lip-service; each principle maps to a specific class pair you can
open and check.

### SRP — one responsibility per class

- **Controllers** only translate HTTP ↔ DTO. They call exactly one service
  method per endpoint, never branch on business state, never catch exceptions.
- **Services** contain business logic — required-field validation beyond what
  Bean Validation handles (e.g., case-insensitive email uniqueness), id
  generation, mapping orchestration.
- **Repositories** only store/retrieve data. No filtering business rules, no
  cross-entity logic.
- **Mappers** only build DTOs from models.

If a class is doing two of these, it's split. `UserServiceImpl` and
`UserMapper` are separate; `UserController` doesn't build DTOs itself.

### OCP — open for extension, closed for modification

`UserRepository` and `AddressRepository` are **interfaces**. Their current
implementations (`InMemoryUserRepository`, `InMemoryAddressRepository`) live
in the same package but the services never reference them by name. To swap
in JPA, Mongo, or anything else, write a new `@Repository` class —
`UserServiceImpl` doesn't change.

Same shape one layer up: `UserService` / `AddressService` are interfaces;
controllers depend on the interface, not the `*Impl`.

### LSP — substitutability

Every implementation honours its interface contract. No method throws
`UnsupportedOperationException` for an inherited operation it doesn't want
to support — if a method doesn't belong on a repository, it isn't on the
interface.

### ISP — focused interfaces

`UserService` / `UserRepository` and `AddressService` / `AddressRepository`
are split per entity rather than collapsed into a god-interface like
`DataService`. Each consumer depends only on the methods it actually uses.

### DIP — depend on abstractions

Wiring is constructor injection via Lombok's `@RequiredArgsConstructor` —
**no field injection, no `@Autowired`**:

```java
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;       // interface
    private final AddressRepository addressRepository; // interface
    private final UserMapper userMapper;
    private final AddressMapper addressMapper;
    ...
}
```

## Exception handling

Services throw custom exceptions. Controllers never `try/catch`. A single
`@RestControllerAdvice` translates everything to the same JSON envelope:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)         → 404
    @ExceptionHandler(InvalidRequestException.class)           → 400
    @ExceptionHandler(MethodArgumentNotValidException.class)   → 400 (Bean Validation)
    @ExceptionHandler(Exception.class)                         → 500
}
```

The envelope is `ApiError`:

```json
{ "status": 404, "message": "User u-99 not found", "timestamp": "2026-06-17T05:19:21Z" }
```

`MethodArgumentNotValidException` is joined into one `field: reason;
field: reason` string so the client gets every violation at once.

## Validation

Bean Validation on the request DTOs handles shape:

| Field       | Constraints                                    |
| ----------- | ---------------------------------------------- |
| `firstName` | `@NotBlank`, `@Size(max = 50)`                 |
| `lastName`  | `@NotBlank`, `@Size(max = 50)`                 |
| `email`     | `@NotBlank`, `@Email`, `@Size(max = 100)`      |
| address fields | `@NotBlank` (street, city, state, zip, country) |

Service-level rule layered on top: emails must be **case-insensitive
unique** across users. The check excludes the current user on update so
saving a profile without changing the email succeeds. Violations throw
`InvalidRequestException` → 400 with `"email is already in use"`.

## Seed data

`DataSeeder` is a `CommandLineRunner` that populates the in-memory repos
at startup:

| Id    | Name           | Addresses           |
| ----- | -------------- | ------------------- |
| `u-1` | Ada Lovelace   | 2 (London, Cambridge) |
| `u-2` | Alan Turing    | 1 (Wilmslow)        |
| `u-3` | Grace Hopper   | 1 (Arlington VA)    |
| `u-4` | Linus Torvalds | **0** (intentional — exercises the empty state) |
