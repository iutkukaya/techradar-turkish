# Mimari ve Diyagramlar

Bu doküman, Teknoloji Radarı projesinin teknik mimarisini, veritabanı yapısını ve bileşenler arası ilişkileri görselleştirmektedir.

## 1. Veritabanı Varlık-İlişki Diyagramı (ERD)

Aşağıdaki diyagram, SQLite veritabanındaki tabloları ve şemalarını göstermektedir.

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

## 2. C4 Konteyner Diyagramı (Sistem Mimarisi)

Bu diyagram, sistemin üst düzey bileşenlerini ve dış sistemlerle olan etkileşimlerini gösterir.

```mermaid
C4Container
    title Konteyner Diyagramı - Teknoloji Radarı

    Person(user, "Kullanıcı", "Radarı görüntüleyen veya yöneten kişi")
    
    System_Boundary(tech_radar, "Teknoloji Radarı Sistemi") {
        Container(spa, "Single Page App", "React, Vite", "Kullanıcı arayüzü ve radar görselleştirmesi")
        Container(api, "API Application", "Node.js, Express", "İş mantığı, kimlik doğrulama, loglama")
        ContainerDb(database, "Database", "SQLite", "Kullanıcılar, teknolojiler, ayarlar ve logları saklar")
    }

    System_Ext(ldap, "LDAP / AD Server", "Kurumsal Kimlik Doğrulama")
    System_Ext(syslog, "Syslog Server", "Merkezi Log Toplama (Graylog/Splunk)")

    Rel(user, spa, "Görüntüler / Yönetir", "HTTPS")
    Rel(spa, api, "API Çağrıları Yapar", "JSON/HTTPS")
    Rel(api, database, "Okur / Yazar", "SQL")
    
    Rel(api, ldap, "Kimlik Doğrular", "LDAP/S")
    Rel(api, syslog, "Log Gönderir", "UDP/TCP")
```

## 3. Akış (Sequence) Diyagramları

Bu bölüm, sistemdeki kritik süreçlerin adım adım nasıl işlediğini gösterir.

### 3.1. Kimlik Doğrulama (Login) Akışı

Kullanıcı giriş yapmaya çalıştığında sistemin karar mekanizması:

```mermaid
sequenceDiagram
    autonumber
    participant User as Kullanıcı
    participant API as Backend API
    participant DB as SQLite DB
    participant LDAP as LDAP Server
    participant Log as Logger Service

    User->>API: POST /api/auth/login (username, password)
    
    API->>API: LDAP Ayarlarını Kontrol Et
    
    alt LDAP Aktif İse
        API->>LDAP: Bind & Search User
        
        alt LDAP Başarılı
            LDAP-->>API: Kullanıcı Doğrulandı
        else LDAP Başarısız
            LDAP-->>API: Hata
            API->>DB: Yerel Kullanıcı Kontrolü (Fallback)
            DB-->>API: Kullanıcı/Şifre Sonucu
        end
    else LDAP Pasif İse
        API->>DB: Yerel Kullanıcı Kontrolü
        DB-->>API: Sonuç
    end

    alt Giriş Başarılı
        API->>API: JWT Token Üret
        API->>Log: logAuth(LOGIN_SUCCESS)
        API-->>User: 200 OK + Token
    else Giriş Başarısız
        API->>Log: logAuth(LOGIN_FAIL)
        API-->>User: 401 Unauthorized
    end
```

### 3.2. Veri Güncelleme ve Audit Log Akışı

Bir teknoloji güncellendiğinde gerçekleşen "Audit" ve "Syslog" süreci:

```mermaid
sequenceDiagram
    autonumber
    participant Admin as Admin User
    participant API as Backend API
    participant DB as SQLite DB
    participant Log as Logger Service
    participant Syslog as Syslog Server

    Admin->>API: PUT /api/radar/:id (Yeni Veri)
    
    note right of API: Audit için eski veriye ihtiyaç var
    API->>DB: SELECT * FROM technologies WHERE id=:id
    DB-->>API: Eski Veri (OldValue)
    
    API->>DB: UPDATE technologies SET ...
    DB-->>API: Başarılı
    
    API->>Log: logAudit(UPDATE, OldVal, NewVal)
    
    par Paralel Loglama
        Log->>DB: INSERT INTO audit_logs (...)
        Log->>Syslog: Send Packet (UDP/TCP)
    end
    
    API-->>Admin: 200 OK
```

## 4. Backend Modül Diyagramı (Class Diagram)

Bu diyagram, backend kodunun mantıksal ayrımını ve modüller arası bağımlılıkları gösterir.

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

### Modül İlişkileri Açıklaması

*   **ServerJS:** Uygulamanın beyni ve giriş kapısıdır.
    *   `+`: Dışarıya açık özellikleri gösterir. Örn: API rotalarını (`/api/*`) tanımlar ve sunucuyu başlatır (`Start Server`).
*   **DatabaseJS:** Hafıza merkezidir.
    *   Veritabanı bağlantısını kurar (`sqlite3.Database`).
    *   `initializeTables()` ile tablolar yoksa oluşturur.
    *   `-`: Gizli/private yapıyı gösterir. Tabloların kendisi (`users`, `technologies`) bu modülün yönetimi altındadır.
*   **LoggerJS:** Kayıt tutucudur.
    *   `logAuth` ve `logAudit` fonksiyonları diğer modüllerin kullanımına açıktır.
    *   Arka planda özel bir `SqliteTransport` (kendi veritabanı sürücüsü) ve Winston kütüphanesini kullanır.
*   **LdapServiceJS:** Dış ilişkiler uzmanıdır.
    *   Sadece kullanıcı adı/şifre doğrulama (`authenticate`) ve arama (`searchUsers`) işlerini yapar.

**Oklar (İlişkiler):**
*   **ServerJS --> Diğerleri:** Server.js en tepedeki yöneticidir; Database, Logger ve LDAP servislerinin hepsini içe aktarır (import) ve kullanır.
*   **LoggerJS --> DatabaseJS:** Bu ilginç bir detaydır; Loglama servisi de logları yazmak için Database modülünü kullanır. Yani Logger tek başına çalışmaz, veritabanına bağımlıdır.




