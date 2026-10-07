# Tuition Class Student Management & Learning Management System (LMS)
### IT 403061 – Enterprise Systems Technologies and Architectures Individual Assignment

---

## 1. Project Overview
This project is an enterprise-grade, web-based **Tuition Class Student Management and Learning Management System (LMS)** designed for a private tuition teacher / master and their students. It features automated student credential generation, monthly tuition payment tracking, bank deposit slip verification, and strict monthly learning material access control.

The system is developed strictly adhering to the **Model-View-Controller (MVC)** architectural pattern, deployed seamlessly on **Vercel**, and backed by **Supabase PostgreSQL & Supabase Storage**.

---

## 2. Technology Stack
* **Framework**: Next.js 14 (App Router & React 18)
* **Language**: TypeScript & JavaScript
* **Styling**: Tailwind CSS with custom enterprise design system
* **Database**: Supabase PostgreSQL (Normalized Relational Schema with RLS)
* **File Storage**: Supabase Storage Buckets (`payment-slips`, `learning-materials`)
* **Security & Auth**: Bcrypt password hashing, JSON Web Tokens (JWT), HTTP-only Secure Cookies, Role-Based Access Control (RBAC)
* **Architecture**: Model-View-Controller (MVC)
* **Deployment**: Vercel ready (Zero PHP/Apache dependencies)

---

## 3. Quick Start & Local Development

### Prerequisites
* Node.js v18.17+ or v20+
* npm or pnpm or yarn

### Installation Steps
```bash
# 1. Clone or navigate to the project directory
cd LMS

# 2. Install project dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local

# 4. Start local development server
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 4. Supabase Database & Storage Setup

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Under **Project Settings -> API**, copy your:
   - `Project URL`
   - `anon public` key
   - `service_role` secret key

### Step 2: Run Database Schema SQL
1. Open the **SQL Editor** in your Supabase dashboard.
2. Open [`database/supabase_schema.sql`](file:///c:/xampp/htdocs/php/LMS/database/supabase_schema.sql) in this repository.
3. Paste the entire SQL script into the Supabase SQL Editor and click **Run**.
4. This will automatically create:
   - 10 Relational Tables (`users`, `admins`, `students`, `payments`, `payment_slips`, `learning_materials`, `notes`, `learning_links`, `material_attachments`, `audit_logs`)
   - Primary Keys, Foreign Keys, Indexes, Check Constraints & Triggers
   - Row Level Security (RLS) policies
   - Storage buckets (`payment-slips`, `learning-materials`)
   - Initial seed data (Admin account + 5 sample students + monthly payments + study materials)

### Step 3: Configure Environment Variables
Update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=super-secret-tuition-lms-jwt-token-key-2027
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: The system also includes an intelligent in-memory fallback layer, so all features (Registration, Auto Credentials, Login, Payment Slip Upload, Verification, Material Locking/Unlocking, CSV Export, Audit Logs) function immediately out of the box for testing even before linking your Supabase keys!

---

## 5. Demo Login Credentials

The system includes pre-configured demo accounts for testing and grading:

| Role | Username | Password | Purpose |
|:---|:---|:---|:---|
| **Admin / Tuition Master** | `admin` | `AdminPassword@123` | Full admin dashboard, student enrollment, slip verification, material publishing |
| **Student (Verified)** | `Kavindu` | `age@200` | January Verified (Notes & Videos unlocked), Feb Pending, March Unpaid |
| **Student (Rejected Slip)** | `Nimal` | `era@200` | January Rejected (Needs re-upload), February Verified |
| **Student (Unpaid)** | `Kasun` | `ndo@200` | Materials locked awaiting slip upload |

*Login form also includes instant **"Quick Fill"** buttons to auto-populate credentials with one click!*

---

## 6. Business Flows & Key Features

### 1. Automatic Student Credentials Generation
When the admin registers a student:
- **Username**: Generated automatically from the student's **First Name** (e.g., `Kavindu`).
- **Password**: Generated using the formula:
  $$\text{Last 3 characters of Last Name} + \text{"@"} + \text{First 3 digits of NIC}$$
  *Example*: Last Name: `Silpage` + NIC: `200012345678` $\rightarrow$ `age@200`
- A dedicated **"Student Login Credentials"** card appears with a **Copy to Clipboard** button immediately upon registration.

### 2. Monthly Payment & Slip Upload Flow
1. Student logs in and navigates to **Monthly Payments**.
2. Student selects the target tuition month (e.g. `February 2027`).
3. Student uploads a bank deposit slip / transfer receipt (JPG, PNG, PDF).
4. System sets status to **`SLIP UPLOADED`** (Awaiting teacher verification).

### 3. Admin Verification Flow
1. Admin opens **Verify Slips** page.
2. Admin reviews the slip image preview.
3. Admin clicks **Verify**:
   - Status changes to **`VERIFIED`**.
   - System unlocks that month's study content for the student.
4. If invalid, Admin clicks **Reject** and inputs a reason (e.g. *"Slip is unclear, please re-upload"*).

### 4. Strict Monthly Access Control (Gatekeeper)
- Learning materials (Notes, Video Streams, PDF Files) are **strictly gated at the backend API/Model level**.
- If a student tries to fetch materials for an unverified month, the backend masks/strips lesson bodies and URLs, and the frontend displays:
  > *"Please complete and verify your monthly payment to access these materials."*

---

## 7. Model-View-Controller (MVC) Project Structure

```
src/
├── models/                           # MODEL LAYER (Data Access, DB Queries, Domain Rules)
│   ├── db.ts                         # Supabase connection singleton
│   ├── types.ts                      # Entity models and interfaces
│   ├── user.model.ts                 # Auth and user records
│   ├── student.model.ts              # Student data and credential generation logic
│   ├── payment.model.ts              # Monthly payments, slip storage, verification
│   ├── material.model.ts             # Learning materials and strict access control checks
│   ├── audit.model.ts                # Enterprise audit logging
│   └── report.model.ts               # KPI summaries and monthly aggregates
│
├── controllers/                      # CONTROLLER LAYER (Request Orchestration & Validation)
│   ├── auth.controller.ts            # Authentication, JWT signing, password checks
│   ├── student.controller.ts         # Regex validation and registration controller
│   ├── payment.controller.ts         # Slip upload and verification controller
│   ├── material.controller.ts        # Material CRUD and monthly access gatekeeper
│   └── report.controller.ts          # Report calculations and CSV exporter
│
├── views/                            # VIEW LAYER (Pure UI Presentation Components)
│   ├── auth/LoginView.tsx            # Login card with demo credential quick-fill
│   ├── admin/
│   │   ├── AdminDashboardView.tsx    # Summary metrics & pending approval widget
│   │   ├── StudentListView.tsx       # Student table with search, edit, reset pass
│   │   ├── StudentRegisterView.tsx   # Registration form & auto-credential modal
│   │   ├── PaymentVerificationView.tsx # Slip preview and verify/reject modal
│   │   ├── MaterialManagerView.tsx   # Link, Note, File publishing interface
│   │   ├── ReportsView.tsx           # Monthly analytics table with CSV export
│   │   └── AuditLogsView.tsx         # Audit log stream
│   ├── student/
│   │   ├── StudentDashboardView.tsx  # Student welcome, month cards, quick links
│   │   ├── StudentProfileView.tsx    # Profile details screen
│   │   ├── StudentPaymentView.tsx    # Monthly slip upload interface
│   │   └── StudentMaterialsView.tsx  # Unlocked notes reader, video player, PDF downloader
│   └── components/                   # Shared Reusable UI Components (Navbar, Sidebar, Modal, Badge, Button, Input, Alert)
│
├── app/                              # Next.js App Router Entrypoints
│   ├── api/                          # HTTP Route Handlers (Dispatches to Controllers)
│   ├── admin/                        # Admin Portal Pages
│   ├── student/                      # Student Portal Pages
│   └── login/                        # Login Route
│
├── lib/                              # Shared Utilities (Bcrypt, JWT, Regex Validators, Formatters)
├── database/                         # Supabase PostgreSQL SQL Schema & Seed Script
└── docs/                             # Complete University Assignment Documentation
```

---

## 8. Deployment to Vercel

The application is architected for zero-configuration deployment on Vercel:

1. Push this repository to GitHub / GitLab.
2. In the Vercel dashboard, click **"Add New Project"** and import your repository.
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
4. Click **Deploy**. Vercel will automatically build and deploy the application.

---

## 9. Academic Documentation
For the complete assignment documentation including Use Case Diagrams, Class/ER Diagrams, Sequence Diagrams, and 17-point Test Matrix, see [`docs/ASSIGNMENT_DOCUMENTATION.md`](file:///c:/xampp/htdocs/php/LMS/docs/ASSIGNMENT_DOCUMENTATION.md).
