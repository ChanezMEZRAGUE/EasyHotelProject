# USAGE - EasyHoteling

## Flux utilisateur principal

## 1) Inscription / Connexion
- Aller sur `/register` pour creer un compte client.
- Aller sur `/login` pour se connecter.
- Les pages protegees (ex: `/hotel/:id`, `/my-reservations`) redirigent vers login si non connecte.

## 2) Recherche d'hotels
- Aller sur `/search`.
- Choisir:
  - region
  - date d'arrivee
  - date de depart
  - nombre de voyageurs
- Cliquer sur rechercher.

## 3) Disponibilite reelle
- La recherche appelle `GET /search/availability`.
- La disponibilite est calculee avec chevauchement des reservations:
  - overlap si `existing.check_in < requested.check_out`
  - et `existing.check_out > requested.check_in`
- Seules les chambres compatibles sont renvoyees.

## 4) Detail hotel et reservation
- Depuis `/results`, cliquer sur `Voir details`.
- Remplir le formulaire:
  - type de chambre
  - dates
  - voyageurs
  - mode de paiement autorise par les policies hotel
- Cliquer `Confirmer la reservation`.

## 5) Mes reservations
- Aller sur `/my-reservations`.
- Fonctionnalites actuelles:
  - lister ses reservations
  - modifier dates/voyageurs (`PATCH /reservations/:id`)
  - annuler (`POST /reservations/:id/cancel`)

## API utile pour demo
- `GET /regions`
- `GET /hotels?regionId=&q=`
- `GET /hotels/:id`
- `GET /search/availability?regionId=&checkIn=&checkOut=&guests=`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /reservations`
- `GET /reservations`
- `PATCH /reservations/:id`
- `POST /reservations/:id/cancel`

## Limites actuelles
- Le bouton `Payer` front n'est pas encore relie a un endpoint final.
- La logique complete de frais d'annulation (policy `cancellationFreeUntilDaysBefore`) est partielle.
