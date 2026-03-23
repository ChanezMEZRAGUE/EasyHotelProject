# USAGE - EasyHoteling

## Flux utilisateur principal

## 1) Inscription / Connexion
- Aller sur `/register` pour creer un compte client.
- Aller sur `/login` pour se connecter.
- Les pages protegees (ex: `/hotel/:id`, `/my-reservations`) redirigent vers login si non connecte.
- Le bouton de deconnexion redirige automatiquement vers `/search`.

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
- La page affiche la politique d'annulation de l'hotel (J-X ou pas d'annulation gratuite).

## 5) Mes reservations
- Aller sur `/my-reservations`.
- Fonctionnalites actuelles:
  - lister ses reservations
  - modifier dates/voyageurs (`PATCH /reservations/:id`)
  - annuler (`POST /reservations/:id/cancel`)
  - payer via popup carte simulee (`POST /reservations/:id/pay`)
  - statut de paiement visible (a payer, planifie, paye, non requis)

## 6) Mon compte
- Aller sur `/account`.
- Afficher le profil courant (`GET /auth/me`).
- Modifier prenom, nom et telephone (`PATCH /auth/me`).

## API utile 
- `GET /regions`
- `GET /hotels?regionId=&q=`
- `GET /hotels/:id`
- `GET /search/availability?regionId=&checkIn=&checkOut=&guests=`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PATCH /auth/me`
- `POST /reservations`
- `GET /reservations`
- `PATCH /reservations/:id`
- `POST /reservations/:id/cancel`
- `POST /reservations/:id/pay`

## Tests livres avec le projet
- Tests unitaires backend (Jest):
  - disponibilite/chevauchement
  - paiement (`POST /reservations/:id/pay`) cas OK et cas refuses
  - auth (hash + validation login/register)
- Tests API Postman/Newman:
  - regions
  - recherche de disponibilite
  - register/login
  - create/list/update/cancel/pay reservation

## Limites actuelles
- Deploiement cloud final a documenter (URL publique backend/frontend).
