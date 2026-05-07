# Pansar Bazar

Pansar Bazar is a full-stack e-commerce application for herbal and pansari products. It includes a React storefront, admin panel, Express API, MongoDB persistence, JWT authentication, local image uploads, cash on delivery checkout, reviews, and WhatsApp order sharing.

## Tech Stack

- Frontend: React, Vite, Ant Design, Redux Toolkit, React Router, Axios
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Auth: JWT with bcrypt password hashing
- Payments: Cash on Delivery
- Uploads: Local image storage through Multer
- Extras: Search, filters, pagination, ratings/reviews, toast notifications, WhatsApp order URL

## Folder Structure

```text
pansar-bazar/
  client/
    src/
      api/              Axios client and service wrappers
      app/              Redux store
      components/       Shared UI components
      features/         Auth and cart slices
      layouts/          Store layout
      pages/            Storefront and admin pages
      routes/           Protected route guard
      utils/            Formatting and image helpers
  server/
    src/
      config/           Database connection
      controllers/      Route handlers
      middleware/       Auth, uploads, errors
      models/           Mongoose models
      routes/           Express routes
      seed/             Seed script
      uploads/          Local uploaded product images
      utils/            Shared API utilities
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Start MongoDB locally, or update `server/.env` with your hosted MongoDB URI.

4. Seed demo data:

```bash
npm run seed
```

5. Run the app:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend API: `http://localhost:5000/api`

## Demo Accounts

Seeded admin:

- Email: `admin@pansarbazar.pk`
- Password: `Admin@12345`

Seeded customer:

- Email: `customer@pansarbazar.pk`
- Password: `Customer@12345`

## Environment

Backend variables are in `server/.env.example`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pansar-bazar
MONGO_TIMEOUT_MS=5000
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
WHATSAPP_PHONE=923217093234
UPLOAD_DIR=src/uploads
MAX_FILE_SIZE_MB=5
```

Frontend variables are in `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_UPLOAD_BASE=http://localhost:5000
VITE_WHATSAPP_PHONE=923217093234
```

## API Overview

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

Products:

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` admin
- `PUT /api/products/:id` admin
- `DELETE /api/products/:id` admin
- `POST /api/products/:id/reviews` user

Categories:

- `GET /api/categories`
- `POST /api/categories` admin
- `PUT /api/categories/:id` admin
- `DELETE /api/categories/:id` admin

Orders:

- `POST /api/orders`
- `GET /api/orders/user`
- `GET /api/orders/admin` admin
- `GET /api/orders/admin/stats` admin
- `PUT /api/orders/:id/status` admin

Users:

- `GET /api/users` admin
- `PUT /api/users/:id` admin
- `DELETE /api/users/:id` admin

## Production Notes

- Use a strong `JWT_SECRET` and a production MongoDB connection string.
- Set `CLIENT_URL` to the deployed frontend origin for CORS.
- Put uploaded files on durable storage for production deployments. The local upload adapter is intentionally simple and can be replaced by Cloudinary without changing product documents.
- Run `npm run build --workspace client` before deploying the frontend.
- Run the API with `npm run start --workspace server`.
