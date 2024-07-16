# AADL3 Website Monitor

## مقدمة
هذا المشروع يهدف إلى بناء نظام لمراقبة وتفاعل مع موقع الويب AADL3. النظام يمكن المستخدم من فتح عدة متصفحات، التحقق من حالة صفحات الويب، وأخذ لقطات شاشة للمراقبة. بالإضافة إلى ذلك، يتم إرسال تنبيهات عبر Telegram في حالة حدوث تغييرات في محتوى الصفحة.

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
    git clone https://github.com/TerminalDZ/AADL3-Website-Monitor.git
    cd AADL3-Website-Monitor
    ```

2. **تثبيت التبعيات**:
    ```bash
    npm install
    ```

3. **تشغيل التطبيق**:
    ```bash
    npm start
    ```

4. **الوصول إلى الواجهة**:
   افتح متصفح الإنترنت وانتقل إلى:
    ```
    http://localhost:3000
    ```

## ملفات المشروع
- **src/** : الكود الرئيسي لتشغيل التطبيق.
- **public/**: الملفات الثابتة التي تخدم الواجهة الأمامية.
-**.env**: ملف تكوين البيئة لتحديد متغيرات البيئة.
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

### الملء التلقائي للنماذج (Auto Fill)
1. اضغط على زر "Auto Fill" بجانب المتصفح المطلوب.
2. حدد البيانات التي تريد ملؤها في النموذج من القائمة المنسدلة التي تظهر.
3. سيتم ملؤها تلقائيًا وسيتم تقديم البيانات.



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
- تأكد من ضبط متغيرات `TELEGRAM_TOKEN` و `CHAT_ID` بقيم صحيحة في الكود .env الخاص بك.

## دعم
إذا واجهت أي مشاكل، يرجى فتح تذكرة في مستودع GitHub.

## حل مشكلة سائق Google Chrome
إذا واجهت خطأ متعلق بـ `ChromeDriver`، يمكنك محاولة حل المشكلة باتباع الخطوات التالية:

1. **تحديث ChromeDriver**:
    - تأكد من أن إصدار ChromeDriver يتطابق مع إصدار Google Chrome المثبت على جهازك.
    - قم بتنزيل أحدث إصدار من ChromeDriver من [الرابط الرسمي](https://sites.google.com/chromium.org/driver/downloads) واستبدل الإصدار الحالي في مسار مشروعك.

2. **ضبط مسار ChromeDriver**:
    - إذا لم يتم العثور على `ChromeDriver` تلقائيًا، يمكنك تحديد المسار الكامل لـ `ChromeDriver` في الكود الخاص بك:
    ```javascript
    const puppeteer = require('puppeteer-extra');
    const chromePath = '/path/to/chromedriver'; // استبدل هذا بالمسار الفعلي لـ ChromeDriver
    puppeteer.launch({ executablePath: chromePath });
    ```

3. **منح الأذونات اللازمة (Linux فقط)**:
    - تأكد من أن `ChromeDriver` لديه أذونات التنفيذ:
    ```bash
    sudo chmod +x /path/to/chromedriver
    ```

باتباع هذه الخطوات، يجب أن تكون قادرًا على حل أي مشكلات تتعلق بـ `ChromeDriver` وتشغيل المشروع بنجاح.

---

# AADL3 Website Monitor

## Introduction
This project aims to build a system to monitor and interact with the AADL3 website. The system allows users to open multiple browsers, check the status of web pages, and take screenshots for monitoring. Additionally, alerts are sent via Telegram if there are changes in the page content.

## Requirements
### Windows:
1. **Node.js**: Download and install Node.js from the [official website](https://nodejs.org/).
2. **Git**: Download and install Git from the [official website](https://git-scm.com/).

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

## Installation and Execution
1. **Clone the repository**:
    ```bash
    git clone https://github.com/TerminalDZ/AADL3-Website-Monitor.git
    cd AADL3-Website-Monitor
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Run the application**:
    ```bash
    node index.js
    ```

4. **Access the interface**:
   Open your web browser and go to:
    ```
    http://localhost:3000
    ```

## Project Files
- **src/**: Main code to run the application.
- **public/**: Static files serving the frontend interface.
- **.env**: Environment configuration file to set environment variables.
- **info.txt**: Data file for managing records.


## Usage
### Start a New Browser
1. Click the "Start New Browser" button.
2. Select the number of browsers (1-9).
3. Click "Start".

### Stop All Browsers
Click the "Stop All Browsers" button.

### Take Screenshots of All Browsers
Click the "Take All Screenshot" button.

### Manage Data
1. Click the "Data Cards" button to view records.
2. To add a new record, click the "Add Data" button and enter the information.

### Auto Fill Forms
1. Click the "Auto Fill" button next to the desired browser.
2. Select the data you want to fill the form with from the dropdown that appears.
3. The form will be filled automatically and the data will be submitted.

### Restore Browsers
Browsers are restored automatically upon page reload.

## How to Create a Telegram Bot and Obtain TELEGRAM_TOKEN and CHAT_ID
### Create a Telegram Bot:
1. Open the Telegram app and search for the user @BotFather.
2. Start a conversation with @BotFather and send the `/start` command.
3. To create a new bot, send the `/newbot` command.
4. Follow the instructions to name the bot and get a unique username.
5. After completing the steps, you will receive the bot's API token. This is your `TELEGRAM_TOKEN`.

### Obtain CHAT_ID:
1. Open the Telegram app and search for the bot you created.
2. Start a conversation with the bot and send any message.
3. Open your browser and go to the following URL, replacing `TELEGRAM_TOKEN` with your bot's token:
    ```
    https://api.telegram.org/bot<TELEGRAM_TOKEN>/getUpdates
    ```
4. Look in the response for `chat` and find the `id`. This is your `CHAT_ID`.

## Notes
- Ensure that `TELEGRAM_TOKEN` and `CHAT_ID` variables are set correctly in the code in your .env file.

## Support
If you encounter any issues, please open a ticket in the GitHub repository.

## Solving Google Chrome Driver Issues
If you encounter an error related to `ChromeDriver`, you can try solving the problem by following these steps:

1. **Update ChromeDriver**:
    - Ensure that the ChromeDriver version matches the version of Google Chrome installed on your machine.
    - Download the latest version of ChromeDriver from the [official website](https://sites.google.com/chromium.org/driver/downloads) and replace the current version in your project path.

2. **Set ChromeDriver Path**:
    - If `ChromeDriver` is not found automatically, you can specify the full path to `ChromeDriver` in your code:
    ```javascript
    const puppeteer = require('puppeteer-extra');
    const chromePath = '/path/to/chromedriver'; // Replace with the actual path to ChromeDriver
    puppeteer.launch({ executablePath: chromePath });
    ```

3. **Grant Necessary Permissions (Linux only)**:
    - Ensure that `ChromeDriver` has execution permissions:
    ```bash
    sudo chmod +x /path/to/chromedriver
    ```

By following these steps, you should be able to resolve any issues related to `ChromeDriver` and successfully run the project.
