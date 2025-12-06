# Turkish Technology Radar

This project is an interactive, web-based technology radar application designed to track and categorize technologies.


## Features
- **Dynamic Visualization:** D3.js-based radar with drag-and-drop support.
- **Admin Dashboard:** Secure panel to manage technologies, users, and settings.
- **Portability:** Can be packaged as a portable `.exe` requiring no installation.
- **Turkish Interface:** Fully Turkish user experience.

## Documentation
For detailed information, please refer to the guides in the `docs/` folder:

- **[Installation and Deployment Guide](docs/installation_guide.md):** How to run and package the application.
- **[Walkthrough](docs/walkthrough.md):** Features and usage of the application.
- **[Admin Guide](docs/admin_guide.md):** How to use the admin panel.
- **[Technical Overview](docs/technical_overview.md):** Code structure and development details.

## Quick Start (For Developers)

After downloading the project:

1.  **Install Dependencies:**
    ```bash
    cd server && npm install
    cd ../client && npm install
    ```

2.  **Run in Development Mode:**
    - Terminal 1 (Server): `cd server && npm start`
    - Terminal 2 (Client): `cd client && npm run dev`

3.  **Create Portable Build:**
    ```bash
    cd server
    npm run build:exe  # (This command uses pkg to generate the dist folder)
    ```

## License
This project is licensed under the [MIT License](LICENSE).
