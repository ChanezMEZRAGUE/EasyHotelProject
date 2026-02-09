# AI_REPORT - Usage de l'IA dans EasyHoteling

## Contexte
Ce document decrit l'usage de l'IA pendant le developpement du projet EasyHoteling (frontend Angular + backend NestJS/Prisma).

## Taches ou l'IA a aide
- Structuration du projet en mono-repo (`frontend`, `backend`, `docs`, `postman`).
- Correction d'erreurs TypeScript/NestJS/Angular (DI modules, typing forms, guards, appels API).
- Mise en place des endpoints backend:
  - auth
  - hotels/regions
  - search availability avec logique de chevauchement
  - reservations create/list/update/cancel
- Generation et ajustement de seed Prisma (regions/hotels/room_types).
- Assistance sur la coherence front-back (mapping DTO/models).
- Aide a la redaction de la documentation.

## Ce qui a ete verifie manuellement
- Demarrage local:
  - PostgreSQL (docker compose)
  - backend Nest
  - frontend Angular
- Tests manuels des flux:
  - inscription/connexion
  - recherche
  - creation reservation
  - modification/annulation reservation
- Verification des donnees dans Prisma Studio.
- Verification des endpoints dans Swagger.

## Limites et points d'attention
- Certaines propositions IA ont necessite correction manuelle (ex: wiring de modules NestJS, details UX).
- L'IA peut proposer des endpoints non alignes avec l'etat reel; verification dans le code obligatoire.
- Le build frontend peut echouer sur les budgets Angular configures: ce n'est pas une erreur fonctionnelle de logique metier.

## Valeur ajoutee
- Acceleration du debug et du scaffolding technique.
- Gain de temps sur la generation de code repetitif (DTO/services/controllers).
- Support utile pour structurer les livrables de soutenance (README/docs).
