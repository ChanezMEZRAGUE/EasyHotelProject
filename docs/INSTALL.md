# INSTALLATION - EasyHoteling

## 1) Prerequis
- Node.js LTS
- npm
- Docker Desktop

## 2) Cloner/Ouvrir le projet
```bash
cd hotel-booking
```

## 3) Demarrer PostgreSQL
```bash
docker compose up -d
docker compose ps
```

## 4) Configurer le backend
Creer `backend/.env`:

```env
DATABASE_URL=postgresql://hotel:hotel@localhost:5432/hotel_booking?schema=public
JWT_SECRET=change-me
FRONTEND_URL=http://localhost:4200
PORT=3000
```

## 5) Initialiser Prisma + seed
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
```

## 6) Lancer le backend
```bash
npm run start:dev
```

Backend disponible sur `http://localhost:3000`  
Swagger sur `http://localhost:3000/api/docs`

## 7) Lancer le frontend
```bash
cd ../frontend
npm install
npm start
```

Frontend disponible sur `http://localhost:4200`

## 8) Verifier la base avec Prisma Studio
```bash
cd ../backend
npx prisma studio
```

## 9) Verification minimale
1. Ouvrir `http://localhost:3000/regions` et verifier que la liste des regions s'affiche.
2. Ouvrir `http://localhost:4200/search` et verifier que le menu region charge les valeurs.
3. Creer un compte, se connecter, reserver un hotel.

## Troubleshooting
- `Nest can't resolve dependencies of JwtAuthGuard`:
  verifier que `AuthModule` exporte `JwtModule` et que `ReservationsModule` importe `AuthModule`.
- `SASL: client password must be a string`:
  verifier `DATABASE_URL` dans `backend/.env`.
- Regions non chargees dans le front:
  verifier que `http://localhost:3000/regions` repond avant de lancer le front.
- Echec `ng build` (budget):
  ce n'est pas bloquant pour `ng serve` en local.
