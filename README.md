# الاتحاد العربي لحماية حقوق الملكية الفكرية (AUIPR)
### Official Web Portal & Multi-Branch Management System

بوابة إلكترونية رسمية متكاملة للاتحاد العربي لحماية حقوق الملكية الفكرية (منظمة عربية تعمل في نطاق مجلس الوحدة الاقتصادية العربية - جامعة الدول العربية).

---

## 📋 دليل تسليم ونقل المشروع للمبرمج الجديد (Developer Handover Guide)

> **ملاحظة للمبرمج الجديد:** هذا الدليل مُعد ليمنحك بداية نظيفة وسلسة لإدارة وتشغيل الموقع ونقله إلى مستودعك الخاص خطوة بخطوة بالترتيب.

---

### الخطوة 1: بدء مستودع Git نظيف تماماً (Clean Slate)
لحذف أي سجلات أو كوميتات سابقة والبدء بسجل خاص بك من الصفر:
1. تأكد من حذف مجلد `.git` القديم (إن وُجد) عبر التيرمينال:
   ```powershell
   Remove-Item -Recurse -Force .git
   ```
   *(أو على Linux/Mac: `rm -rf .git`)*
2. **تأكد من بقاء ملف `.gitignore`** في المجلد الرئيسي لحماية ملفات `.env` و `node_modules`.

---

### الخطوة 2: تهيئة مستودع Git الجديد ورفعه لحسابك
1. افتح التيرمينال داخل مجلد المشروع وقم بتنفيذ الأوامر التالية بالترتيب:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AUIPR Official Portal"
   git branch -M main
   ```
2. أنشئ مستودعاً فارغاً جديداً على حسابك في GitHub (أو GitLab)، ثم اربطه وارفعه:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY>.git
   git push -u origin main
   ```

---

### الخطوة 3: إعداد ملف متغيرات البيئة (`.env`)
أنشئ ملفاً باسم `.env` في المجلد الرئيسي وضع بداخله القيم التالية:

```env
MONGODB_URI=mongodb+srv://ceo_db_user:Auipr2026Pass@auipr.qrimlgf.mongodb.net/auipr_db?retryWrites=true&w=majority
ADMIN_TOKEN=auipr2026admin
ADMIN_GENERAL_PASS=Auipr@mhsn98
ADMIN_LEBANON_PASS=Auipr#Lb@2026
ADMIN_JORDAN_PASS=Auipr*mstf@2026
```

---

### الخطوة 4: بيانات الدخول للوحة التحكم (Admin Panel)
* **رابط لوحة الإدارة:** `https://auipr.org/admin.html`
* **الحسابات والصلاحيات (RBAC):**
  1. **المشرف العام (المقر الرئيسي - صلاحيات كاملة):**
     * اسم المستخدم: `admin_general` (أو `general_admin`)
     * كلمة المرور: `Auipr@mhsn98`
  2. **مشرف فرع لبنان:**
     * اسم المستخدم: `admin_lebanon` (أو `lebanon_branch`)
     * كلمة المرور: `Auipr#Lb@2026`
  3. **مشرف فرع الأردن:**
     * اسم المستخدم: `admin_jordan` (أو `jordan_branch`)
     * كلمة المرور: `Auipr*mstf@2026`

---

### الخطوة 5: ربط استضافة Netlify السحابية
الموقع يعتمد على **Netlify** لتشغيل الدوال السحابية (Serverless Functions) والنشر التلقائي:
1. ادخل إلى حساب Netlify الخاص بالموقع.
2. اذهب إلى: **Site configuration** > **Build & deploy** > **Continuous Deployment**.
3. اضغط على **Link to a different repository** واختر مستودعك الجديد على GitHub.
4. اذهب إلى: **Site configuration** > **Environment variables** وتأكد من إضافة متغيرات البيئة (مثل `MONGODB_URI` وباسوردات المشرفين) كما في الخطوة 3.

---

### الخطوة 6: فحص وإدارة النطاقات (DNS & Subdomains)
النطاقات التالية مربوطة ومضبوطة مسبقاً وتعمل وفق نظام الفروع:
* `auipr.org` / `www.auipr.org`: المقر الرئيسي العام.
* `jordan.auipr.org`: فرع المملكة الأردنية الهاشمية (يحمل هوية الفرع وأرقامه وعنوانه تلقائياً).
* `lebanon.auipr.org`: ممثل الجمهورية اللبنانية (يحمل هوية الفرع تلقائياً).

---

### الخطوة 7: التشغيل المحلي على جهازك (Local Development)
1. **تثبيت الحزم والاعتماديات:**
   ```bash
   npm install
   ```
2. **تشغيل الموقع محلياً مع خادم الدوال السحابية:**
   ```bash
   npm run dev
   # أو
   npx netlify dev
   ```
3. افتح المتصفح على الرابط: `http://localhost:8888`.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

* **الواجهة الأمامية (Frontend):**
  * HTML5 دلالي متجاوب مع جميع الشاشات.
  * CSS3 حديث بنظام Grid & Flexbox، مع دعم WebP لسرعة التحميل.
  * Vanilla JavaScript (ES6+) خفيف وسريع بدون أطر عمل ثقيلة.
* **الخوادم السحابية (Backend / Serverless):**
  * **Netlify Serverless Functions** (`netlify/functions/news.js`) لإدارة العمليات والمصادقة والـ API.
* **قاعدة البيانات (Database):**
  * **MongoDB Atlas** لتخزين وإدارة الأخبار والتحكم بصلاحيات الفروع وسجلات التدقيق (Audit Logs).
* **المراسلات والاستمارات (Forms):**
  * Web3Forms API لاستقبال طلبات التسجيل والمشاركات مباشرة على البريد الرسمي.

---

## 📁 هيكلية المشروع (Project Directory Structure)

```text
├── admin.html               # لوحة الإدارة والتحكم بالصلاحيات والأخبار
├── index.html               # الصفحة الرئيسية للبوابة
├── contact.html             # صفحة الاتصال وتفاصيل المقرات الإقليمية
├── events.html              # صفحة المؤتمرات والفعاليات
├── objectives.html          # أهداف وميثاق الاتحاد
├── structure.html           # الهيكل التنظيمي للاتحاد
├── refund.html              # سياسة الاسترداد
├── terms.html               # الشروط والأحكام
├── header.html / footer.html# القوالب الموحدة للهيدر والفوتر (Dynamic Component Injection)
│
├── css/
│   ├── style.css            # ملف التنسيقات الرئيسي
│   └── register-modal.css   # تنسيقات نافذة التسجيل السريعة
│
├── js/
│   ├── main.js              # سكريبت الموقع الأساسي، إدارة الفروع، وتحميل الأخبار
│   └── branches.js          # تكوينات الفروع والممثليات
│
├── img/                     # الأصول المرئية المحسّنة (WebP / PNG)
│   ├── union-emblem.webp    # شعار وهوية الاتحاد
│   ├── council.png          # شعار مجلس الوحدة الاقتصادية العربية
│   └── ...
│
├── news/                    # قسم الأخبار والمقالات
│   ├── index.html           # أرشيف وقائمة الأخبار
│   ├── view.html            # قارئ الأخبار الديناميكي المرتبط بقاعدة البيانات عبر الـ Slug
│   ├── article.js           # أدوات التفاعل والمشاركة السريعة
│   └── ...                  # المقالات المؤرشفة
│
├── netlify/
│   └── functions/
│       └── news.js          # خادم الـ API المسؤول عن إدارة الأخبار والمصادقة والصلاحيات
│
├── netlify.toml             # إعدادات التوجيه (Redirects)، الـ Caching، والـ Security Headers
├── Sitemap.xml / robots.txt # تحسين محركات البحث والأرشفة (SEO)
├── package.json             # تعريف الاعتماديات وأوامر التشغيل
└── .env.example             # نموذج متغيرات البيئة
```
