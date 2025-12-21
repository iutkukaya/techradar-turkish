# Linux Deployment Guide

This guide explains how to deploy the Turkish Technology Radar application on Linux systems (Ubuntu, Red Hat, etc.) using Docker.

## Prerequisites

-   **Docker**: [Install Docker Engine](https://docs.docker.com/engine/install/)
-   **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)

## Quick Start (Docker Compose)

1.  Navigate to the project root directory.
2.  Run the following command to build and start the application:

    ```bash
    docker-compose up -d --build
    ```

    The application will be accessible at `http://localhost:3000`.

3.  To stop the application:

    ```bash
    docker-compose down
    ```

## Persistence

The database file `radar.db` is persisted in the `./data` directory on your host machine. This ensures that your data is saved even if the container is removed.

## OpenShift Deployment

This application is compatible with OpenShift and Kubernetes. Use the provided `Dockerfile` to build an image.

### OpenShift Considerations

-   **Non-Root User**: The Dockerfile is configured to run as a non-root user (`node`, uid 1000), complying with OpenShift's default security policies.
-   **Permissions**: The application directory `/app` is owned by the `node` user.
-   **Storage**: For OpenShift, you should mount a **Persistent Volume Claim (PVC)** to `/app/data` to ensure database persistence.

### Example OpenShift Workflow

1.  **Create a New App** from the source (assuming you have a git repo):

    ```bash
    oc new-app https://github.com/your-repo/teknoloji-radari.git --name=tech-radar
    ```

2.  **Add Storage** (Crucial for SQLite persistence):

    ```bash
    oc set volume deployment/tech-radar --add --name=radar-storage -t pvc --claim-size=1Gi --mount-path=/app/data
    ```

3.  **Expose the Service**:

    ```bash
    oc expose svc/tech-radar
    ```
