# Environment Variables Reference Guide (.env)

This document details all required and optional environment variables for both the **Frontend** (`edtech_frontend`) and **Backend** (`edtech_node_backend`) services when deploying to **Vercel** / **Render**.

---

## 🌐 1. Frontend Environment Variables (`edtech_frontend`)

Configure these variables under **Vercel** → **Project Settings** → **Environment Variables**:

| Variable Name | Description | Example / Recommended Value | Required? |
| :--- | :--- | :--- | :--- |
| `REACT_APP_BASE_URL` | Base API URL pointing to the deployed backend server. | `https://ed-tech-backend.vercel.app/api/v1` | **Yes** |
| `CI` | Disables treating ESLint warnings as fatal build errors in Vercel CI. | `false` | **Yes** |

---

## ⚙️ 2. Backend Environment Variables (`edtech_node_backend`)

Configure these variables under **Vercel** / **Render** → **Environment Variables**:

### 🔑 Core & Server Settings
| Variable Name | Description | Example / Recommended Value | Required? |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Application environment. | `production` | **Yes** |
| `PORT` | Server listening port. | `5000` | **Yes** |
| `JWT_SECRET` | Secret key for signing and verifying JWT auth tokens. | `super_secret_jwt_key_12345` | **Yes** |
| `FRONTEND_URL` | Deployed Frontend URL (for CORS and OAuth redirects). | `https://ed-tech-frontend.vercel.app` | **Yes** |
| `BACKEND_URL` | Deployed Backend URL. | `https://ed-tech-backend.vercel.app` | **Yes** |

---

### 🗄️ Database (PostgreSQL / Sequelize)
| Variable Name | Description | Example / Recommended Value | Required? |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Full PostgreSQL connection string (Supabase / Render / Neon). | `postgres://user:password@ep-host.region.aws.neon.tech/dbname` | **Yes** |
| `DB_HOST` | Database host (if using separate params). | `localhost` | Optional |
| `DB_PORT` | Database port. | `5432` | Optional |
| `DB_NAME` | Database name. | `edtech` | Optional |
| `DB_USER` | Database username. | `postgres` | Optional |
| `DB_PASSWORD` | Database password. | `your_db_password` | Optional |

---

### ☁️ Cloudinary (Media Uploads)
| Variable Name | Description | Example / Recommended Value | Required? |
| :--- | :--- | :--- | :--- |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary account cloud name. | `my_cloud_name` | **Yes** |
| `CLOUDINARY_API_KEY` | Cloudinary API Key. | `123456789012345` | **Yes** |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret. | `abcdefghijklmnopqrstuvwxyz123` | **Yes** |

---

### 🔑 Social Authentication (OAuth 2.0)
| Variable Name | Description | Example / Recommended Value | Required? |
| :--- | :--- | :--- | :--- |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID. | `12345-abc.apps.googleusercontent.com` | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 Client Secret. | `GOCSPX-abc123xyz` | Optional |
| `GOOGLE_CALLBACK_URL` | Callback redirect URL for Google OAuth. | `https://ed-tech-backend.vercel.app/auth/google_oauth2/callback` | Optional |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID. | `Iv1.123456789` | Optional |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret. | `9876543210fedcba` | Optional |
| `GITHUB_CALLBACK_URL` | Callback redirect URL for GitHub OAuth. | `https://ed-tech-backend.vercel.app/auth/github/callback` | Optional |

---

### ✉️ Email / Mailing Service (Nodemailer)
| Variable Name | Description | Example / Recommended Value | Required? |
| :--- | :--- | :--- | :--- |
| `EMAIL_HOST` | SMTP server host. | `smtp.gmail.com` | Optional |
| `EMAIL_PORT` | SMTP server port. | `587` | Optional |
| `EMAIL_USER` | Sender email address. | `support@edtech.com` | Optional |
| `EMAIL_PASS` | SMTP application password / key. | `your_app_password` | Optional |
| `EMAIL_FROM` | Default "From" display header. | `no-reply@edtech.com` | Optional |

---

### 💳 Stripe Payment Gateway
| Variable Name | Description | Example / Recommended Value | Required? |
| :--- | :--- | :--- | :--- |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...` for live prod or `sk_test_...` for testing). | `sk_test_51...` | **Yes (for live Stripe checkout)** |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret for event fulfillment. | `whsec_...` | Optional |

---

## 📋 Full Raw `.env` Template for Quick Copying

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_12345

# Database Connection String
DATABASE_URL=postgres://user:password@host:5432/dbname

# Deployment URLs
FRONTEND_URL=https://ed-tech-frontend.vercel.app
BACKEND_URL=https://ed-tech-backend.vercel.app

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://ed-tech-backend.vercel.app/auth/google_oauth2/callback

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=https://ed-tech-backend.vercel.app/auth/github/callback

# Mailing
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=no-reply@edtech.com
```

