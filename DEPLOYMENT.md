# دليل نشر منصة IVEA على Hostinger VPS

## المتطلبات الأساسية

- **Hostinger VPS** (Ubuntu 22.04 أو 24.04)
- **الدومين:** order-ivea.com (موجه للـ VPS IP)
- **SSH Access**

---

## الخطوة 1: الاتصال بـ VPS

```bash
ssh root@YOUR_VPS_IP
```

---

## الخطوة 2: الإعداد الأولي (مرة واحدة فقط)

### تحديث النظام وتثبيت الحزم الأساسية

```bash
# تحديث النظام
apt update && apt upgrade -y

# تثبيت الحزم الأساسية
apt install -y curl wget git build-essential nginx ufw
```

### تثبيت Node.js

```bash
# تثبيت NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# تحميل NVM
source ~/.bashrc

# تثبيت Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# التحقق
node -v  # يجب أن يظهر v20.x.x
npm -v
```

### تثبيت PM2

```bash
npm install -g pm2
```

### تثبيت وإعداد PostgreSQL

```bash
# تثبيت PostgreSQL
apt install -y postgresql postgresql-contrib

# تشغيل الخدمة
systemctl start postgresql
systemctl enable postgresql

# إنشاء قاعدة البيانات والمستخدم
sudo -u postgres psql
```

في واجهة PostgreSQL:
```sql
CREATE USER ivea_user WITH ENCRYPTED PASSWORD 'YOUR_SECURE_PASSWORD';
CREATE DATABASE ivea_orders OWNER ivea_user;
GRANT ALL PRIVILEGES ON DATABASE ivea_orders TO ivea_user;
\c ivea_orders
GRANT ALL ON SCHEMA public TO ivea_user;
\q
```

---

## الخطوة 3: استنساخ المشروع

```bash
# إنشاء مجلد التطبيق
mkdir -p /var/www/ivea-order-tracking
cd /var/www/ivea-order-tracking

# استنساخ من GitHub (أو رفع الملفات يدوياً)
git clone https://github.com/YOUR_USERNAME/ivea-order-tracking.git .

# أو رفع الملفات عبر SFTP إلى /var/www/ivea-order-tracking
```

---

## الخطوة 4: إعداد ملف البيئة

```bash
# نسخ ملف المثال
cp .env.example .env

# تحرير الملف
nano .env
```

محتوى `.env`:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://ivea_user:YOUR_PASSWORD@localhost:5432/ivea_orders
SESSION_SECRET=YOUR_RANDOM_SECRET_HERE
JWT_SECRET=YOUR_RANDOM_JWT_SECRET_HERE
DOMAIN=https://order-ivea.com
```

لتوليد مفاتيح عشوائية:
```bash
# Session Secret
openssl rand -base64 32

# JWT Secret
openssl rand -base64 64
```

---

## الخطوة 5: بناء التطبيق

```bash
cd /var/www/ivea-order-tracking

# تثبيت المكتبات
npm ci

# بناء التطبيق
npm run build

# تشغيل migrations قاعدة البيانات
npm run db:push
```

---

## الخطوة 6: إعداد Nginx

```bash
# نسخ ملف التكوين
cp nginx/order-ivea.com.conf /etc/nginx/sites-available/

# إنشاء رابط
ln -s /etc/nginx/sites-available/order-ivea.com.conf /etc/nginx/sites-enabled/

# حذف الموقع الافتراضي
rm -f /etc/nginx/sites-enabled/default

# اختبار التكوين
nginx -t

# إعادة تشغيل Nginx
systemctl restart nginx
```

---

## الخطوة 7: تشغيل التطبيق مع PM2

```bash
cd /var/www/ivea-order-tracking

# تشغيل التطبيق
pm2 start ecosystem.config.cjs --env production

# حفظ التكوين للتشغيل التلقائي
pm2 save
pm2 startup

# التحقق من الحالة
pm2 status
pm2 logs ivea-order-tracking
```

---

## الخطوة 8: إعداد SSL (شهادة HTTPS)

```bash
# تثبيت Certbot
apt install -y certbot python3-certbot-nginx

# الحصول على شهادة SSL
certbot --nginx -d order-ivea.com -d www.order-ivea.com

# التجديد التلقائي (يتم إعداده تلقائياً)
certbot renew --dry-run
```

---

## الخطوة 9: إعداد Firewall

```bash
# السماح بـ SSH
ufw allow OpenSSH

# السماح بـ Nginx
ufw allow 'Nginx Full'

# تفعيل Firewall
ufw enable

# التحقق
ufw status
```

---

## التحديثات المستقبلية

للتحديث من GitHub:

```bash
cd /var/www/ivea-order-tracking
./scripts/deploy.sh
```

أو يدوياً:
```bash
cd /var/www/ivea-order-tracking
git pull origin main
npm ci
npm run build
npm run db:push
pm2 reload ivea-order-tracking
```

---

## أوامر PM2 المفيدة

| الأمر | الوصف |
|-------|--------|
| `pm2 status` | عرض حالة التطبيقات |
| `pm2 logs ivea-order-tracking` | عرض السجلات |
| `pm2 restart ivea-order-tracking` | إعادة تشغيل |
| `pm2 stop ivea-order-tracking` | إيقاف |
| `pm2 delete ivea-order-tracking` | حذف |
| `pm2 monit` | مراقبة الموارد |

---

## استكشاف الأخطاء

### التطبيق لا يعمل
```bash
pm2 logs ivea-order-tracking --lines 50
```

### مشكلة في قاعدة البيانات
```bash
# اختبار الاتصال
psql -U ivea_user -d ivea_orders -h localhost
```

### Nginx 502 Bad Gateway
```bash
# التأكد من تشغيل التطبيق
pm2 status

# التحقق من المنفذ
curl http://localhost:5000/api/health
```

### مشكلة في SSL
```bash
# تجديد الشهادة
certbot renew --force-renewal
```

---

## بيانات الدخول الافتراضية

- **البريد:** admin@ivea.com
- **كلمة المرور:** admin123

⚠️ **مهم:** غيّر كلمة المرور فور تسجيل الدخول!

---

## هيكل الملفات على السيرفر

```
/var/www/ivea-order-tracking/
├── dist/                    # ملفات البناء
│   ├── index.js            # السيرفر
│   └── public/             # الملفات الثابتة
├── node_modules/
├── .env                     # متغيرات البيئة
├── ecosystem.config.cjs     # تكوين PM2
└── package.json

/etc/nginx/sites-available/
└── order-ivea.com.conf      # تكوين Nginx

/var/log/pm2/
├── ivea-error.log
├── ivea-out.log
└── ivea-combined.log
```

---

## الدعم

للمساعدة أو الاستفسارات، تواصل مع فريق التطوير.
