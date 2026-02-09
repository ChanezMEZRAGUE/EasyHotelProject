# EasyHoteling - Hotel Booking (M2 Logiciels sûrs)

EasyHoteling is a full-stack hotel booking web application built entirely in **TypeScript**.
It uses **Angular** for the frontend and **NestJS + Prisma + PostgreSQL** for the backend.

## Features (current MVP)
- Search hotels and view results
- Hotel details with room types
- User registration & login (JWT)
- REST API documented with Swagger
- Seed data for demo (regions, hotels, room types)

## Tech Stack
- Frontend: Angular + Angular Material + SCSS
- Backend: NestJS (ts-node), Prisma ORM
- Database: PostgreSQL
- Auth: JWT
- API docs: Swagger / OpenAPI

## Repository Structure
```
hotel-booking/
  backend/
  frontend/
  docs/
  postman/
  docker-compose.yml
  README.md
```

## Prerequisites
- Node.js (LTS)
- Docker Desktop (for PostgreSQL)
- npm

## Local Setup (Quick Start)
### 1) Start the database
```
cd hotel-booking
docker compose up -d
```

### 2) Backend
```
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

### 3) Frontend
```
cd frontend
npm install
npm start
```

## URLs
- Frontend: http://localhost:4200
- Backend: http://localhost:3000
- Swagger: http://localhost:3000/api/docs

## Tests (to complete)
- Unit tests: Jest (backend)
- API tests: Postman collection

## Documentation
- docs/INSTALL.md
- docs/USAGE.md
- docs/AI_REPORT.md

## Deployment (planned)
- Backend: Azure / Render / Railway
- Frontend: Azure Static Web Apps / Netlify / Vercel

---

