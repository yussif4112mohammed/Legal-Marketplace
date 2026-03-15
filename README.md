# LexBridge — US Legal Marketplace

A full-stack legal marketplace connecting clients with licensed attorneys across the United States.

---

## 📁 Complete Folder Structure

```
legal-marketplace/
│
├── package.json                   ← Root monorepo scripts
├── .gitignore
├── README.md
│
├── frontend/                      ← Next.js Application (Port 3000)
│   ├── package.json
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── lib/
│   │   └── api.js                 ← Axios client + all API functions
│   │
│   ├── hooks/
│   │   └── useAuth.js             ← Auth context + hook
│   │
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── index.tsx              ← Homepage
│   │   ├── 404.tsx
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx       ← Client + Lawyer registration
│   │   ├── lawyers/
│   │   │   ├── index.tsx          ← Search/directory
│   │   │   └── [id].tsx           ← Lawyer profile + booking
│   │   └── dashboard/
│   │       ├── client.tsx
│   │       ├── lawyer.tsx
│   │       └── admin.tsx
│   │
│   └── components/
│       ├── layout/
│       │   ├── Navbar.tsx
│       │   └── Footer.tsx
│       ├── lawyer/
│       │   └── LawyerCard.tsx
│       └── shared/
│           ├── StarRating.tsx
│           └── SearchBar.tsx
│
├── backend/                       ← Express API Server (Port 5000)
│   ├── package.json
│   ├── .env
│   └── src/
│       ├── server.js              ← Entry point
│       ├── config/
│       │   └── database.js        ← MySQL connection pool
│       ├── middleware/
│       │   ├── auth.js            ← JWT authenticate/authorize
│       │   ├── errorHandler.js
│       │   └── validate.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── lawyersController.js
│       │   ├── bookingsController.js
│       │   ├── messagesController.js
│       │   ├── reviewsController.js
│       │   └── adminController.js
│       └── routes/
│           ├── auth.js
│           ├── lawyers.js
│           ├── bookings.js
│           ├── messages.js
│           ├── reviews.js
│           ├── admin.js
│           └── specializations.js
│
├── database/
│   ├── migrate.js                 ← Migration runner
│   ├── seed.js                    ← Sample data seeder
│   └── migrations/
│       └── 001_schema.sql         ← Full MySQL schema
│
└── shared/
    ├── constants/index.js         ← US states, practice areas
    └── validators/index.js        ← Shared validation functions
```

---

## ⚙️ Tech Stack

| Layer        | Technology                            |
|-------------|---------------------------------------|
| Frontend    | Next.js 14 (Pages Router), React 18   |
| Styling     | Tailwind CSS, DM Sans + Playfair fonts|
| Backend     | Node.js + Express 4                   |
| Database    | MySQL 8                               |
| Auth        | JWT (jsonwebtoken) + bcrypt           |
| HTTP Client | Axios                                 |
| Validation  | express-validator + custom validators |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** 18+ — [nodejs.org](https://nodejs.org)
- **MySQL** 8+ — [mysql.com](https://www.mysql.com) or use [MAMP](https://www.mamp.info)/[XAMPP](https://www.apachefriends.org)
- **Git** — [git-scm.com](https://git-scm.com)
- **VS Code** — [code.visualstudio.com](https://code.visualstudio.com)

---

### Step 1 — Download & Open in VS Code

```bash
# If you cloned from GitHub:
git clone https://github.com/YOUR_USERNAME/legal-marketplace.git
cd legal-marketplace
code .

# Or: unzip the downloaded file and open VS Code
# File → Open Folder → select legal-marketplace/
```

---

### Step 2 — Set Up MySQL Database

Open a terminal (in VS Code: `` Ctrl+` ``) and run:

```bash
mysql -u root -p
```

Then in the MySQL prompt:
```sql
CREATE DATABASE legal_marketplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lmuser'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON legal_marketplace.* TO 'lmuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### Step 3 — Configure Environment Variables

**Backend** — edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=lmuser
DB_PASSWORD=StrongPassword123!
DB_NAME=legal_marketplace
JWT_SECRET=my_super_long_jwt_secret_key_32chars_minimum
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend** — edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

### Step 4 — Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

---

### Step 5 — Run Database Migrations

```bash
node database/migrate.js
```

Expected output:
```
✅ Connected!
▶  Running: 001_schema.sql
✅ Done: 001_schema.sql
🎉 All migrations complete!
```

---

### Step 6 — Seed Sample Data

```bash
node database/seed.js
```

This creates sample lawyers, clients, and an admin account.

**Test Login Credentials (all passwords: `Password123!`):**
| Role   | Email                          |
|--------|-------------------------------|
| Admin  | admin@legalmarket.com         |
| Client | alice@example.com             |
| Lawyer | james.wilson@lawfirm.com      |
| Lawyer | sarah.chen@immigrationlaw.com |

---

### Step 7 — Start the Application

**Option A — Run both servers with one command:**
```bash
npm run dev
```

**Option B — Run separately in two terminals:**
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open your browser:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

---

## 📡 API Endpoints

### Auth
| Method | Endpoint                    | Auth    | Description        |
|--------|-----------------------------|---------|-------------------|
| POST   | `/api/auth/register`        | None    | Register user     |
| POST   | `/api/auth/login`           | None    | Login             |
| GET    | `/api/auth/me`              | Bearer  | Get current user  |
| POST   | `/api/auth/change-password` | Bearer  | Change password   |

### Lawyers
| Method | Endpoint            | Auth   | Description         |
|--------|---------------------|--------|---------------------|
| GET    | `/api/lawyers`      | None   | Search/filter       |
| GET    | `/api/lawyers/:id`  | None   | Get profile         |
| GET    | `/api/lawyers/me`   | Lawyer | Own profile         |
| PUT    | `/api/lawyers/me`   | Lawyer | Update profile      |

### Bookings
| Method | Endpoint             | Auth         | Description      |
|--------|----------------------|--------------|-----------------|
| GET    | `/api/bookings`      | Bearer       | List my bookings |
| POST   | `/api/bookings`      | Client       | Create booking  |
| GET    | `/api/bookings/:id`  | Bearer       | Get booking     |
| PATCH  | `/api/bookings/:id`  | Bearer       | Update booking  |

### Messages
| Method | Endpoint                       | Auth   | Description   |
|--------|-------------------------------|--------|--------------|
| GET    | `/api/messages`               | Bearer | Inbox/thread |
| POST   | `/api/messages`               | Bearer | Send message |
| GET    | `/api/messages/unread-count`  | Bearer | Unread count |

### Reviews
| Method | Endpoint       | Auth   | Description   |
|--------|---------------|--------|--------------|
| GET    | `/api/reviews` | None   | Get reviews  |
| POST   | `/api/reviews` | Client | Post review  |

### Admin (Admin role only)
| Method | Endpoint                         | Description           |
|--------|----------------------------------|-----------------------|
| GET    | `/api/admin/stats`               | Platform stats        |
| GET    | `/api/admin/pending-lawyers`     | Pending applications  |
| PATCH  | `/api/admin/lawyers/:id/approve` | Approve lawyer        |
| PATCH  | `/api/admin/lawyers/:id/reject`  | Reject lawyer         |
| GET    | `/api/admin/users`               | All users             |
| PATCH  | `/api/admin/users/:id/toggle`    | Suspend/restore user  |
| GET    | `/api/admin/reviews`             | All reviews           |
| PATCH  | `/api/admin/reviews/:id/toggle`  | Show/hide review      |

---

## 🐙 Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit — LexBridge legal marketplace"

# Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/legal-marketplace.git
git branch -M main
git push -u origin main
```

---

## ☁️ Deployment

### Frontend — Vercel (Free)

1. Push to GitHub first
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Set **Root Directory** to `frontend`
5. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.com
   ```
6. Deploy

### Backend — Railway (Recommended)

1. Go to [railway.app](https://railway.app) → New Project
2. Deploy from GitHub repo → set **Root Directory** to `backend`
3. Add a **MySQL** service in the same project
4. Set environment variables (copy from `backend/.env`):
   - Use Railway's MySQL connection variables for DB settings
5. Deploy

### Alternative Backend Hosts
- **Render** — [render.com](https://render.com) (free tier available)
- **Fly.io** — [fly.io](https://fly.io)
- **DigitalOcean App Platform**

### Database Options
- **Railway MySQL** (easiest, same project as backend)
- **PlanetScale** — [planetscale.com](https://planetscale.com) (free tier)
- **AWS RDS MySQL** (production grade)
- **ClearDB on Heroku**

After deploying, run migrations against your production database:
```bash
DB_HOST=your-prod-host DB_USER=your-user DB_PASSWORD=your-pass \
  DB_NAME=legal_marketplace node database/migrate.js
```

---

## 🔐 Security Features

- JWT stored in `localStorage` with Bearer token header
- `bcryptjs` password hashing (12 salt rounds)
- `express-rate-limit` — 300 req/15min global, 20 req/15min for auth
- `helmet` — HTTP security headers
- CORS restricted to frontend origin
- `express-validator` input validation on all routes
- Parameterized MySQL queries (SQL injection protection)
- Role-based route authorization (client / lawyer / admin)
- Lawyer approval gating — lawyers must be admin-approved before login

---

## 🎯 User Flows

### Client Flow
1. Browse `/lawyers` (no login required)
2. Filter by state, specialty, price, rating
3. View lawyer profile at `/lawyers/:id`
4. Sign up at `/auth/register`
5. Book a consultation from the profile page
6. Manage bookings at `/dashboard/client`

### Lawyer Flow
1. Apply at `/auth/register?role=lawyer` (3-step form)
2. Wait for admin approval (status: pending)
3. Login redirects to `/dashboard/lawyer`
4. Accept/decline incoming booking requests
5. Mark consultations as complete

### Admin Flow
1. Login at `/auth/login` → redirects to `/dashboard/admin`
2. **Overview tab** — platform stats
3. **Pending tab** — approve or reject lawyer applications
4. **Users tab** — suspend/restore user accounts
5. **Reviews tab** — show/hide client reviews

---

## 🧪 Testing the Full Flow

```
1. Open http://localhost:3000
2. Browse lawyers (no login needed)
3. Register as a client (alice@example.com / Password123!)
4. Find a lawyer and book a consultation
5. Login as the lawyer (james.wilson@lawfirm.com / Password123!)
6. Accept the booking in your dashboard
7. Login as admin (admin@legalmarket.com / Password123!)
8. Check the admin dashboard — approve lawyers, manage users
```

---

## VS Code Recommended Extensions

Install these for the best development experience:
- **ESLint** — `dbaeumer.vscode-eslint`
- **Prettier** — `esbenp.prettier-vscode`
- **Tailwind CSS IntelliSense** — `bradlc.vscode-tailwindcss`
- **MySQL** — `cweijan.vscode-mysql-client2`
- **Thunder Client** — `rangav.vscode-thunder-client` (API testing)
- **GitLens** — `eamodio.vscode-gitlens`

---

## 📄 License

MIT License — Free to use and extend.
