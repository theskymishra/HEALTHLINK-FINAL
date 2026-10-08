# HEALTHLINK — Clinical OS

**A Production-Style Cloud Healthcare & Clinical Operating System.**

---

## 👥 Team & Responsibilities

- **Akash** — Project Lead, Cloud Architecture & Backend
  - Full-stack integration, Express REST APIs, MongoDB Atlas Database, Docker containerization, CI/CD pipeline, and Cloud VM deployment.
- **Varnika** — Patient & Doctor Modules
  - Patients Directory, Add/Edit Patient intake, Clinical History Timeline, Doctors & Weekly OPD schedules.
- **Aarya** — Appointments, Medical Records & Billing Modules
  - Outpatient Appointments, Token Numbering, Medical E-Docs, Invoices & Financial Ledger with dynamic calculations.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, React Router
- **Backend**: Node.js, Express, RESTful APIs, JWT Authentication & Role-Based Access Control
- **Database**: MongoDB Atlas (Cloud Database with Mongoose ODM, auto-seeding & schemas)
- **DevOps & Cloud Computing**: Docker multi-stage builds, Docker Compose orchestration, GitHub Actions CI/CD

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or v20+)
- MongoDB Atlas cluster URI (configured in `.env`)

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your MongoDB Atlas connection string is provided in `.env`:
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Full-Stack Development Server
Runs the unified backend API server and Vite SPA middleware together on port 3000:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🐳 Docker & Cloud Deployment

### Run with Docker Compose
```bash
docker compose up --build
```
The application will be accessible at `http://localhost:3000` with automated health checks enabled.

### Build and Run Docker Container Directly
```bash
# Build production image
docker build -t healthlink-clinical-os:latest .

# Run container with environment variables
docker run -d -p 3000:3000 --env-file .env --name healthlink-app healthlink-clinical-os:latest
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check & database connection status |
| `POST` | `/api/auth/login` | User login & JWT issuance |
| `POST` | `/api/auth/signup` | User registration |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/patients` | List all patients from MongoDB Atlas |
| `POST` | `/api/patients` | Register new patient |
| `GET` | `/api/patients/:id` | Fetch patient details & medical history |
| `PUT` | `/api/patients/:id` | Update patient records |
| `DELETE` | `/api/patients/:id` | Remove patient record |
| `GET` | `/api/doctors` | List all doctors and OPD schedules |
| `POST` | `/api/doctors` | Register new doctor |
| `GET` | `/api/appointments` | Retrieve appointments |
| `GET` | `/api/appointments/today` | Retrieve today's outpatient appointments |
| `POST` | `/api/appointments` | Book appointment & issue queue token |
| `PATCH` | `/api/appointments/:id/status`| Update appointment status |
| `GET` | `/api/medical-records` | List medical electronic records |
| `POST` | `/api/medical-records` | Create new clinical record / lab report |
| `GET` | `/api/billing` | Fetch invoices and billing ledger |
| `GET` | `/api/billing/stats` | Dynamic financial statistics (Revenue, Paid, Pending, Overdue) |
| `POST` | `/api/billing` | Generate invoice |
| `PATCH` | `/api/billing/:id/status` | Update payment status |
| `GET` | `/api/departments` | Retrieve hospital departments & bed availability |

---

## 🏛️ Project Directory Structure

```text
healthlink/
├── server/
│   ├── config/
│   │   └── db.ts            # MongoDB Atlas connection & auto-seeding
│   ├── models/              # Mongoose schemas (Patient, Doctor, Appointment, etc.)
│   ├── routes/              # Express REST API routes
│   └── app.ts               # Express application configuration & middlewares
├── server.ts                # Unified full-stack server entry point (port 3000)
├── src/
│   ├── types/               # TypeScript interfaces
│   ├── data/                # Seed datasets with Indian clinical nomenclature & ₹ INR
│   ├── services/            # Frontend service layer (REST API calls + local fallback)
│   ├── context/             # AuthContext, ThemeContext, ToastContext
│   ├── components/          # Reusable UI primitives & layout components
│   └── pages/               # Feature dashboards & module views
├── Dockerfile               # Multi-stage production container build
├── docker-compose.yml       # Container orchestration
├── .github/workflows/ci.yml # Automated CI/CD build pipeline
└── package.json
```
