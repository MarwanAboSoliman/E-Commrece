# E-Commerce API Routes Documentation

Your job is to implement all the backend for this e-commerce project. The frontend is fully built — you need to create the server, database, middleware, routes, and validation.

## Project Structure

```
├── .env                  ← you create (JWT_SECRET) //Done✅
├── data.json             ← you create (empty DB) //Done✅
├── db.js                 ← you create (file-based DB helper) //Done✅
├── index.js              ← you create (Express app entry) //Done✅
├── middleware/
│   ├── checkAuth.js      ← you create (JWT verification)//Done✅
│   ├── checkRole.js      ← you create (role guard)//Done✅
│   └── validateBody.js   ← you create (Zod validation) //done✅
├── routes/
│   ├── auth.routes.js    ← you create //done✅
│   ├── products.routes.js← you create //done✅
│   ├── cart.routes.js    ← you create //done✅
│   ├── orders.routes.js  ← you create //done✅
│   └── pages.routes.js   ← already provided (DO NOT MODIFY)
├── schema/
│   ├── auth/
│   │   ├── login.schema.js //done✅
│   │   └── register.schema.js // done✅
│   ├── product.schema.js //done ✅
│   └── cart.schema.js //done✅
├── package.json          ← already provided //done✅
└── pages/                ← already provided (DO NOT MODIFY) //done✅
```

## Packages to Install

```bash
npm install bcrypt cookie-parser jsonwebtoken zod
```

---

## data.json Structure

```json
{
  "auth_users": [],
  "products": [],
  "carts": [],
  "orders": []
}
```

---

## API Routes

### Auth Routes (`/auth`)

#### POST `/auth/register`

Register a new user.

**Request Body:**

```json
{
  "username": "string (min 2 chars)",
  "email": "string (valid email)",
  "password": "string (min 8, must have uppercase, lowercase, digit, special char)",
  "password_confirmation": "string (must match password)",
  "role": "customer" | "merchant"
}
```

**Success Response (201):**

```json
{ "message": "register successful, you can now login" }
```

**Error Response (422):**

```json
{
  "errors": {
    "email": { "errors": ["email already in use"] },
    "password": { "errors": ["password must contain..."] }
  }
}
```

---

#### POST `/auth/login`

Login and receive JWT cookie.

**Request Body:**

```json
{
  "email": "string (valid email)",
  "password": "string (min 8)"
}
```

**Success Response (200):**

```json
{
  "message": "login successful",
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "username": "string",
      "role": "customer" | "merchant"
    }
  }
}
```

Also sets an httpOnly cookie named `node_api_token` containing the JWT.

**Error Response (422):**

```json
{ "error": "email or password are invalid" }
```

---

#### POST `/auth/logout`

Clear the JWT cookie.

**Success Response (200):**

```json
{ "message": "logout successful" }
```

---

### Product Routes (`/api/products`)

#### GET `/api/products`

List all products. **No auth required.**

**Query Parameters:**

- `search` (optional) — filter by name or description (case-insensitive)

**Success Response (200):**

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": number,
      "image": "string (URL or empty)"
    }
  ]
}
```

---

#### GET `/api/products/:id`

Get a single product. **No auth required.**

**Success Response (200):**

```json
{
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": number,
    "image": "string"
  }
}
```

**Error Response (404):**

```json
{ "error": "product not found" }
```

---

#### POST `/api/products`

Create a product. **Auth required, role: merchant.**

**Request Body:**

```json
{
  "name": "string (min 1)",
  "description": "string (min 1)",
  "price": number (positive),
  "image": "string (URL, optional, defaults to empty)"
}
```

**Success Response (201):**

```json
{
  "message": "product created successfully",
  "data": { "id": "string", "name": "...", "description": "...", "price": ..., "image": "..." }
}
```

---

#### PATCH `/api/products/:id`

Update a product. **Auth required, role: merchant.**

**Request Body:** Same as POST, all fields optional (partial update).

**Success Response (200):**

```json
{
  "message": "product updated successfully",
  "data": { ...updated product }
}
```

---

#### DELETE `/api/products/:id`

Delete a product. **Auth required, role: merchant.**

**Success Response (204):** No body.

---

### Cart Routes (`/api/cart`)

All cart routes require auth and role `customer`.

#### GET `/api/cart`

Get the current user's cart.

**Success Response (200):**

```json
{
  "data": {
    "id": "string (cart id)",
    "userId": "string",
    "products": [
      {
        "id": "string (product id)",
        "name": "string",
        "description": "string",
        "price": number,
        "image": "string",
        "quantity": number
      }
    ]
  }
}
```

If no cart exists yet, returns `{ "data": { "id": null, "userId": "...", "products": [] } }`.

---

#### POST `/api/cart`

Add a product to cart. If product already exists in cart, increase its quantity.

**Request Body:**

```json
{
  "id": "string (product id)",
  "name": "string",
  "description": "string",
  "price": number,
  "image": "string",
  "quantity": number (positive integer)
}
```

**Success Response (201):**

```json
{ "message": "product added to cart", "data": { ...cart } }
```

---

#### PATCH `/api/cart/:productId`

Update quantity of a product in cart.

**Request Body:**

```json
{ "quantity": number (positive integer) }
```

**Success Response (200):**

```json
{ "message": "cart updated", "data": { ...cart } }
```

---

#### DELETE `/api/cart/:productId`

Remove a product from cart.

**Success Response (200):**

```json
{ "message": "product removed from cart" }
```

---

### Order Routes (`/api/orders`)

All order routes require auth and role `customer`.

#### GET `/api/orders`

Get all orders for the current user.

**Success Response (200):**

```json
{
  "data": [
    {
      "id": "string",
      "userId": "string",
      "products": [
        {
          "id": "string",
          "name": "string",
          "description": "string",
          "price": number,
          "image": "string",
          "quantity": number
        }
      ],
      "total": number,
      "status": "pending",
      "createdAt": "ISO date string"
    }
  ]
}
```

---

#### POST `/api/orders/checkout`

Convert cart to order and clear cart.

**Success Response (201):**

```json
{
  "message": "order placed successfully",
  "data": {
    "id": "string",
    "userId": "string",
    "products": [ ... ],
    "total": number,
    "status": "pending",
    "createdAt": "ISO date string"
  }
}
```

**Error Response (422):**

```json
{ "error": "cart is empty" }
```

---

## Page Routes

These routes serve HTML files. Protected pages check JWT from cookie and redirect to `/login.html` if not authenticated or wrong role.

| Route                                | Auth | Role     | Serves                             |
| ------------------------------------ | ---- | -------- | ---------------------------------- |
| `/login.html`                        | No   | —        | `pages/login.html`                 |
| `/register.html`                     | No   | —        | `pages/register.html`              |
| `/products.html`                     | No   | —        | `pages/products.html`              |
| `/product.html?id=...`               | No   | —        | `pages/product.html`               |
| `/home.html`                         | Yes  | Any      | `pages/home.html`                  |
| `/cart.html`                         | Yes  | Customer | `pages/cart.html`                  |
| `/orders.html`                       | Yes  | Customer | `pages/orders.html`                |
| `/merchant/products.html`            | Yes  | Merchant | `pages/merchant/products.html`     |
| `/merchant/product-form.html?id=...` | Yes  | Merchant | `pages/merchant/product-form.html` |

Any other path should serve `pages/404.html` with status 404.

---

## Middleware You Need to Create

### `checkAuth`

- Read JWT from `req.cookies.node_api_token`
- Verify with `process.env.JWT_SECRET`
- Attach decoded user to `req.user`
- Return 401 `{ error: "invalid token" }` on failure

### `checkRole(...roles)`

- Return middleware that checks `req.user.role` is in `roles`
- Return 403 `{ error: "forbidden" }` if not
- For API routes (returns JSON)

### `checkPageRole(...roles)`

- Same as checkRole but redirects to `/login.html` instead of returning JSON
- For page routes

### `validateBody(schema)`

- Take a Zod schema
- Call `schema.safeParse(req.body)`
- If success → `next()`
- If error → return 422 `{ errors: z.treeifyError(result.error).properties }`

---

## Notes

- JWT should be stored in an httpOnly cookie named `node_api_token` with `sameSite: "lax"` and 1-hour expiry
- The JWT payload should contain `{ id, email, username, role }`
- The frontend stores user data in localStorage after login (the `setUser()` call) — do NOT modify frontend files
- The `db.js` helper should have: `getById`, `getAll`, `getOne` (by query object), `create`, `update`, `delete`, `deleteWhere`, `raw`
- Use `process.loadEnvFile()` in files that need `.env`
- Use ES modules (`"type": "module"` in package.json)
