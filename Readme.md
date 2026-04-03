# Brand Essence - Full Stack Perfume E-commerce

Brand Essence is a full stack perfume e-commerce application with:
- A Node.js + Express + Sequelize backend
- A React + Vite + TypeScript frontend
- MySQL as the primary database

It includes user authentication, product catalog browsing, filters/search, cart, wishlist, orders, reviews, coupons, banners, and admin management endpoints/pages.

## Tech Stack

### Backend
- Node.js
- Express.js
- Sequelize
- MySQL
- JWT auth (`jsonwebtoken`)
- File upload support (`multer`)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui + Radix UI
- Axios
- TanStack Query

## Repository Structure

```text
.
|- backend/
|  |- config/
|  |- controllers/
|  |- middleware/
|  |- models/
|  |- routes/
|  |- seeds/
|  |- uploads/
|  |- docker-compose.yml
|  |- server.js
|  `- BACKEND_API_README.md
|- frontend/
|  |- src/
|  |- index.html
|  `- vite.config.ts
`- Readme.md
```

## Prerequisites

- Node.js 18+ (recommended)
- npm
- Docker Desktop (recommended for local MySQL)

## Quick Start (Recommended)

### 1) Start database (Docker)

From `backend/`:

```bash
docker-compose up -d
```

This starts:
- MySQL on `localhost:3306`
- phpMyAdmin on `http://localhost:8081`

### 2) Configure backend environment

Create `backend/.env`:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=essence_user
DB_PASSWORD=essence_password
DB_NAME=essence_db
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d
```

### 3) Install backend dependencies and run

From `backend/`:

```bash
npm install
npm run dev
```

Backend API runs at `http://localhost:5000`.

### 4) Seed sample data (optional, but useful)

From `backend/`:

```bash
npm run seed
```

This seeds brands, categories, products, users, reviews, coupons, and banners.

### 5) Install frontend dependencies and run

From `frontend/`:

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:8080`.

## Frontend Environment (Optional)

The frontend uses:
- `VITE_API_BASE_URL` if provided
- otherwise defaults to `http://localhost:5000/api` in development

If you want to override API URL, create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Default Seeded Login

After running `npm run seed` in `backend/`:

- Admin
	- Email: `admin@brandessence.com`
	- Password: `password123`
- User
	- Email: `priya@email.com`
	- Password: `password123`

## Available Scripts

### Backend (`backend/package.json`)
- `npm run dev` - start backend with nodemon
- `npm start` - start backend in production mode
- `npm run seed` - seed database
- `npm run clear-db` - clear/reset database data

### Frontend (`frontend/package.json`)
- `npm run dev` - start Vite dev server
- `npm run build` - build production bundle
- `npm run preview` - preview production build
- `npm run lint` - run ESLint
- `npm run test` - run tests once (Vitest)
- `npm run test:watch` - run tests in watch mode

## API Overview

Base API path: `/api`

Primary route groups:
- `/api/auth`
- `/api/products`
- `/api/brands`
- `/api/categories`
- `/api/cart`
- `/api/wishlist`
- `/api/orders`
- `/api/reviews`
- `/api/coupons`
- `/api/banners`
- `/api/admin`

Health endpoint:
- `GET /health`

For full endpoint docs and payload examples, see:
- `backend/BACKEND_API_README.md`

## Notes

- Backend auto-syncs Sequelize models on startup (`sequelize.sync({ alter: true })`).
- Uploaded files are served from `backend/uploads` via `/uploads`.
- In frontend development, Vite also proxies `/api` requests to `http://localhost:5000`.

## Troubleshooting

- Database connection fails:
	- Ensure Docker containers are running and healthy.
	- Verify `backend/.env` database credentials match `backend/docker-compose.yml`.
- Port already in use:
	- Change backend `PORT` or frontend Vite port in `frontend/vite.config.ts`.
- Login returns unauthorized:
	- Re-seed database (`npm run seed`) and retry using seeded credentials.

## License

This project is currently unlicensed for public reuse. Add a license file if you plan to distribute it.
