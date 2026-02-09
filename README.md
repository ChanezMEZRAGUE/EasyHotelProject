# EasyHoteling (M2 Logiciels sures)

Application web de reservation d'hotels developpee completement en TypeScript:
- Frontend: Angular
- Backend: NestJS (ts-node)
- Base de donnees: PostgreSQL + Prisma

## Fonctionnalites implementees
- Authentification client: `register`, `login`, `me` (JWT)
- Chargement des regions depuis la base
- Recherche de disponibilite avec logique de chevauchement:
  - endpoint `GET /search/availability`
  - filtre par `regionId`, `checkIn`, `checkOut`, `guests`
  - ne retourne que les chambres avec `capacity >= guests` et `availableRooms > 0`
- Liste des hotels (`GET /hotels`) et detail (`GET /hotels/:id`)
- Creation de reservation (`POST /reservations`)
- Liste des reservations utilisateur (`GET /reservations`)
- Modification de reservation (`PATCH /reservations/:id`)
- Annulation de reservation (`POST /reservations/:id/cancel`)
- Swagger disponible en local

## Fonctionnalites non finalisees
- Paiement visuel via endpoint dedie (`POST /reservations/:id/pay`)
- Suite de tests automatisee complete (unitaires + Postman export final)
- Deploiement cloud final documente (URLs de production)

## Stack technique
- Frontend: Angular + Angular Material + SCSS
- Backend: NestJS + class-validator + JWT
- ORM: Prisma
- Database: PostgreSQL
- API docs: Swagger/OpenAPI (`/api/docs`)

## Structure du projet
```text
hotel-booking/
  backend/
  frontend/
  docs/
  postman/
  docker-compose.yml
  README.md
```

## Prerequis
- Node.js LTS
- npm
- Docker Desktop

## Installation rapide
1. Demarrer la base:
```bash
docker compose up -d
```

2. Backend:
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

3. Frontend:
```bash
cd ../frontend
npm install
npm start
```

## URLs locales
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`
- Prisma Studio: `http://localhost:5555` (apres `npx prisma studio` dans `backend`)

## Variables d'environnement backend
Fichier `backend/.env`:

```env
DATABASE_URL=postgresql://hotel:hotel@localhost:5432/hotel_booking?schema=public
JWT_SECRET=change-me
FRONTEND_URL=http://localhost:4200
PORT=3000
```

## Tests
- Backend unit tests:
```bash
cd backend
npm test
```

- Build backend:
```bash
cd backend
npm run build
```

Note: le build frontend peut echouer sur le budget Angular configure (`initial exceeded maximum budget`) meme si les fonctionnalites tournent en `ng serve`.

## Documentation detaillee
- `docs/INSTALL.md`
- `docs/USAGE.md`
- `docs/AI_REPORT.md`
