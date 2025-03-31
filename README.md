# Auth API Starter (Node.js + TypeScript + Prisma)

A minimal, secure, and production-ready authentication backend built with:

- ✅ **Express** for routing  
- ✅ **TypeScript** for type safety  
- ✅ **Prisma** + **PostgreSQL** (Kinsta Sevalla compatible)  
- ✅ **JWT** access & refresh tokens  
- ✅ **Bcrypt** for password hashing  
- ✅ **HTTP-only cookies** for refresh tokens  
- ✅ Clean, MVC-ish folder structure  

---

## 🔐 API Routes

| Method | Route              | Description                |
| ------ | ------------------ | -------------------------- |
| POST   | `/signup`          | Register a new user        |
| POST   | `/login`           | Log in user                |
| POST   | `/logout`          | Clear refresh token cookie |
| POST   | `/refresh-token`   | Get new access token       |
| POST   | `/forgot-password` | Initiate password reset    |
| POST   | `/reset-password`  | Complete password reset    |
| GET    | `/protected`       | Test protected route       |

---

## Create `.env` file

```bash
DATABASE_URL=postgresql://user:password@host:port/dbname
ACCESS_TOKEN_SECRET=youraccesstokensecret
REFRESH_TOKEN_SECRET=yourrefreshtokensecret
```

> Use `openssl` rand `-base64 32` to generate strong secrets

## Run migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## Start the dev server

```bash
npm run dev
```