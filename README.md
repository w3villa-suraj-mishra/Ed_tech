# EdTech Platform

A full-stack EdTech learning platform with student and instructor portals, course management, subscriptions (Silver/Gold), payment integration (Razorpay/Stripe), real-time notifications, and progress tracking.

## Project Structure

```
Ed_tech/
├── edtech_frontend/     # React frontend (Create React App)
├── edtech_node_backend/ # Node.js/Express backend API
├── package.json         # Root scripts to run both services
└── ENV_VARIABLES_GUIDE.md # Environment variables documentation
```

## Tech Stack

### Frontend
- **Framework**: React 19, React Router DOM 7
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with React Icons
- **Payments**: Stripe React components
- **Real-time**: Socket.io client
- **Code Editor**: Monaco Editor
- **Video Player**: video-react

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT, Passport.js (Google/GitHub OAuth)
- **File Uploads**: Cloudinary
- **Payments**: Stripe, Razorpay
- **Email**: Nodemailer
- **Real-time**: Socket.io
- **Security**: bcryptjs for password hashing

## Features

- **User Authentication**: Sign up/login with email, Google OAuth, GitHub OAuth
- **Role-based Access**: Student, Instructor, Admin roles
- **Course Management**: Create, manage courses with sections and subsections
- **Subscriptions**: Free, Silver (time-limited), and Gold (lifetime) access tiers
- **Payments**: Integrated Stripe and Razorpay payment gateways
- **Progress Tracking**: Track course completion and video progress
- **Media Uploads**: Image and video uploads via Cloudinary
- **Real-time Notifications**: Socket.io powered notifications
- **Admin Dashboard**: User management, course approval, analytics
- **Reviews & Ratings**: Course rating system

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) database
- [Cloudinary](https://cloudinary.com/) account (for media uploads)
- [Stripe](https://stripe.com/) account (for payments)
- [Razorpay](https://razorpay.com/) account (optional)
- SMTP credentials for emails (e.g., Gmail app password)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Ed_tech
```

### 2. Install Dependencies

Install root dependencies and both frontend/backend dependencies:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd edtech_node_backend && npm install

# Install frontend dependencies
cd ../edtech_frontend && npm install
```

Or use the setup script in backend:

```bash
cd edtech_node_backend && npm run setup
```

### 3. Configure Environment Variables

Create `.env` files for both services. See [ENV_VARIABLES_GUIDE.md](./ENV_VARIABLES_GUIDE.md) for detailed configuration.

#### Backend (`edtech_node_backend/.env`)
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgres://user:password@localhost:5432/edtech_db
FRONTEND_URL=http://localhost:3001
BACKEND_URL=http://localhost:5000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key

# OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### Frontend (`edtech_frontend/.env`)
```env
REACT_APP_BASE_URL=http://localhost:5000/api/v1
CI=false
```

### 4. Setup Database

Run migrations and seeders from the backend directory:

```bash
cd edtech_node_backend

# Run migrations
npm run migrate

# Run seeders (optional - adds initial data)
npm run seed
```

### 5. Run the Application

#### Run both frontend and backend together (from root)
```bash
npm start
# or
npm run dev
```

#### Run separately
```bash
# Terminal 1 - Backend (runs on http://localhost:5000)
cd edtech_node_backend && npm run dev

# Terminal 2 - Frontend (runs on http://localhost:3001)
cd edtech_frontend && PORT=3001 npm start
```

## Available Scripts

### Root
- `npm start` / `npm run dev` - Run frontend and backend concurrently
- `npm run frontend` - Run frontend only
- `npm run backend` - Run backend only

### Backend (`edtech_node_backend`)
- `npm run dev` - Start with nodemon (development)
- `npm start` - Start in production
- `npm run migrate` - Run database migrations
- `npm run seed` - Run database seeders
- `npm test` - Run tests
- `npm run health` - Health check script

### Frontend (`edtech_frontend`)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Default Ports

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000
- **API Base Path**: `/api/v1`

## Additional Documentation

- [Backend README](./edtech_node_backend/README.md) - Detailed backend documentation
- [Frontend README](./edtech_frontend/README.md) - Detailed frontend documentation
- [Environment Variables Guide](./ENV_VARIABLES_GUIDE.md) - Complete environment variable reference

## License

ISC
