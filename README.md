# 🌟 Aurora Hotels & Bookings

> **"Your Perfect Stay, Thoughtfully Planned."**  
> A complete, luxury hotel booking and management web application built with **React.js, Vite, Tailwind CSS, Firebase (Auth & Firestore)**, and powered by **Google Gemini AI**.

---

## 💎 Brand Identity & Aesthetics

- **Deep Navy:** `#0B1F38` — Primary brand depth and night sky backdrop
- **Warm Ivory:** `#F8F5EF` — Soft, welcoming daylight and linen tone
- **Champagne Gold:** `#D4AF7C` — Refined luxury accents, buttons, and accolades
- **Emerald Green:** `#138B68` — Verified badges, guarantees, and availability indicators
- **White:** `#FFFFFF` — Crisp surfaces and card structures

---

## 🚀 Key Features

### 1. Landing Page & Showcase
- **Video Hero Section:** Autoplay muted loop with luxury hotel footage, poster fallback, dark vignette overlay, and clear typography.
- **Interactive Search Bar:** Date picker (min today/tomorrow), guest count (1 to 5), and category filters.
- **Featured Room Suites:** Showcases Single, Couple, and Friends categories with PKR rates and amenities.
- **How It Works:** 3-step guest walkthrough from discovery to guaranteed stay.
- **Interactive AI Planner Preview:** Live sample budget simulations in PKR.
- **Dedicated About Section:** High-resolution architectural photography, hospitality philosophy, and 4 core guest benefits.
- **Validated Contact Form:** Direct inquiries dispatched with real-time notifications.
- **Attribution Footer:** Complete with social links and safe portfolio attribution:
  - **Designed & Developed by [Arsalan Sher](https://arsalan-portfolio-pied.vercel.app/)**

---

### 2. Two Dedicated Portals

#### 🛎️ Customer Portal
- **Authentication:** Firebase Auth email/password signup and login.
- **Room Catalog & Categories:**
  1. **Single Room** — 1 guest (e.g., Executive Solo Haven).
  2. **Couple Room** — 2 guests (e.g., Royal Champagne Couple Suite).
  3. **Friends Room** — Up to 5 guests (e.g., Grand Aurora Friends Villa Suite).
- **Live Availability Engine:** Real-time date conflict verification against confirmed reservations. If a room is unavailable, only the simple message is shown: *"This room is unavailable for your selected dates."* No personal details of other guests are ever exposed.
- **Interactive Booking Checkout:**
  - Collects Full Name, Phone, and 13-digit Pakistani CNIC (`XXXXX-XXXXXXX-X`).
  - **CNIC Security:** CNIC is encrypted, masked as `42101-*******-1` in views, and never sent to AI or third parties.
  - Configurable add-on services selection (Breakfast, High Tea, Linens, Chauffeur).
  - Itemized mathematical price summary.
  - Transparent Payment Notice: *Pay Upon Arrival (At Check-In)*.
- **Official Booking Confirmation Receipt:** Unique reference code (`AUR-2026-XXXX`), printable receipt, and locked price snapshots.
- **Manage Reservations:** View active/past bookings, status, and cancel eligible bookings online prior to check-in.

#### 🛡️ Admin Portal (`/admin`)
- **Protected Role Guard:** Strict role verification (`role == 'admin'`).
- **Initial Admin Setup:** Promotes registered users to Admin using a master security key (`VITE_ADMIN_SETUP_CODE`).
- **Executive Operations Dashboard:**
  - Gross Booked Revenue in PKR.
  - Active reservation counts and occupancy estimates.
  - Recent guest reservations with masked CNIC audit tools.
- **Room Management:** Add, edit, and deactivate rooms; manage capacity, categories, prices, amenities, and photography.
- **Configurable Services:** Manage breakfast, Kashmiri chai, mineral water, extra pillows, cashmere blankets, and transport pricing models:
  - `per_person_per_day` (Price × Guests × Nights)
  - `per_person` (Price × Guests)
  - `per_night` (Price × Nights)
  - `flat` (One-time flat fee)
- **Reservation Register:** Update reservation statuses (`confirmed` → `checked-in` → `checked-out` → `cancelled`).
- **Financial Analytics & Reports:** Revenue distribution by room category and service add-on popularity metrics.
- **One-Click Catalog Seeder:** Instantly populates Firestore with luxury demo suites and services.

---

### 3. 🧠 Google Gemini AI Budget Planner (`/ai-planner`)
- **Inputs:** PKR Budget (e.g. Rs. 5,000, Rs. 15,000), Guest Count (1-5), Dates, Preferred Room Type, and Hospitality Service checkboxes.
- **Deterministic Math Protection:** Gemini NEVER invents prices or room names. The application deterministically computes the room subtotal, service charges, and grand total from verified Firestore data.
- **Gemini Concierge Narrative:** Explains the value of the package, room highlights, and budget guidance.
- **One-Click Booking:** Directly opens the booking modal prefilled with Gemini's recommended room and chosen services.
- **Architectural Notice:** For client demo purposes, `VITE_GEMINI_API_KEY` is loaded from `.env.local`. For production releases, proxy requests through a Firebase Cloud Function to protect API keys.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + Vite (JavaScript only) |
| **Styling** | Tailwind CSS v3 with custom luxury tokens |
| **Routing** | React Router DOM v7 |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |
| **Backend & DB** | Firebase Authentication + Cloud Firestore |
| **AI Intelligence** | Google Gemini API |

---

## 📂 Project Architecture

```
Aurora-Hotels-Bookings/
├── public/
│   └── favicon.svg                 # Custom luxury SVG monogram favicon
├── src/
│   ├── assets/                     # Visual assets
│   ├── components/
│   │   ├── common/
│   │   │   ├── AuroraLogo.jsx      # Custom SVG emblem & wordmark
│   │   │   └── ToastContainer.jsx  # Framer Motion animated alerts
│   │   ├── layout/
│   │   │   ├── Navbar.jsx          # Responsive nav with user dropdown & demo toggles
│   │   │   └── Footer.jsx          # Complete footer with Arsalan Sher attribution
│   │   ├── home/
│   │   │   ├── HeroSection.jsx     # Full-screen video hero & headline
│   │   │   ├── SearchBar.jsx       # Availability search bar
│   │   │   ├── FeaturedRooms.jsx   # Curated room suites showcase
│   │   │   ├── HowItWorks.jsx      # 3-step luxury booking process
│   │   │   ├── AiPlannerTeaser.jsx # Interactive Gemini planner preview
│   │   │   ├── AboutSection.jsx    # Story, architecture, & 4 benefits
│   │   │   └── ContactSection.jsx  # Validated inquiry form
│   │   └── booking/
│   │       └── BookingModal.jsx    # Concurrency-safe reservation modal with CNIC
│   ├── context/
│   │   ├── AuthContext.jsx         # Firebase Auth & role management
│   │   └── HotelContext.jsx        # Catalog, global search, & toasts
│   ├── firebase/
│   │   ├── config.js               # Firebase client initialization & demo detection
│   │   ├── authService.js          # Registration, login, admin promotion
│   │   ├── roomService.js          # Room queries, availability checks, CRUD
│   │   ├── serviceItemsService.js  # Configurable services & pricing models
│   │   └── bookingService.js       # Concurrency transactions & price snapshots
│   ├── layouts/
│   │   └── RootLayout.jsx          # Main page shell with nav and footer
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminLayout.jsx     # Protected admin sidebar & master key access
│   │   │   ├── AdminDashboard.jsx  # Key metrics & recent reservations
│   │   │   ├── AdminRooms.jsx      # Room inventory management & modals
│   │   │   ├── AdminServices.jsx   # Services catalog & pricing models
│   │   │   ├── AdminReservations.jsx # Front desk register & masked CNIC audit
│   │   │   └── AdminReports.jsx    # Category revenue & service adoption
│   │   ├── HomePage.jsx
│   │   ├── RoomsPage.jsx
│   │   ├── RoomDetailPage.jsx
│   │   ├── AiPlannerPage.jsx
│   │   ├── CustomerBookingsPage.jsx
│   │   ├── BookingConfirmationPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── services/
│   │   └── geminiService.js        # Google Gemini AI stay planner
│   ├── utils/
│   │   ├── dateUtils.js            # Overlap calculation & date formatters
│   │   ├── formatters.js           # PKR formatting, CNIC validator & mask
│   │   └── seedData.js             # Initial rooms & services seed data
│   ├── App.jsx                     # Route definitions & scroll restoration
│   ├── index.css                   # Tailwind base, utilities & glassmorphism
│   └── main.jsx
├── firestore.rules                 # Production Firestore security rules
├── .env.example                    # Environment variables template
├── .env.local                      # Local development configuration
└── package.json
```

---

## ⚡ Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your credentials in `.env.local`:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_ADMIN_SETUP_CODE=AURORA_ADMIN_2026
```

> **Note:** If Firebase credentials are not provided initially, Aurora automatically operates in a **Seamless Local Demo Mode** using local storage state so all UI, booking flows, and admin tools can be reviewed immediately!

### 3. Launch Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🔒 Firestore Security Rules (`firestore.rules`)

Deploy the provided `firestore.rules` to your Firebase project:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isAdmin() {
      return isAuthenticated() && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    function isOwner(userId) { return isAuthenticated() && request.auth.uid == userId; }

    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    match /rooms/{roomId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    match /services/{serviceId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    match /bookings/{bookingId} {
      allow read: if isAdmin() || (isAuthenticated() && resource.data.userId == request.auth.uid);
      allow create: if isAuthenticated() || request.resource.data.userId == 'guest-reservation';
      allow update: if isAdmin() || (isAuthenticated() && resource.data.userId == request.auth.uid);
      allow delete: if isAdmin();
    }
  }
}
```

---

## 🔑 Initial Admin Setup Workflow

1. Register an account as a normal customer in the app.
2. Navigate to `/admin`.
3. In the access modal, enter the Master Security Key:
   ```
   AURORA_ADMIN_2026
   ```
4. Click **Verify Master Key**. Your user document in Firestore will receive `role: "admin"`, unlocking access to all admin management suites.
5. In development, click the **"Seed / Reset Firestore"** button in the admin sidebar to instantly populate rooms and configurable services into your database!

---

## 👨‍💻 Designed & Developed By

**Arsalan Sher**  
Portfolio: [https://arsalan-portfolio-pied.vercel.app/](https://arsalan-portfolio-pied.vercel.app/)
