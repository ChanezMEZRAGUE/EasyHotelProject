# Backend - EasyHoteling

Backend NestJS (TypeScript) + Prisma + PostgreSQL.

## Commandes principales
```bash
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

## API locale
- Base URL: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

## Variables d'environnement
Fichier `.env`:

```env
DATABASE_URL=postgresql://hotel:hotel@localhost:5432/hotel_booking?schema=public
JWT_SECRET=change-me
FRONTEND_URL=http://localhost:4200
PORT=3000
```

## Endpoints implementes
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /regions`
- `GET /hotels`
- `GET /hotels/:id`
- `GET /search/availability`
- `POST /reservations`
- `GET /reservations`
- `PATCH /reservations/:id`
- `POST /reservations/:id/cancel`
