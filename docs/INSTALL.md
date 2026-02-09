# Installation Guide (EasyHoteling)

This guide explains how to install and run the project locally.

## Prerequisites
- Node.js (LTS)
- npm
- Docker Desktop (for PostgreSQL)

## 1) Clone and open the project
```
cd hotel-booking
```

## 2) Start the database (PostgreSQL)
```
docker compose up -d
```

Check status:
```
docker compose ps
```

## 3) Backend setup
```
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

Backend runs on: http://localhost:3000
Swagger docs: http://localhost:3000/api/docs

## 4) Frontend setup
```
cd ../frontend
npm install
npm start
```

## 5) Voir la base avec Prisma Studio
cd backend
npx prisma studio


Frontend runs on: http://localhost:4200

## Troubleshooting
- **DB connection error**: ensure Docker is running and `DATABASE_URL` is correct in `backend/.env`.
- **Prisma errors**: run `npx prisma generate`.
- **CORS**: check `FRONTEND_URL` in `backend/.env`.

## Environment Variables (backend/.env)
```
DATABASE_URL=postgresql://hotel:hotel@localhost:5432/hotel_booking?schema=public
JWT_SECRET=change-me
FRONTEND_URL=http://localhost:4200
```
