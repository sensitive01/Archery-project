# Archery Coaching Academy Platform

## Project Overview

This is a comprehensive, full-stack MERN (MongoDB, Express, React, Node.js) web application designed for managing an Archery Coaching Academy. It features a stunning, modern UI built with Vite, React, and Tailwind CSS, providing dedicated portals for Administrators, Students, and Coaches.

## Core Modules & Features

### 1. Public Website
- **Dynamic Landing Pages**: Hero sections, program highlights, testimonials, and integrated image galleries.
- **Pay and Play**: A public booking interface allowing guests to book single-session slots with ease.
- **Contact & Inquiry**: Integrated contact forms and location details.

### 2. Admin Portal
- **Dashboard Analytics**: Overview of total students, active batches, revenue, and attendance metrics.
- **Student & Coach Management**: Full CRUD operations with detailed profile views, enrollment tracking, and access control.
- **Batch Management**: Create training batches, link to courses, assign coaches, and manage student capacity.
- **Payment & Invoicing**: Track offline payments, fee statuses, upload receipts, and manage transactions.
- **Content Management**: Manage homepage banners, photo galleries, event listings, and announcements dynamically.
- **Attendance Tracking**: Monitor and log daily attendance for different batches.

### 3. Student Portal
- **Personalized Dashboard**: View enrolled programs, assigned batches, upcoming schedule, and attendance stats.
- **Score Tracking**: Students can view their progress and recent archery scores logged by coaches.

### 4. Coach Portal (Coming Soon)
- **Batch Management**: View assigned batches and student lists.
- **Attendance & Scoring**: Log daily attendance and record scores for students.

---

## 🛡️ Security Implementation Details

Security is a primary focus of this architecture. Multiple layers of defense have been implemented on the Node.js / Express backend to protect data, prevent abuse, and ensure safe authentication:

### 1. Authentication & Authorization
- **JWT (JSON Web Tokens)**: Stateless authentication using secure, signed JWTs passed via **Bearer Tokens** in the `Authorization` header.
- **Role-Based Access Control (RBAC)**: Custom middleware (`authMiddleware.js`) ensures routes are protected (`protect`) and restricts sensitive operations to specific roles (`admin`).
- **Secure Password Storage**: All user passwords are encrypted and salted using `bcryptjs` before being stored in the database.

### 2. Attack Prevention & API Protection
- **Rate Limiting (`express-rate-limit`)**: Protects against brute-force attacks and DDoS by limiting API requests. (Configured to 500 requests per 15-minute window per IP).
- **HTTP Header Security (`helmet`)**: Automatically sets various HTTP headers to mitigate common web vulnerabilities (like Clickjacking, MIME-sniffing, etc.).
- **NoSQL Injection Prevention (`express-mongo-sanitize`)**: Strips out prohibited characters (like `$`) from user inputs (req.body, req.query, req.params) to prevent NoSQL injection attacks on MongoDB.
- **XSS Protection (`xss-clean`)**: Sanitizes user input to prevent Cross-Site Scripting (XSS) attacks by escaping HTML and malicious JavaScript payloads.
- **CORS (`cors`)**: Configured Cross-Origin Resource Sharing to strictly control which frontend domains are allowed to communicate with the backend API.

---

## Prerequisites

- Node.js (v16+ recommended)
- MongoDB running locally on port 27017 (or a MongoDB Atlas URI)

## How to Run

### 1. Start the Database
Ensure MongoDB is running on your machine:
```bash
mongod
```

### 2. Setup & Start the Backend Server
```bash
cd server
npm install
npm run dev
```
*The server will run on `http://localhost:5000`.*

### 3. Setup & Start the Frontend Client
```bash
cd client
npm install
npm run dev
```
*The client will run on `http://localhost:5173`.*

## Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/archery_db
JWT_SECRET=your_super_secret_jwt_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name (For image uploads)
```

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide React, React Hot Toast.
- **Backend**: Node.js, Express, Mongoose.
- **Security**: JWT, BcryptJS, Helmet, Express-Rate-Limit, Express-Mongo-Sanitize, XSS-Clean.
