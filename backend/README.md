# Backend — Express + Supabase Postgres API

The API stores products, users, and orders in Supabase Postgres using the `pg`
driver. It requires **Node.js 24+**.

## Running

```bash
npm install
npm run dev     # watch mode
# or
npm start
```

The server listens on `http://localhost:5000` by default. On startup, it creates
the required tables and indexes in Supabase, then inserts demo data if all three
tables are empty (disable demo data with `SEED=false`).

Set `DATABASE_URL` in `.env` to the Supabase Postgres connection string. Use the
Supabase pooler connection string and keep this value private.
For TLS certificate verification, download the project's CA certificate from
Supabase and set `DATABASE_SSL_CA` to its path. Without it, TLS encryption is
used but the certificate chain is not verified. The certificate path is
resolved relative to the backend working directory.

## Data model

```
users (uid) ──< orders (oid, uid, pid) >── products (pid)
```

The backend creates the tables and indexes on startup. The schema contains
`products (pid, pname, description, price, qty)`,
`users (uid, uname, email, password)`, and
`orders (oid, uid, pid, order_date)`.

`orders` is the join table that gives users a **one-to-many** relationship with
orders and products a **one-to-many** relationship with orders. Deleting either
parent removes its orders (`ON DELETE CASCADE`).

Passwords are stored as `scrypt:<salt>:<derivedKey>` and are never included in
API responses. Use the server-side `DATABASE_URL`; never expose database
credentials in frontend variables.

## Response format

- List endpoints return a JSON array.
- Single-record and mutation endpoints return the record object.
- Errors return `{ "error": "message" }`.
- Validation errors use HTTP `400`, missing records `404`, duplicate email `409`.

## Products

| Method | Path | Body |
| --- | --- | --- |
| GET | `/api/get_products` | — |
| GET | `/api/get_product/:id` | — |
| POST | `/api/add_product` | `pname`, `description`, `price`, `qty` |
| PUT | `/api/update_product/:id` | Any of `pname`, `description`, `price`, `qty` |
| PUT | `/api/update/:id` | Alias for `update_product` (original spec) |
| DELETE | `/api/delete_product/:id` | — |

Rules:

- `pname` is required, trimmed, max 120 characters.
- `price` is a number `>= 0` (rounded to 2 decimals).
- `qty` is a whole number `>= 0`.
- `description` is optional (max 1000 characters).
- Updates are partial: send only the fields you want to change.

Example:

```bash
curl -X POST http://localhost:5000/api/add_product \
  -H "Content-Type: application/json" \
  -d '{"pname":"Wireless Mouse","description":"2.4 GHz","price":25.99,"qty":40}'
```

```json
{
  "pid": 1,
  "pname": "Wireless Mouse",
  "description": "2.4 GHz",
  "price": 25.99,
  "qty": 40
}
```

Deleting a product also deletes its orders. The response includes the deleted
product:

```json
{
  "message": "Product deleted successfully",
  "product": { "pid": 1, "pname": "Wireless Mouse", "...": "..." }
}
```

## Users

| Method | Path | Body |
| --- | --- | --- |
| GET | `/api/get_users` | — |
| GET | `/api/get_user/:id` | — |
| POST | `/api/add_user` | `uname`, `email`, `password` |
| PUT | `/api/update_user/:id` | Any of `uname`, `email`, `password` |
| DELETE | `/api/delete_user/:id` | — |

Rules:

- `uname` is required, max 80 characters.
- `email` must be valid and unique (case-insensitive).
- `password` must be at least 6 characters on create.
- On update, omit `password` (or send `""`) to keep the current password.
- Responses contain only `uid`, `uname`, and `email`.

Example:

```bash
curl -X POST http://localhost:5000/api/add_user \
  -H "Content-Type: application/json" \
  -d '{"uname":"Jane Doe","email":"jane@example.com","password":"secret123"}'
```

```json
{ "uid": 4, "uname": "Jane Doe", "email": "jane@example.com" }
```

Deleting a user also deletes their orders.

## Orders

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/get_orders` | All orders; supports `?uid=1`, `?pid=2`, or both |
| GET | `/api/get_order/:id` | One order by `oid` |
| GET | `/api/get_orders/user/:uid` | Orders belonging to a user (alias `/api/get_orders/uid/:uid`) |
| GET | `/api/get_orders/product/:pid` | Orders containing a product (alias `/api/get_orders/pid/:pid`) |
| POST | `/api/add_order` | Create an order |
| PUT | `/api/update_order/:id` | Update an order |
| DELETE | `/api/delete_order/:id` | Delete an order |

Body fields:

- `uid` — required user id (must exist)
- `pid` — required product id (must exist)
- `order_date` — optional ISO date/time on create (defaults to now)

Updates are partial and re-validate referenced users/products.

Order responses include joined display data:

```json
{
  "oid": 1,
  "uid": 1,
  "pid": 1,
  "order_date": "2026-11-06T10:30:00.000Z",
  "uname": "Alice Johnson",
  "email": "alice@example.com",
  "pname": "Wireless Mouse",
  "price": 25.99
}
```

Examples:

```bash
# Add
curl -X POST http://localhost:5000/api/add_order \
  -H "Content-Type: application/json" \
  -d '{"uid":1,"pid":1,"order_date":"2026-11-06T10:30:00.000Z"}'

# Filter by user and product
curl "http://localhost:5000/api/get_orders?uid=1&pid=1"
curl "http://localhost:5000/api/get_orders/user/1"
curl "http://localhost:5000/api/get_orders/product/1"
```

> The original spec named the filters `api/get_orders/uid` and
> `api/get_orders/pid`. Two routes cannot share that exact shape without
> ambiguity, so this implementation uses explicit `user` / `product` prefixes
> plus query parameters. The frontend uses these routes.

## Error examples

```json
{ "error": "Product with id 99 was not found" }
{ "error": "A user with this email address already exists" }
{ "error": "\"price\" must be greater than or equal to 0" }
```

## CORS and configuration

Local development origins (`http://localhost:<port>` and
`http://127.0.0.1:<port>`) are allowed automatically. For other origins, set
`CORS_ORIGIN` to a comma-separated list, or `*` to allow everything.

## Project files

| File | Purpose |
| --- | --- |
| `src/server.js` | Starts the HTTP server |
| `src/app.js` | Express middleware, CORS, 404 and error handling |
| `src/db.js` | Database connection, schema, seed data |
| `src/routes/products.js` | Product endpoints |
| `src/routes/users.js` | User endpoints |
| `src/routes/orders.js` | Order endpoints |
| `src/lib/validators.js` | Input parsing and validation |
| `src/lib/password.js` | scrypt password hashing |
| `src/lib/http-error.js` | HTTP error helper |
