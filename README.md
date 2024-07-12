# AADL3 Website Monitor

## مقدمة
مشروع Website Monitor & Data Manager هو أداة مراقبة مواقع الويب وإدارة البيانات باستخدام Puppeteer و Express و Socket.io.

## المتطلبات
### Windows:
1. **Node.js**: تحميل وتثبيت Node.js من [الرابط الرسمي](https://nodejs.org/).
2. **Git**: تحميل وتثبيت Git من [الرابط الرسمي](https://git-scm.com/).

### Linux (Ubuntu/Debian):
1. **Node.js**: 
    ```bash
    sudo apt update
    sudo apt install nodejs
    sudo apt install npm
    ```
2. **Git**:
    ```bash
    sudo apt install git
    ```

## كيفية التثبيت والتشغيل
1. **تنزيل الكود**:
    ```bash
    git clone <URL_of_your_repository>
    cd <repository_directory>
    ```

2. **تثبيت التبعيات**:
    ```bash
    npm install
    ```

3. **تشغيل التطبيق**:
    ```bash
    node app.js
    ```

4. **الوصول إلى الواجهة**:
   افتح متصفح الإنترنت وانتقل إلى:
    ```
    http://localhost:3000
    ```

## ملفات المشروع
- **app.js**: الكود الرئيسي لتشغيل التطبيق.
- **public/**: الملفات الثابتة التي تخدم الواجهة الأمامية.
- **info.txt**: ملف البيانات لإدارة السجلات.

## كيفية الاستخدام
### بدء تشغيل متصفح جديد
1. اضغط على زر "Start New Browser".
2. اختر عدد المتصفحات (1-9).
3. اضغط على "Start".

### إيقاف جميع المتصفحات
اضغط على زر "Stop All Browsers".

### أخذ لقطات لجميع المتصفحات
اضغط على زر "Take All Screenshot".

### إدارة البيانات
1. اضغط على زر "Data Cards" لعرض السجلات.
2. لإضافة سجل جديد، اضغط على زر "Add Data" وأدخل البيانات.

### استعادة المتصفحات
يتم استعادة المتصفحات عند إعادة تحميل الصفحة تلقائيًا.

## كيفية إنشاء بوت Telegram والحصول على TELEGRAM_TOKEN و CHAT_ID
### إنشاء بوت Telegram:
1. افتح تطبيق Telegram وابحث عن المستخدم @BotFather.
2. ابدأ محادثة مع @BotFather وأرسل الأمر `/start`.
3. لإنشاء بوت جديد، أرسل الأمر `/newbot`.
4. اتبع التعليمات لتسمية البوت والحصول على اسم مستخدم (username) فريد له.
5. بعد إكمال الخطوات، ستحصل على رمز توكن البوت (API token). هذا هو `TELEGRAM_TOKEN`.

### الحصول على CHAT_ID:
1. افتح تطبيق Telegram وابحث عن البوت الذي قمت بإنشائه.
2. ابدأ محادثة مع البوت وأرسل أي رسالة.
3. افتح المتصفح وانتقل إلى الرابط التالي مع استبدال `TELEGRAM_TOKEN` برمز التوكن الخاص بك:
    ```
    https://api.telegram.org/bot<TELEGRAM_TOKEN>/getUpdates
    ```
4. ابحث في الاستجابة (response) عن `chat` وستجد `id`. هذا هو `CHAT_ID`.

## ملاحظات
- تأكد من ضبط متغيرات `TELEGRAM_TOKEN` و `CHAT_ID` بقيم صحيحة في الكود.

## دعم
إذا واجهت أي مشاكل، يرجى فتح تذكرة في مستودع GitHub.
