import './FeaturesList.css';

const FeaturesList = () => {
    return (
        <div className="featuresList">
            <h1>MERN E-Commerce Platform</h1>
            <h4>Full-stack responsive e-commerce application built with React, Node.js, Express, MongoDB, Redux Toolkit and RTK Query.</h4>
            <h2>Technical Highlights :</h2>
            <ul>
                <li>RTK Query + Redux architecture for API/server-state and client-state management</li>
                <li>JWT authentication + refresh-token rotation</li>
                <li>15-minute access tokens + 7-day refresh sessions</li>
                <li>Refresh-request idempotency to prevent duplicate refresh API calls</li>
                <li>Multi-tab Redux state synchronization</li>
                <li>Debounced product search with instant result suggestions</li>
                <li>Stripe test checkout with complete order flow</li>
                <li>Admin/test-account architecture for safely demonstrating admin features</li>
                <li>Fully responsive UI across pages and components</li>
            </ul>
            <h2>Features :</h2>
            <ul>
                <li>JWT authentication with 15-minute access tokens</li>
                <li>Refresh-token rotation with HTTP-only cookies</li>
                <li>Cart, checkout and Stripe test payments</li>
                <li>Debounced product search, filtering and pagination</li>
                <li>User profile, orders, password reset and account deletion</li>
                <li>Admin dashboard with products, users, orders and reviews</li>
                <li>Test user/admin accounts for safely demonstrating features</li>
                <li>RTK Query, Redux Persist and Redux State Sync</li>
                <li>Multi-tab state synchronization</li>
                <li>Fully responsive UI</li>
                <li>Dashboard graphs and custom CSS Grid data lists</li>
            </ul>
            <h2>Tech Stack :</h2>
            <h4>React • Redux Toolkit • RTK Query • Node.js • Express • MongoDB • JWT • bcrypt • Stripe • REST API</h4>
            <h2>Authentication Architecture :</h2>
            <ul>
                <li>Access token expires after 15 minutes</li>
                <li>Refresh token stored in HTTP-only cookie</li>
                <li>Refresh tokens rotated during refresh</li>
                <li>Silent access-token renewal</li>
                <li>7-day refresh-token validity</li>
                <li>Protection against duplicate refresh requests</li>
            </ul>
        </div>
    )
}

export default FeaturesList;