# 🎓 EdTech Platform - Modern Learning & Course Management System (Frontend)

Welcome to the **EdTech Platform Frontend**, a state-of-the-art web application crafted for seamless online education, course discovery, dynamic video streaming, and real-time student/instructor analytics.

---

## 🌟 Key Features

### 👨‍🎓 Student Experience
- **Interactive Course Catalog**:
  - Live search with debounce, category filtering, and sorting by rating/price/newest.
  - Multi-tier enrollment badge indicators (`Free`, `Silver`, `Gold`).
- **Context-Aware Navigation & CTAs**:
  - Smart routing for CTAs ("Continue Learning", "Start Learning", "Enroll Now") tailored to the user's login state and subscription status.
- **Dynamic Student Dashboard**:
  - Real-time **Hours Learned** and **Lessons Completed** stats engine.
  - **Learning Overview Activity Graph**: Smooth SVG progress curve with automated current-day indicator (`Mon`–`Sun`).
  - Active Streak counter and enrolled course trackers.
- **Course Viewing & Video Player**:
  - Collapsible course content sidebar with section/sub-section video playback.
  - Automatic progress recording and video completion toggles.
- **Profile & Settings**:
  - **High-Precision Geolocation**: Browser GPS and automated IP fallback (`ipapi.co` + `Nominatim`) for live address detection.
  - Interactive Google Maps embed preview for current location.
  - Profile image uploads and JSON export capabilities.

### 👨‍🏫 Instructor & Admin Tools
- **Instructor Dashboard**: Course creation wizard, section management, lecture video uploads, and rating reviews.
- **Admin Management**: User roles, platform analytics, category creation, and review audits.

---

## 🛠️ Technology Stack

- **Framework**: React.js (v18)
- **State Management**: Redux Toolkit & React-Redux (Auth, Profile, Cart, Course slices)
- **Styling & UI**: Tailwind CSS, Vanilla CSS, Custom Glassmorphism, Modern Dark Themes
- **Icons**: React Icons (`vsc`, `bs`, `fa`, `hi`, `io5`)
- **Forms & Validation**: React Hook Form
- **HTTP Client**: Axios with REST API endpoints
- **Notifications**: React Hot Toast
- **Geolocation & Mapping**: Geolocation API, LocationIQ, OpenStreetMap Nominatim, Google Maps IFrame API

---

## 📂 Project Architecture

```text
edtech_frontend/
├── public/                 # Static assets & index.html
├── src/
│   ├── assets/             # Images, logos, icons, and hero graphics
│   ├── components/         # Reusable React UI Components
│   │   ├── Common/         # Navbar, Footer, Modals, Buttons, Rating Stars
│   │   ├── core/           # Core feature components
│   │   │   ├── Auth/       # Login, Signup, OTP, Route Guards (OpenRoute, PrivateRoute)
│   │   │   ├── Catalog/    # Category cards & catalog carousels
│   │   │   ├── Course/     # Course details card, accordion, reviews
│   │   │   ├── Dashboard/  # Profile, Cart, Enrolled Courses, Global Dashboard, Settings
│   │   │   ├── Home/       # Hero section, Code Blocks, Explore Cards, Timeline
│   │   │   └── ViewCourse/ # Video player, course sidebar, review modal
│   │   └── Navbar/         # Primary navigation bar
│   ├── data/               # Navbar links, home page static data
│   ├── pages/              # Main Application Page Views (Home, Catalog, CourseDetails, ViewCourse, Dashboard, Login, Signup)
│   ├── reducer/            # Root Redux reducer configuration
│   ├── services/           # API Services & Redux Slices
│   │   ├── apis.js         # API Endpoint URL constants
│   │   ├── apiConnector.js # Axios wrapper
│   │   ├── operations/     # Async API call handlers (Auth, Profile, CourseDetails, StudentFeatures)
│   │   └── slices/         # Redux state slices (authSlice, profileSlice, cartSlice, courseSlice)
│   └── utils/              # Helper constants, date formatters, time calculators
└── package.json            # Dependencies & scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v16.x` or higher
- **npm** or **yarn**

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone git@github.com:w3villa-suraj-mishra/Ed_tech-Frontend.git
cd edtech_frontend
npm install
```

### 3. Environment Setup
Create a `.env` file in the `edtech_frontend/` root directory:
```env
REACT_APP_BASE_URL=http://localhost:5000/api/v1
```

### 4. Available Scripts

#### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

#### `npm run build`
Builds the app for production to the `build` folder. Optimizes and bundles JS/CSS for performance.

---

## 🔒 State & Cart Security

- **Duplicate Purchase Guard**: Enrolled courses are automatically blocked from being added to the cart across `cartSlice.js`, `CourseDetailsCard.jsx`, and `Catalog.jsx`.
- **Auth CTAs**: Logged-in users clicking home CTAs are seamlessly redirected to their courses instead of auth screens.

---

## 📄 License
Proprietary software developed for the EdTech platform. All rights reserved.
