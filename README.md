# Fashion AI Platform

Plateforme intelligente de création de vêtements personnalisés par IA et mise en relation avec des couturières professionnelles.

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript, Prisma ORM |
| Base de données | PostgreSQL 16 |
| Cache & Queue | Redis 7, BullMQ |
| IA générative | Replicate (Stable Diffusion XL) |
| Paiement | Stripe |
| Data Engineering | GCP Pub/Sub, BigQuery, dbt, Airflow |
| Hébergement | Scaleway (app) + GCP (data) |

---

## Démarrage rapide

### Prérequis

- Node.js 20+
- Docker & Docker Compose
- npm 10+

### 1. Cloner et installer

```bash
git clone https://github.com/votre-username/fashion-ai-platform.git
cd fashion-ai-platform
npm install
```

### 2. Configuration

```bash
cp .env.example .env.local
# Éditez .env.local avec vos valeurs
```

### 3. Démarrer l'infrastructure locale

```bash
docker compose up -d
# Lance : PostgreSQL, Redis, MinIO (storage), Mailpit (emails)
```

**Interfaces disponibles après démarrage :**
- PostgreSQL : `localhost:5432`
- Redis Commander (UI) : `http://localhost:8081`
- MinIO Console : `http://localhost:9001` (fap_minio_user / fap_minio_password)
- Mailpit (emails) : `http://localhost:8025`

### 4. Générer les clés JWT

```bash
# Générer la paire de clés RSA pour JWT RS256
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

# Copier les clés dans .env.local (en une ligne avec \n)
# JWT_PRIVATE_KEY="$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' private.pem)"
# JWT_PUBLIC_KEY="$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' public.pem)"
```

### 5. Initialiser la base de données

```bash
# Appliquer les migrations Prisma
npm run db:migrate

# (Optionnel) Insérer des données de test
npm run db:seed

# (Optionnel) Ouvrir Prisma Studio
npm run db:studio
```

### 6. Lancer le développement

```bash
# Lancer frontend + backend en parallèle
npm run dev

# Ou séparément :
npm run dev:api   # Backend : http://localhost:3001
npm run dev:web   # Frontend : http://localhost:3000
```

---

## Structure du projet

```
fashion-ai-platform/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   └── src/
│   │       ├── auth/           # Authentification JWT
│   │       ├── designs/        # Génération IA
│   │       ├── couturieres/    # Marketplace
│   │       ├── orders/         # Commandes
│   │       ├── messages/       # Messagerie Socket.io
│   │       ├── billing/        # Stripe
│   │       ├── events/         # GCP Pub/Sub
│   │       ├── prisma/         # Client Prisma
│   │       └── admin/          # Dashboard admin
│   └── web/                    # Frontend Next.js
│       └── src/
│           ├── app/            # App Router Next.js
│           ├── components/     # Composants React
│           ├── lib/            # Utilitaires
│           └── styles/         # Tailwind CSS
├── packages/
│   ├── db/                     # Schéma Prisma partagé
│   │   └── prisma/
│   │       ├── schema.prisma   # Schéma complet (7 tables)
│   │       ├── migrations/     # Migrations versionnées
│   │       └── seed.ts         # Données de test
│   └── shared/                 # Types et utilitaires partagés
├── docker/
│   └── postgres/
│       └── init.sql            # Extensions PostgreSQL
├── docker-compose.yml          # Infrastructure locale
├── .env.example                # Template variables d'environnement
└── package.json                # Monorepo root
```

---

## Variables d'environnement

Copiez `.env.example` en `.env.local` et remplissez :

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `DATABASE_URL` | URL PostgreSQL | ✅ |
| `REDIS_PASSWORD` | Mot de passe Redis | ✅ |
| `JWT_PRIVATE_KEY` | Clé privée RSA pour JWT | ✅ |
| `JWT_PUBLIC_KEY` | Clé publique RSA pour JWT | ✅ |
| `REPLICATE_API_KEY` | Clé API Replicate (IA) | ✅ |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | ✅ |
| `PSEUDONYMIZATION_SALT` | Sel SHA-256 (changer en prod !) | ✅ |
| `GCP_PROJECT_ID` | Projet GCP | Prod uniquement |
| `PUBSUB_TOPIC` | Topic Pub/Sub | Prod uniquement |

---

## Commandes utiles

```bash
# Développement
npm run dev              # Lancer tout
npm run dev:api          # Backend uniquement
npm run dev:web          # Frontend uniquement

# Base de données
npm run db:migrate       # Appliquer les migrations
npm run db:studio        # Ouvrir Prisma Studio
npm run db:seed          # Insérer les données de test

# Tests
npm run test             # Tests unitaires
npm run test:e2e         # Tests end-to-end

# Qualité du code
npm run lint             # ESLint
npm run build            # Build de production

# Infrastructure
docker compose up -d     # Démarrer les services
docker compose down      # Arrêter les services
docker compose logs -f   # Voir les logs
```

---

## Architecture des modules NestJS

Chaque module suit la structure standard NestJS :

```
module-name/
├── module-name.module.ts      # Déclarations, imports, exports
├── module-name.controller.ts  # Routes HTTP (REST)
├── module-name.service.ts     # Logique métier
├── dto/                       # Data Transfer Objects (validation)
│   ├── create-xxx.dto.ts
│   └── update-xxx.dto.ts
├── guards/                    # Guards de sécurité
└── module-name.service.spec.ts # Tests unitaires
```

---

## Roadmap de développement

- [x] Setup monorepo
- [x] Schema Prisma complet
- [x] Docker Compose (PostgreSQL, Redis, MinIO, Mailpit)
- [x] Module Auth (inscription, connexion JWT RS256, refresh, logout)
- [x] EventsService (Pub/Sub abstraction)
- [ ] Module Designs (génération IA via Replicate + BullMQ)
- [ ] Module Couturieres (CRUD profil + recommandation)
- [ ] Module Orders (commandes + workflow statuts)
- [ ] Module Messages (Socket.io temps réel)
- [ ] Module Billing (Stripe abonnements + webhooks)
- [ ] Frontend Next.js (pages principales)
- [ ] Pipeline Pub/Sub → BigQuery (Dataflow)
- [ ] Transformations dbt (Silver + Gold)
- [ ] Feature Store Feast
- [ ] CI/CD GitHub Actions
- [ ] Déploiement Scaleway

---

## Documentation

- **Step 2** : Architecture des pages (12 écrans détaillés)
- **Step 3** : Design System complet (couleurs, typographie, espacement)
- **Step 4** : User Stories & Acceptance Criteria (32 stories, 6 epics)
- **Step 5** : Architecture Technique & API Design (BDD + endpoints complets)
