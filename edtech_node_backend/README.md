# EdTech Platform - Node.js Backend API

Welcome to the backend API of the **EdTech Platform**. This server powers user authentication, dynamic course management, access control tiers (Silver/Gold subscriptions), Razorpay/Stripe payments, real-time notifications, and progress tracking.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (managed via Sequelize ORM)
- **Authentication**: JWT (JSON Web Tokens) & Passport.js
- **File Storage**: Cloudinary SDK (Image & Video Uploads)
- **Mailing**: Nodemailer (Email verification & receipts)
- **Utilities**: CORS, Dotenv, BCrypt, Morgan

---

## 🚀 Key Features

1. **User Authentication & Authorization**:
   - Secure Sign up / Log in with hashed passwords (BCrypt) and JWT tokens.
   - Role-Based Access Control (Student, Instructor, Admin).

2. **Access Plans & Subscriptions**:
   - Multi-tier enrollment models (`Free`, `Silver` - valid until expiry, `Gold` - lifetime access).
   - Real-time plan status evaluation and authorization middleware.

3. **Course & Content Management**:
   - Complete CRUD operations for Categories, Courses, Sections, and SubSections.
   - Video duration tracking & progress percentages.

4. **Notifications & Real-Time Alerts**:
   - System notifications for enrollments, plan activations, and announcements.

5. **Payment Integration & Order Audit**:
   - Order creation, signature verification, and price auditing.

---

## 📂 Project Structure

```text
edtech_node_backend/
├── config/             # DB & Cloudinary configurations
├── controllers/        # Request handlers & logic
├── db/                 # Database seeders & migrations
├── middleware/         # Auth, Upload & Admin middlewares
├── migrations/         # Sequelize schema migrations
├── models/             # Sequelize database models
├── routes/             # Express API routes
├── scripts/            # Health checks & utility scripts
├── services/           # Business logic & external API integrations
└── utils/              # Helper functions & logger
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (v16+ recommended)
- PostgreSQL database instance

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone git@github.com:w3villa-suraj-mishra/Ed_tech-Backend.git
cd edtech_node_backend
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and specify the following credentials:

```env
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/edtech_db
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_email_app_password
```

### 4. Running Database Migrations

#### Local Database Migrations
```bash
# Run all pending migrations on local database
npm run migrate
# or directly with Sequelize CLI:
npx sequelize-cli db:migrate

# Check migration status on local database
npx sequelize-cli db:migrate:status

# Rollback the last migration on local database (if needed)
npm run migrate:undo
# or:
npx sequelize-cli db:migrate:undo
```

#### Production (Supabase) Database Migrations
The database configuration automatically switches to Supabase PostgreSQL over SSL when `NODE_ENV=production` or `USE_SUPABASE_DB=true`:

```bash
# Run all pending migrations on production (Supabase)
NODE_ENV=production npx sequelize-cli db:migrate
# or:
USE_SUPABASE_DB=true npx sequelize-cli db:migrate

# Check migration status on production (Supabase)
NODE_ENV=production npx sequelize-cli db:migrate:status

# Rollback the last migration on production (if needed)
NODE_ENV=production npx sequelize-cli db:migrate:undo
```

#### Running a Single Specific Migration File
```bash
# On Local Database:
node -e "
require('dotenv').config();
const { sequelize } = require('./models');
const migration = require('./migrations/20261123120000-persistent-referral-attribution');
migration.up(sequelize.getQueryInterface(), sequelize.Sequelize)
  .then(() => { console.log('✓ Migration applied to local DB'); process.exit(0); })
  .catch(err => { console.error('Migration error:', err); process.exit(1); });
"

# On Production (Supabase) Database:
USE_SUPABASE_DB=true node -e "
require('dotenv').config();
const { sequelize } = require('./models');
const migration = require('./migrations/20261123120000-persistent-referral-attribution');
migration.up(sequelize.getQueryInterface(), sequelize.Sequelize)
  .then(() => { console.log('✓ Migration applied to Supabase DB'); process.exit(0); })
  .catch(err => { console.error('Migration error:', err); process.exit(1); });
"
```

### 5. Start Development Server
```bash
npm run dev
# or
node server.js
```
The server will start listening on `http://localhost:5000`.

---

## 📄 License
This project is proprietary and built for the EdTech platform.
