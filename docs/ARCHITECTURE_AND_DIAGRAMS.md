# Architecture and Diagrams

This document visualizes the technical architecture, database structure, and component relationships of the Technology Radar project.

## 1. Database Entity-Relationship Diagram (ERD)

The following diagram shows the tables and schemas in the SQLite database.

```mermaid
erDiagram
    USERS {
        int id PK
        string username
        string password "Hashed"
        string permissions "ADMIN | READ_ONLY"
        string source "LOCAL | LDAP"
    }

    TECHNOLOGIES {
        int id PK
        string name
        string description
        string quadrant
        string ring
        int active
        string attribute
        real angleParam
        real radiusParam
    }

    SETTINGS {
        string key PK
        string value
    }

    AUTH_LOGS {
        int id PK
        string username
        string event_type "LOGIN_SUCCESS | LOGIN_FAIL | LOGOUT"
        string ip_address
        string user_agent
        datetime timestamp
    }

    AUDIT_LOGS {
        int id PK
        string username
        string action "CREATE | UPDATE | DELETE"
        string entity_type "TECHNOLOGY | SETTINGS"
        string entity_id
        string old_value
        string new_value
        datetime timestamp
    }

    %% Relationships (Implied Logic)
    USERS ||--o{ AUTH_LOGS : "generates"
    USERS ||--o{ AUDIT_LOGS : "performs"
    TECHNOLOGIES ||--o{ AUDIT_LOGS : "tracked in"
    SETTINGS ||--o{ AUDIT_LOGS : "tracked in"
```

## 2. C4 Container Diagram (System Architecture)

This diagram shows the high-level components of the system and interactions with external systems.

```mermaid
C4Container
    title Container Diagram - Tech Radar

    Person(user, "User", "Person viewing or managing the radar")
    
    System_Boundary(tech_radar, "Technology Radar System") {
        Container(spa, "Single Page App", "React, Vite", "User interface and radar visualization")
        Container(api, "API Application", "Node.js, Express", "Business logic, authentication, logging")
        ContainerDb(database, "Database", "SQLite", "Stores users, technologies, settings and logs")
    }

    System_Ext(ldap, "LDAP / AD Server", "Corporate Authentication")
    System_Ext(syslog, "Syslog Server", "Centralized Log Collection (Graylog/Splunk)")

    Rel(user, spa, "Views / Manages", "HTTPS")
    Rel(spa, api, "Makes API Calls", "JSON/HTTPS")
    Rel(api, database, "Reads / Writes", "SQL")
    
    Rel(api, ldap, "Authenticates", "LDAP/S")
    Rel(api, syslog, "Sends Logs", "UDP/TCP")
```

## 3. Sequence Diagrams

This section shows how critical processes work step-by-step.

### 3.1. Authentication (Login) Flow

The system's decision mechanism when a user attempts to log in:

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant API as Backend API
    participant DB as SQLite DB
    participant LDAP as LDAP Server
    participant Log as Logger Service

    User->>API: POST /api/auth/login (username, password)
    
    API->>API: Check LDAP Settings
    
    alt If LDAP Active
        API->>LDAP: Bind & Search User
        
        alt LDAP Success
            LDAP-->>API: User Verified
        else LDAP Fail
            LDAP-->>API: Error
            API->>DB: Check Local User (Fallback)
            DB-->>API: User/Pass Result
        end
    else If LDAP Passive
        API->>DB: Check Local User
        DB-->>API: Result
    end

    alt Login Success
        API->>API: Generate JWT Token
        API->>Log: logAuth(LOGIN_SUCCESS)
        API-->>User: 200 OK + Token
    else Login Fail
        API->>Log: logAuth(LOGIN_FAIL)
        API-->>User: 401 Unauthorized
    end
```

### 3.2. Data Update and Audit Log Flow

The "Audit" and "Syslog" process that occurs when a technology is updated:

```mermaid
sequenceDiagram
    autonumber
    participant Admin as Admin User
    participant API as Backend API
    participant DB as SQLite DB
    participant Log as Logger Service
    participant Syslog as Syslog Server

    Admin->>API: PUT /api/radar/:id (New Data)
    
    note right of API: Need old data for Audit
    API->>DB: SELECT * FROM technologies WHERE id=:id
    DB-->>API: Old Data (OldValue)
    
    API->>DB: UPDATE technologies SET ...
    DB-->>API: Success
    
    API->>Log: logAudit(UPDATE, OldVal, NewVal)
    
    par Parallel Logging
        Log->>DB: INSERT INTO audit_logs (...)
        Log->>Syslog: Send Packet (UDP/TCP)
    end
    
    API-->>Admin: 200 OK
```

## 4. Backend Module Diagram (Class Diagram)

This diagram shows the logical separation of the backend code and dependencies between modules.

```mermaid
classDiagram
    direction TB
    
    class ServerJS {
        +API Routes (/api/*)
        +Auth Middleware
        +Start Server()
    }

    class DatabaseJS {
        +sqlite3.Database
        +initializeTables()
        +Helper Methods
        -users Table
        -technologies Table
        -logs Tables
    }

    class LoggerJS {
        +reconfigureSyslog(settings)
        +logAuth(username, event)
        +logAudit(updateData)
        -SqliteTransport
        -Winston Instance
    }

    class LdapServiceJS {
        +authenticate(username, password)
        +searchUsers(query)
        +createClient()
    }

    %% Dependencies
    ServerJS --> DatabaseJS : Imports & Uses
    ServerJS --> LoggerJS : Central Logging
    ServerJS --> LdapServiceJS : Auth Delegation
    LoggerJS --> DatabaseJS : Writes Logs
```

### Module Relationship Explanation

*   **ServerJS:** The brain and gateway of the application.
    *   `+`: Indicates public properties. E.g., defines API routes (`/api/*`) and starts the server (`Start Server`).
*   **DatabaseJS:** The memory center.
    *   Establishes the database connection (`sqlite3.Database`).
    *   Creates tables if they don't exist via `initializeTables()`.
    *   `-`: Indicates private structure. The tables themselves (`users`, `technologies`) are under this module's management.
*   **LoggerJS:** The record keeper.
    *   `logAuth` and `logAudit` functions are open for use by other modules.
    *   It uses a custom `SqliteTransport` (its own database driver) and the Winston library in the background.
*   **LdapServiceJS:** The external relations expert.
    *   Only handles user/password authentication (`authenticate`) and search (`searchUsers`) tasks.

**Arrows (Relationships):**
*   **ServerJS --> Others:** Server.js is the top-level manager; it imports and uses Database, Logger, and LDAP services.
*   **LoggerJS --> DatabaseJS:** This is an interesting detail; The Logging service relies on the Database module to write logs. Meaning Logger does not work alone, it depends on the database.
