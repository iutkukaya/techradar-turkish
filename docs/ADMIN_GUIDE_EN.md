# Admin Guide: LDAP, Logging, and Syslog

This document explains how to configure and use the newly added **LDAP Integration** and **Logging System** features in the Technology Radar application.

---

## 1. LDAP Integration (Active Directory)

Allows the application to authenticate against Active Directory or OpenLDAP servers and import users directly.

### Configuration
Log in as an **Admin** and navigate to the **Settings** tab.

*   **LDAP URL:** Server address (e.g., `ldap://192.168.1.5` or `ldaps://domain.com:636`). Select `ldaps` protocol if using SSL.
*   **Bind DN:** The distinguished name of the user to perform searches (e.g., `cn=admin,dc=example,dc=com` or `DOMAIN\user`).
*   **Bind Password:** Password for the Bind DN user.
*   **Search Base:** The root directory for searches (e.g., `dc=example,dc=com` or `ou=Users,dc=company,dc=local`).
*   **Search Filter:** Query to filter users (e.g., `(sAMAccountName={{username}})`).
    *   The `{{username}}` placeholder is automatically replaced with the input username during login.
*   **Active/Passive:** Use the toggle switch to enable or disable the integration.

### Importing Users
1.  Go to the **Users** tab.
2.  Click the **"Import from LDAP"** button.
3.  Search for users by username or display name.
4.  Select users from the list and click **"Import Selected"**.
5.  Imported users are stored without passwords; authentication is delegated directly to the LDAP server during login.

---

## 2. Advanced Logging

The application now records comprehensive logs for all critical activities.

### 2.1. Authentication Logs (Auth Logs)
*   **Scope:** Successful/Failed login attempts and logout actions.
*   **Details:** Username, IP Address, User Agent, Timestamp.
*   **Note:** IP addresses are sanitized; `::ffff:` prefixes are removed to store clean IPv4 addresses.

### 2.2. Audit Logs
*   **Scope:** Creation, updates, and deletion of Technologies and Settings.
*   **Smart Logging:** For setting updates, only the **changed fields** are recorded to reduce noise.
*   **Details:** Who did it?, When?, Old Value, New Value.

---

## 3. Syslog Integration

Forward your application logs to a centralized log management server (Graylog, Splunk, ELK, etc.).

### Configuration
Use the **"Loglama Ayarları (Syslog)"** section at the bottom of the **Settings** tab.

*   **Host:** IP address of your Syslog server (e.g., `192.168.1.50`).
*   **Port:** typically `514` (UDP) or `1514` (TCP).
*   **Protocol:** Choose UDP (faster) or TCP (more reliable).
*   **Enable Syslog:** Toggle this on to start forwarding logs.

**Important:** Changes take effect immediately upon saving; no server restart is required.

---

## Troubleshooting

*   **LDAP Connection Error:** Use the "Test Connection" button to verify settings. Ensure the firewall allows traffic on the LDAP port (389 or 636).
*   **No Syslog Logs:** Verify the target server is listening on the specified port and accepts standard Syslog formats.
*   **Incorrect Timestamps:** Logs use the server's local time. Ensure the server's system clock and timezone are correctly configured.
