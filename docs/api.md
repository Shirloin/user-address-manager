# API reference

Base URL: `http://localhost:8080`

All endpoints return `application/json` and are CORS-open for
`http://localhost:5173` on `/api/**`.

## Endpoints

| Method | Path                              | Status        | Returns               |
| ------ | --------------------------------- | ------------- | --------------------- |
| GET    | `/api/users`                      | 200           | `UserSummaryDto[]`    |
| GET    | `/api/users/{id}`                 | 200 / 404     | `UserDetailDto`       |
| POST   | `/api/users`                      | 201 / 400     | `UserSummaryDto`      |
| PUT    | `/api/users/{id}`                 | 200 / 400 / 404 | `UserDetailDto`     |
| POST   | `/api/users/{id}/addresses`       | 201 / 400 / 404 | `AddressDto`        |
| PUT    | `/api/addresses/{addressId}`      | 200 / 400 / 404 | `AddressDto`        |
| DELETE | `/api/addresses/{addressId}`      | 204 / 404     | —                     |

## Response shapes

### `UserSummaryDto`

```json
{
  "id": "u-1",
  "email": "ada.lovelace@example.com",
  "firstName": "Ada",
  "lastName": "Lovelace"
}
```

Used by the list endpoint and the create endpoint (newly created users have
no addresses yet).

### `UserDetailDto`

```json
{
  "id": "u-1",
  "email": "ada.lovelace@example.com",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "addresses": [
    {
      "id": "5eb56649-c38e-4254-ae91-e2d8d4d7d8d4",
      "userId": "u-1",
      "street": "10 St James's Square",
      "city": "London",
      "state": "England",
      "zip": "SW1Y 4LE",
      "country": "UK"
    }
  ]
}
```

### `AddressDto`

```json
{
  "id": "5eb56649-c38e-4254-ae91-e2d8d4d7d8d4",
  "userId": "u-1",
  "street": "10 St James's Square",
  "city": "London",
  "state": "England",
  "zip": "SW1Y 4LE",
  "country": "UK"
}
```

## Request shapes

### `CreateUserRequest` / `UpdateUserRequest`

```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "ada.lovelace@example.com"
}
```

### `CreateAddressRequest` / `UpdateAddressRequest`

```json
{
  "street": "10 St James's Square",
  "city": "London",
  "state": "England",
  "zip": "SW1Y 4LE",
  "country": "UK"
}
```

## Validation rules

User requests:

| Field       | Constraints                                    |
| ----------- | ---------------------------------------------- |
| `firstName` | required, max 50 characters                    |
| `lastName`  | required, max 50 characters                    |
| `email`     | required, valid format, max 100 characters, **unique** (case-insensitive) across users |

Address requests:

| Field      | Constraints                                  |
| ---------- | -------------------------------------------- |
| `street`, `city`, `state`, `zip`, `country` | required |

## Error envelope

Every error response uses the same shape (`ApiError`):

```json
{
  "status": 400,
  "message": "firstName: firstName is required; email: email must be a valid address",
  "timestamp": "2026-06-17T05:19:21Z"
}
```

| Status | When                                                                     |
| ------ | ------------------------------------------------------------------------ |
| 400    | Bean Validation failures (`message` lists every field violation joined by `; `), or business rules like `"email is already in use"` |
| 404    | Path id doesn't resolve to a user/address                                |
| 500    | Unhandled exception — logged with stack trace server-side, generic message client-side |

## curl quick reference

```bash
# List users
curl http://localhost:8080/api/users

# Get user detail (with addresses)
curl http://localhost:8080/api/users/u-1

# Create a user (201)
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Marie","lastName":"Curie","email":"marie@example.com"}'

# Update a user (200)
curl -X PUT http://localhost:8080/api/users/u-1 \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Ada","lastName":"Lovelace","email":"ada.lovelace@example.com"}'

# Add an address (201)
curl -X POST http://localhost:8080/api/users/u-4/addresses \
  -H "Content-Type: application/json" \
  -d '{"street":"1 Linux Way","city":"Portland","state":"OR","zip":"97201","country":"USA"}'

# Update an address (200)
curl -X PUT http://localhost:8080/api/addresses/<addressId> \
  -H "Content-Type: application/json" \
  -d '{"street":"2 Linux Way","city":"Portland","state":"OR","zip":"97201","country":"USA"}'

# Delete an address (204)
curl -X DELETE http://localhost:8080/api/addresses/<addressId>
```
