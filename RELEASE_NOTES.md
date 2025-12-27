# Release Notes - v1.2.0

## 🔐 Kimlik Doğrulama & Güvenlik (Auth & Security)
- **LDAP Entegrasyonu (LDAP Integration):** Active Directory ve OpenLDAP sunucuları ile entegrasyon sağlandı. Kullanıcılar artık kurumsal hesapları ile giriş yapabilir. (Integration with Active Directory and OpenLDAP servers. Users can now login with corporate accounts.)
- **Kullanıcı İçe Aktarma (User Import):** LDAP üzerinden toplu kullanıcı arama ve içe aktarma özelliği eklendi. (Batch user search and import feature via LDAP.)
- **Güvenli IP Loglama (Secure IP Logging):** IPv4/IPv6 uyumluluğu sağlandı ve IP adresleri sanitize edilerek kaydediliyor. (IPv4/IPv6 compatibility ensured; IP addresses are sanitized before logging.)

## 📜 Loglama & İzlenebilirlik (Logging & Observability)
- **Log Yönetimi (Log Management):** Yeni `auth_logs` ve `audit_logs` tabloları ile tüm sistem hareketleri kayıt altına alınıyor. (New `auth_logs` and `audit_logs` tables record all system activities.)
- **Denetim Logları (Audit Logs):** Yapılan tüm teknoloji ve ayar değişiklikleri "Kim, Ne Zaman, Eski Değer, Yeni Değer" detayında saklanıyor. Ayar değişikliklerinde sadece değişen alanlar (Diff) loglanıyor. (All technology and setting changes are stored with "Who, When, Old Value, New Value" details. Only changed fields (Diff) are logged for settings updates.)
- **Syslog Desteği (Syslog Support):** Logların Graylog, Splunk vb. merkezi sunuculara (UDP/TCP) yönlendirilmesi için altyapı eklendi. Admin panelinden dinamik olarak yönetilebilir. (Infrastructure added for forwarding logs to central servers like Graylog, Splunk via UDP/TCP. Dynamically configurable from Admin panel.)

## 📚 Dokümantasyon (Documentation)
- `docs/ADMIN_GUIDE_TR.md` ve `docs/ADMIN_GUIDE_EN.md` dosyaları eklendi. LDAP ve Loglama ayarları detaylandırıldı. (Added `docs/ADMIN_GUIDE_TR.md` and `docs/ADMIN_GUIDE_EN.md`. Detailed LDAP and Logging configurations.)
- `docs/MIMARI_VE_DIYAGRAMLAR.md` ve `docs/ARCHITECTURE_AND_DIAGRAMS.md` eklendi. ERD, C4 Konteyner, Akış ve Modül diyagramlarını içerir. (Added `docs/MIMARI_VE_DIYAGRAMLAR.md` and `docs/ARCHITECTURE_AND_DIAGRAMS.md`. Includes ERD, C4 Container, Sequence, and Module diagrams.)


---
# Release Notes - v1.1.0

## 🚀 Yeni Özellikler (New Features)
- **Özelleştirilebilir İsimlendirme:** Artık Admin Paneli üzerinden Çeyrek (Quadrant), Halka (Ring) ve Durum (Status) isimleri tamamen değiştirilebilir.
- **Docker & Linux Desteği:** Uygulama artık Docker ve Docker Compose ile Linux ortamlarında (OpenShift dahil) sorunsuz çalıştırılabilir.

## 🛠️ Düzeltmeler & İyileştirmeler (Fixes & Improvements)
- **Radar Görüntüleme:** Mouse ile üzerine gelindiğinde radarın kaybolması sorunu giderildi.
- **UI:** Pop-up pencerelerin ekran dışına taşma ve metin taşma sorunları düzeltildi.
- **Veri Tutarlılığı:** İsim değişikliklerinde eski kayıtların merkezde (0,0) kalma sorunu çözüldü.
- **Lejant:** 4. Durum ("Değişiklik Yok") lejanta eklendi.

## 📚 Dokümantasyon
- `LINUX_DEPLOYMENT.md` ve `LINUX_DEPLOYMENT_TR.md` eklendi.
- Kurulum ve Yönetici rehberleri güncellendi.
