# Mallem — Fashion AI Platform

Plateforme SaaS de mode combinant génération de vêtements par IA, marketplace couturières/clients et scanner corporel temps réel.

> Fondée par **Amel Guerah** — ingénieure de données, fille et petite-fille de couturières.

---

## Stack technique

### Backend
- **NestJS 10** — API REST + WebSocket
- **PostgreSQL** — Base de données principale
- **Prisma 5** — ORM
- **Redis** — Cache (TTL différencié)
- **MinIO** — Stockage objet (images, avatars, portfolios)
- **Google Gemini AI** — Génération d'images IA
- **Socket.io** — Messagerie temps réel
- **JWT** — Authentification (access + refresh tokens)
- **Mailpit / Gmail SMTP** — Emails transactionnels

### Frontend
- **Next.js 16** (Turbopack) — Framework React
- **TypeScript** — Typage statique
- **Tailwind CSS** — Styles
- **Framer Motion** — Animations
- **shadcn/ui** — Composants UI
- **MediaPipe Pose** — Scanner corporel IA temps réel
- **sonner** — Notifications toast

### Infrastructure
- **Docker** — Redis, MinIO, Mailpit
- **PostgreSQL natif Windows** — port 5432

---

## Architecture

```
fashion-ai-platform/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   └── src/
│   │       ├── auth/           # Authentification JWT
│   │       ├── users/          # Profils utilisateurs
│   │       ├── couturieres/    # Profils couturières
│   │       ├── designs/        # Génération IA
│   │       ├── orders/         # Commandes
│   │       ├── messages/       # Messagerie
│   │       ├── reviews/        # Avis
│   │       ├── cache/          # Redis
│   │       └── storage/        # MinIO
│   └── web/                    # Frontend Next.js
│       ├── app/                # Routes Next.js App Router
│       ├── pages/              # Composants de pages
│       ├── components/
│       │   ├── profile/        # Composants profil client
│       │   ├── morphology/     # Scanner corporel
│       │   └── shared/         # Header, Footer
│       ├── context/            # AuthContext
│       └── lib/                # API client
└── packages/
    └── db/
        └── prisma/             # Schéma + migrations
```

---

## Fonctionnalités

### IA & Génération
- Génération de designs vestimentaires via **Google Gemini** (`gemini-2.5-flash-preview-image`)
- 4 appels parallèles par génération
- 15+ paramètres (type, tissu, couleurs hex, morphologie, style...)
- Cache Redis (TTL 2 min)

### Scanner corporel
- Détection temps réel via **MediaPipe Pose** (33 points)
- Calibration par taille réelle
- Précision ±3-5 cm
- Mesures : poitrine, taille, hanches, épaules, dos, entrejambe, bras

### Marketplace couturières
- Profils avec portfolio photos
- Algorithme de scoring ML multi-critères (note, disponibilité, spécialités, localisation, complétion profil)
- Filtres : région, budget, spécialités
- Page publique avec lightbox portfolio

### Authentification
- Inscription avec vérification email (code 6 chiffres, 15 min)
- Connexion JWT (access + refresh tokens)
- Réinitialisation de mot de passe (token 30 min)
- Emails HTML professionnels

### Avis & Modération
- Avis clients après commande terminée
- Champ `isApprovedForHome` pour modération admin
- Section témoignages page d'accueil

### Messagerie
- Conversations liées aux commandes
- Marquage lu/non-lu
- Interface type WhatsApp

---

## Installation

### Prérequis
- Node.js v24+
- PostgreSQL (natif Windows, port 5432)
- Docker (Redis, MinIO, Mailpit)

### 1. Variables d'environnement

**Backend** (`apps/api/.env`) :
```env
DATABASE_URL=postgresql://fap_user:fap_password@localhost:5432/fap_dev
GOOGLE_AI_API_KEY=your_key
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

**Frontend** (`apps/web/.env.local`) :
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/v1
```

### 2. Démarrage Docker
```bash
docker-compose up -d
```

### 3. Base de données
```powershell
cd packages/db
$env:DATABASE_URL = "postgresql://fap_user:fap_password@localhost:5432/fap_dev"
npx prisma migrate dev
npx prisma generate
```

### 4. Lancer les serveurs

**Backend** :
```powershell
cd apps/api
$env:DATABASE_URL = "postgresql://fap_user:fap_password@localhost:5432/fap_dev"
npm run dev
```

**Frontend** :
```powershell
cd apps/web
npm run dev
```

---

## Endpoints API principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/v1/auth/register` | Inscription |
| POST | `/v1/auth/verify-email` | Vérification email |
| POST | `/v1/auth/login` | Connexion |
| GET | `/v1/auth/me` | Profil connecté |
| POST | `/v1/designs/generate` | Générer un design IA |
| GET | `/v1/couturieres` | Liste couturières |
| GET | `/v1/couturieres/:id` | Profil public couturière |
| PUT | `/v1/couturieres/me` | Mettre à jour profil |
| POST | `/v1/orders` | Créer une commande |
| GET | `/v1/messages` | Conversations |
| POST | `/v1/messages/:orderId` | Envoyer un message |
| POST | `/v1/reviews` | Soumettre un avis |
| PATCH | `/v1/reviews/:id/approve` | Approuver un avis (admin) |
| POST | `/v1/users/me/avatar` | Upload avatar |
| POST | `/v1/users/me/portfolio` | Upload photo portfolio |

---

## Tests

```powershell
cd apps/api
npx jest --config jest.config.js --no-coverage
```

21 tests unitaires — AuthService, DesignsService, CouturieresService.

---

## Données de test

- **Client** : `test@test.com` / `Test1256`
- **Couturières en base** : `maisonaissiouene@gmail.com`, `a_guerah@estin.dz`
- **Ateliers** : "adore", "hands touch"

---

## Pages frontend

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil |
| `/register` | Inscription |
| `/verify-email` | Vérification code email |
| `/login` | Connexion |
| `/bienvenue` | Page de bienvenue personnalisée |
| `/create` | Formulaire guidé génération IA |
| `/create/results` | Résultats génération |
| `/mes-designs` | Historique designs |
| `/couturieres` | Liste couturières avec filtres |
| `/couturieres/[id]` | Profil public couturière |
| `/profil` | Profil client (tabs URL) |
| `/espace-pro` | Dashboard couturière |
| `/messages` | Messagerie |
| `/abonnements` | Tarifs |
| `/a-propos` | Histoire de Mallem |
| `/contact` | Formulaire contact |

---

## Roadmap

- [ ] Stripe — abonnements Premium
- [ ] Page admin — modération avis
- [ ] Section témoignages page d'accueil
- [ ] Pipeline data GCP (Pub/Sub → Dataflow → BigQuery → dbt → Feast → Vertex AI)
- [ ] Déploiement Scaleway
- [ ] Notifications temps réel (Socket.io)
