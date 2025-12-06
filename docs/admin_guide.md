# Admin Guide

## 1. Accessing the Admin Panel

### Launching the Application
Before accessing the panel, ensure the application is running:
- **Portable:** Double-click `start.bat`.
- **Dev:** Run `npm start` (server) and `npm run dev` (client).

To access the admin panel, navigate to the main page (`http://localhost:3000`) and click the **"Yönetici Girişi"** (Admin Login) button in the top right corner.

**Default Credentials:**
- **Username:** `admin`
- **Password:** `admin123`
*(Note: Please change this password immediately after your first login)*

## 2. Dashboard Overview
The dashboard is divided into four main tabs:
1.  **Teknolojiler (Technologies):** Manage the items on the radar.
2.  **Kullanıcılar (Users):** Manage system users and permissions (Admin only).
3.  **Logo Yükle (Upload Logo):** Change the application branding.
4.  **Ayarlar (Settings):** Customize the visual theme.

## 3. Managing Technologies
### Adding a New Technology
1.  Go to the **Teknolojiler** tab.
2.  Click the **"+ Yeni Ekle"** button.
3.  Fill in the form:
    - **İsim (Name):** The name of the technology.
    - **Açıklama (Description):** A brief description (shown on hover).
    - **Çeyrek (Quadrant):** Select the category (e.g., Araçlar).
    - **Halka (Ring):** Select the adoption status (e.g., Benimse).
    - **Öznitelik (Attribute):** Optional status indicator (New, Ring Up, Ring Down).
    - **Aktif:** Uncheck to hide the item from the radar without deleting it.
4.  Click **"Kaydet"** (Save).

### Editing/Deleting
- Click **"Düzenle"** (Edit) to modify an item.
- Click **"Sil"** (Delete) to remove an item permanently.

## 4. Managing Users (Admin Only)
### Creating a User
1.  Go to the **Kullanıcılar** tab.
2.  Click **"+ Yeni Kullanıcı"**.
3.  Enter a **Username** and **Password**.
4.  Select **Permissions**:
    - **ADMIN:** Can manage everything.
    - **Specific Quadrant:** Can only add/edit items in that specific quadrant.
5.  Click **"Kaydet"**.

### Changing Passwords
- You can change your own password using the "Şifremi Değiştir" section at the bottom of the Users tab.
- Admins can reset other users' passwords by editing the user.

## 5. Customizing the Radar
### Logo
- Go to the **Logo Yükle** tab.
- Select a PNG image and click **"Yükle"**.
- Refresh the page to see the new logo.

### Visual Settings
- Go to the **Ayarlar** tab.
- **Genel Renkler:** Change the background gradient and main title color.
- **Liste Renkleri:** Change the color of the lists in the corners.
- **Halka Renkleri:** Change the colors for each ring (Benimse, Test Et, etc.).
- Click **"Ayarları Kaydet"** to apply changes.

## 6. Drag & Drop Positioning
- As a logged-in admin, you can drag dots on the radar to adjust their positions.
- The new position is **automatically saved** when you release the mouse.
- Dragging is constrained to the item's assigned quadrant and ring.
