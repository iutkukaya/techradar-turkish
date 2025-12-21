# Linux Dağıtım Kılavuzu

Bu kılavuz, Türk Teknoloji Radarı uygulamasının Linux sistemlerinde (Ubuntu, Red Hat vb.) Docker kullanılarak nasıl dağıtılacağını açıklar.

## Gereksinimler

-   **Docker**: [Docker Engine Kurulumu](https://docs.docker.com/engine/install/)
-   **Docker Compose**: [Docker Compose Kurulumu](https://docs.docker.com/compose/install/)

## Hızlı Başlangıç (Docker Compose)

1.  Proje ana dizinine gidin.
2.  Uygulamayı derlemek ve başlatmak için şu komutu çalıştırın:

    ```bash
    docker-compose up -d --build
    ```

    Uygulama `http://localhost:3000` adresinde erişilebilir olacaktır.

3.  Uygulamayı durdurmak için:

    ```bash
    docker-compose down
    ```

## Veri Kalıcılığı (Persistence)

Veritabanı dosyası `radar.db`, ana makinenizdeki `./data` dizininde saklanır. Bu sayede konteyner silinse bile verileriniz kaybolmaz.

## OpenShift Dağıtımı

Bu uygulama OpenShift ve Kubernetes ile uyumludur. Sağlanan `Dockerfile` dosyasını kullanarak bir imaj oluşturabilirsiniz.

### OpenShift İçin Dikkat Edilmesi Gerekenler

-   **Root Olmayan Kullanıcı**: Dockerfile, OpenShift'in varsayılan güvenlik politikalarına uyacak şekilde root olmayan bir kullanıcı (`node`, uid 1000) ile çalışacak şekilde yapılandırılmıştır.
-   **İzinler**: Uygulama dizini `/app`, `node` kullanıcısına aittir.
-   **Depolama**: OpenShift üzerinde, veritabanı kalıcılığını sağlamak için `/app/data` dizinine bir **Persistent Volume Claim (PVC)** bağlamanız gerekir.

### Örnek OpenShift Akışı

1.  **Uygulamayı Oluşturun** (Git deposu üzerinden):

    ```bash
    oc new-app https://github.com/your-repo/teknoloji-radari.git --name=tech-radar
    ```

2.  **Depolama Alanı Ekleyin** (SQLite verisinin kaybolmaması için önemlidir):

    ```bash
    oc set volume deployment/tech-radar --add --name=radar-storage -t pvc --claim-size=1Gi --mount-path=/app/data
    ```

3.  **Servisi Dışarı Açın**:

    ```bash
    oc expose svc/tech-radar
    ```
