# Installation and Deployment Guide

This guide explains how to install and run the portable version of the Turkish Technology Radar application.

## 1. Package Contents
**Note:** If you downloaded this project from Git, the `dist` folder will not be present. You must generate this folder yourself by following the "Production / Portable Mode" steps in the **Technical Overview** document.

The generated `dist` folder contains everything needed to run the application:
- **`turkish-tech-radar-server.exe`**: The main server executable.
- **`node_sqlite3.node`**: Required file for the database engine.
- **`public/`**: Web interface files (HTML, CSS, JS).
- **`start.bat`**: Script to easily launch the application.
- **`radar.db`**: Database file (automatically created on first run).

## 2. Installation Requirements
This package is **portable**.
- **No Node.js installation required** on the target machine.
- Only a Windows operating system is required.

## 3. Running the Application
1.  Copy the `dist` folder to any location on your computer (e.g., Desktop).
2.  Double-click the **`start.bat`** file inside the folder.
3.  A black command window will open, and the server will start.
4.  After a few seconds, your default web browser will automatically open to `http://localhost:3000`.

## 4. Moving to Another Server
To move the application to another computer or server:
1.  Compress the entire `dist` folder into a `.zip` file.
2.  Copy it to the target computer and extract it.
3.  Run it using `start.bat`.

**Note:** If you want to preserve your existing data (users, technologies), make sure to copy the `radar.db` file as well.

## 5. Troubleshooting
**Question: The browser opens but I see "Connection Refused" or an error.**
- Check the **black server window** that opened when you ran `start.bat`.
- If there are red error messages in the window, note them down.
- A common error is a missing or incompatible `node_sqlite3.node` file.

**Question: I get a "Port 3000 is already in use" error.**
- There might be another application using port 3000 on your computer. Close the conflicting application from Task Manager.

**Question: I get database errors.**
- Ensure the folder containing the application has "Write Permission". The application needs write access to create and update the `radar.db` file.

## 6. Frequently Asked Questions (FAQ)

**Question: Does this install anything on my computer?**
No. This is not an "installation". The `dist` folder is completely **portable**. You can put it on a USB drive and run it directly on another Windows computer. It writes nothing to the computer's registry or system files.

**Question: How do I close the program?**
Simply close the **black command window** that opened when you ran `start.bat`. Closing this window stops the server.

**Question: What happens to my data?**
All your data (technologies, users, settings) is stored in the **`radar.db`** file automatically created inside the `dist` folder.
- Your data is **preserved** when you close and reopen the program.
- As long as you move the `radar.db` file along with the folder when moving to another computer, your data will not be lost.
- **Important:** If you delete the `dist` folder, your data will be deleted. You can back up your data by backing up the `radar.db` file.
