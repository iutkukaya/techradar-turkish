# Turkish Technology Radar - Walkthrough

## Overview
The **Turkish Technology Radar** is an interactive, web-based visualization tool designed to track and categorize technologies. It features a dynamic D3.js-based radar, a secure admin panel for management, and extensive customization options.

## Features

### 1. Interactive Radar Visualization
- **Quadrants:** Technologies are categorized into four quadrants: *Araçlar* (Tools), *Diller ve Çerçeveler* (Languages & Frameworks), *Platformlar* (Platforms), and *Teknikler* (Techniques).
- **Rings:** Items are placed in concentric rings indicating their adoption status: *Benimse* (Adopt), *Test Et* (Trial), *Değerlendir* (Assess), and *Çık* (Hold).
- **Interactive Blips:** Hovering over a dot reveals detailed information.
- **Collision Detection:** A force simulation ensures dots do not overlap, maintaining readability.
- **Responsive Design:** The radar automatically adjusts to fit the screen size.

### 2. Admin Dashboard
- **Secure Login:** Protected by JWT authentication with session management.
- **Technology Management:** Add, edit, and delete technologies.
- **User Management:** Create and manage users with specific permissions (RBAC).
    - **Admin:** Full access.
    - **Quadrant-Specific:** Can only edit technologies in their assigned quadrant.
- **Customization:**
    - **Colors:** Customize ring colors, text colors, and background gradients.
    - **Logo:** Upload a custom logo for the radar view.

### 3. User Experience
- **Categorized Lists:** Technologies are listed in the corners of the screen for quick reference.
- **Legends:** Clear legends for rings and status indicators (New, Ring Up, Ring Down).
- **Persistence:** Dragged positions are saved automatically for Admins.

## Usage

### Launching the Application
- **Portable Version:** Double-click `start.bat` in the `dist` folder.
- **Development Version:** Run `npm start` in the `server` directory and `npm run dev` in the `client` directory.

### Viewing the Radar
1.  Open the application in your browser (default: `http://localhost:3000`).
2.  Explore the radar by hovering over dots or checking the lists in the corners.
3.  Use the legends at the bottom to understand the color codes and shapes.

### Admin Panel
1.  Click the **"Yönetici Girişi"** button in the top right.
2.  Log in with your credentials.
3.  **Teknolojiler Tab:** Manage the radar items.
4.  **Kullanıcılar Tab:** Manage other users (Admin only).
5.  **Logo Yükle Tab:** Update the application logo.
6.  **Ayarlar Tab:** Customize the visual appearance of the radar.

## Technical Stack
- **Frontend:** React, Vite, D3.js
- **Backend:** Node.js, Express, SQLite
- **Authentication:** JWT, Bcrypt
