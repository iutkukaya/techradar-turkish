# Technical Overview

This document provides a high-level overview of the codebase structure and key files for the Turkish Technology Radar application.

## Directory Structure

```
/
├── client/                 # Frontend Application (React + Vite)
│   ├── public/             # Static assets (favicon, etc.)
│   ├── src/
│   │   ├── components/     # React Components
│   │   │   ├── AdminDashboard.jsx  # Main admin panel component
│   │   │   ├── Login.jsx           # Login page component
│   │   │   ├── Radar.jsx           # D3.js visualization logic
│   │   │   └── RadarView.jsx       # Public radar view wrapper
│   │   ├── hooks/          # Custom React Hooks
│   │   │   └── useSessionManager.js # Session timeout logic
│   │   ├── App.jsx         # Main app component & routing
│   │   ├── index.css       # Global styles & variables
│   │   └── main.jsx        # Entry point
│   ├── index.html          # HTML template
│   └── vite.config.js      # Vite configuration
│
├── server/                 # Backend Application (Node.js + Express)
│   ├── database.js         # SQLite connection & schema initialization
│   ├── server.js           # Main server file (API routes & middleware)
│   ├── package.json        # Backend dependencies
│   └── radar.db            # SQLite database file (created at runtime)
```

## Key Files & Functions

### Backend (`server/`)

#### `server.js`
- **Authentication:**
    - `POST /api/login`: Authenticates users and issues JWTs.
    - `POST /api/refresh-token`: Refreshes expired access tokens.
    - `authenticateToken`: Middleware to verify JWTs.
    - `checkAdmin`: Middleware to enforce admin-only access.
- **Radar API:**
    - `GET /api/radar`: Fetches all technologies.
    - `POST /api/radar`: Adds a new technology.
    - `PUT /api/radar/:id`: Updates a technology (including position).
    - `DELETE /api/radar/:id`: Deletes a technology.
- **Settings API:**
    - `GET /api/settings`: Fetches visual settings.
    - `PUT /api/settings`: Updates visual settings.
- **User Management:**
    - `GET /api/users`: Lists all users.
    - `POST /api/users`: Creates a new user.
    - `PUT /api/users/:id`: Updates user password/permissions.

#### `database.js`
- Initializes the SQLite database.
- Creates tables: `users`, `technologies`, `settings`.
- Seeds the default admin user (`admin` / `admin123`).

### Frontend (`client/`)

#### `src/components/Radar.jsx`
- **Core Visualization:** Uses D3.js to render the radar.
- **Force Simulation:** Handles collision detection to prevent dot overlap.
- **Drag & Drop:** Implements dragging logic for admins.
- **Rendering:** Draws rings, lines, blips, and labels.

#### `src/components/AdminDashboard.jsx`
- **State Management:** Manages state for technologies, users, and settings forms.
- **Tabs:** Switches between Technologies, Users, Logo, and Settings views.
- **Form Handling:** Handles submissions for creating/editing items.
- **Dynamic Styles:** Applies color settings to form inputs.

#### `src/components/RadarView.jsx`
- **Data Fetching:** Fetches radar data and settings on load.
- **Layout:** Renders the `Radar` component, branding, legends, and corner lists.
- **Popups:** Handles the hover state to show technology details.

#### `src/hooks/useSessionManager.js`
- **Session Logic:** Tracks user activity (mouse movement, clicks).
- **Auto-Logout:** Logs out inactive users after 10 minutes.
- **Token Refresh:** Automatically refreshes the token if the user is active.

## Making Changes

### Changing Colors
- **Runtime:** Use the Admin Panel > Settings tab.
- **Defaults:** Edit `defaultSettings` in `client/src/components/AdminDashboard.jsx` and `client/src/components/RadarView.jsx`.

### Adding New Quadrants/Rings
- **Database:** No schema change needed (stored as text).
- **Frontend:** Update `quadrants` and `rings` arrays in `Radar.jsx`, `RadarView.jsx`, and `AdminDashboard.jsx`.

### Modifying Permissions
- **Backend:** Update `server.js` middleware or the `users` table schema in `database.js`.
- **Frontend:** Update the permission checks in `AdminDashboard.jsx`.

## Dependencies

### Frontend (`client/package.json`)
- `react`: ^19.2.0
- `react-dom`: ^19.2.0
- `react-router-dom`: ^7.9.6
- `d3`: ^7.9.0
- `vite`: ^7.2.4 (Dev)

### Backend (`server/package.json`)
- `express`: ^4.18.2
- `sqlite3`: ^5.1.7
- `bcrypt`: ^5.1.1
- `jsonwebtoken`: ^9.0.2
- `cors`: ^2.8.5
- `multer`: ^2.0.2
- `nodemon`: ^3.0.3 (Dev)

## Running the Application

### Development Mode
1.  **Backend:** `cd server` -> `npm start`
2.  **Frontend:** `cd client` -> `npm run dev`

### Production / Portable Mode
The application is packaged using `pkg` into a standalone executable.
- **Location:** `server/dist/`
- **Executable:** `turkish-tech-radar-server.exe`
- **Start Script:** `start.bat` (Launches server and opens browser)
- **Dependencies:** The `dist` folder contains the `node_sqlite3.node` binary and `public` assets required for the app to run without Node.js installed.
