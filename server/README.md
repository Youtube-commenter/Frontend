
# YouTube Auto Commenter Backend

A Node.js Express backend for the YouTube Auto Commenter application, supporting multi-account management, proxy integration, and automated commenting.

## Features

### 1. Multi-Account Management
- OAuth 2.0 Authentication with Google
- Automatic Token Refresh
- Account Rotation
- Manual Proxy Assignment

### 2. Proxy Support & Anti-Detection
- Manual Proxy Assignment
- User-Agent Spoofing
- Fingerprint Evasion

### 3. Automated Commenting System
- Comment Posting via YouTube API
- Multithreading for Speed
- Batch Processing

### 4. Scheduling & Delay Management
- Custom Scheduling
- node-cron Integration
- Dynamic Delays

### 5. Smart Error Handling & API Monitoring
- Retry Mechanism
- Error Logging System
- Custom Alerts & Notifications

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file using `.env.example` as a template
4. Start the server: `npm run dev`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### YouTube Accounts
- `GET /api/accounts` - Get all YouTube accounts
- `GET /api/accounts/:id` - Get a specific account
- `PUT /api/accounts/:id` - Update an account
- `DELETE /api/accounts/:id` - Delete an account
- `POST /api/accounts/:id/refresh-token` - Force refresh OAuth token
- `POST /api/accounts/:id/verify` - Verify account is working

### Proxies
- `GET /api/proxies` - Get all proxies
- `POST /api/proxies` - Create a new proxy
- `PUT /api/proxies/:id` - Update a proxy
- `DELETE /api/proxies/:id` - Delete a proxy
- `POST /api/proxies/:id/check` - Check proxy health
- `POST /api/proxies/bulk-check` - Check multiple proxies

### Comments
- `GET /api/comments` - Get all comments
- `POST /api/comments` - Create a new comment
- `POST /api/comments/:id/retry` - Retry posting a failed comment
- `DELETE /api/comments/:id` - Delete a comment

### Scheduler
- `GET /api/scheduler` - Get all schedules
- `GET /api/scheduler/:id` - Get a specific schedule
- `POST /api/scheduler` - Create a new schedule
- `PUT /api/scheduler/:id` - Update a schedule
- `DELETE /api/scheduler/:id` - Delete a schedule
- `POST /api/scheduler/:id/pause` - Pause a schedule
- `POST /api/scheduler/:id/resume` - Resume a paused schedule

## Integration with Frontend

The backend is designed to work with the YouTube Auto Commenter React frontend. To connect the frontend to this backend:

1. Set the API base URL in the frontend to point to this server (default: http://localhost:4000)
2. Ensure the frontend sends authentication tokens in the Authorization header
3. Handle OAuth redirection in the frontend to capture the JWT token

## License

MIT
