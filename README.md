# MERN E-Commerce Platform

Full-stack responsive e-commerce application built with React,
Node.js, Express, MongoDB, Redux Toolkit and RTK Query.

🔗 Live Demo: `https://demcom.onrender.com/`

---

## ⭐ Technical Highlights

- **RTK Query + Redux architecture** for API/server-state and client-state management
- **JWT authentication + refresh-token rotation**
- **15-minute access tokens + 7-day refresh sessions**
- **Refresh-request idempotency** to prevent duplicate refresh API calls
- **Multi-tab Redux state synchronization**
- **Debounced product search** with instant result suggestions
- **Stripe test checkout** with complete order flow
- **Admin/test-account architecture** for safely demonstrating admin features
- **Fully responsive UI** across pages and components

---

## Features

- 🔐 JWT authentication with 15-minute access tokens
- 🔄 Refresh-token rotation with HTTP-only cookies
- 🛒 Cart, checkout and Stripe test payments
- 🔎 Debounced product search, filtering and pagination
- 👤 User profile, orders, password reset and account deletion
- 🧑‍💼 Admin dashboard with products, users, orders and reviews
- 🧪 Test user/admin accounts for safely demonstrating features
- ⚡ RTK Query, Redux Persist and Redux State Sync
- 🔄 Multi-tab state synchronization
- 📱 Fully responsive UI
- 📊 Dashboard graphs and custom CSS Grid data lists

---

## Tech Stack

React • Redux Toolkit • RTK Query • Node.js • Express • MongoDB
JWT • bcrypt • Stripe • REST API

---

## Authentication Architecture

- Access token expires after 15 minutes
- Refresh token stored in HTTP-only cookie
- Refresh tokens rotated during refresh
- Silent access-token renewal
- 7-day refresh-token validity
- Protection against duplicate refresh requests
