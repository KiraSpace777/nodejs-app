# nodejs-app

// ===============/ NPM INSTALL /===============//

// npm init -y
=== Ініціалізуйте npm: З’явиться файл package.json із базовою інформацією про проєкт.

// npm install -D nodemon
=== пакет nodemon автоматично перезапускає застосунок після змін у файлах.

// npm init @eslint/config@latest
=== Лінтинг коду, дозволяє задати єдиний стиль написання коду

// npm install express
=== мінімалістичний веб-фреймворк для Node.js

// npm install cors
=== Cross-Origin Resource Sharing — механізм безпеки, який дозволяє браузеру робити запити з одного домену до іншого

// npm install pino-http pino-pretty
=== Логування запитів (логер pino-http), вхідні/вихідні запити, час обробки

// npm install dotenv
=== зчитування змінних оточення

// ===============/ npm init @eslint/config@latest /===============//

@eslint/create-config: v2.0.0
√ What do you want to lint? · javascript
√ How would you like to use ESLint? · problems
√ What type of modules does your project use? · esm
√ Which framework does your project use? · none
√ Does your project use TypeScript? · No
√ Where does your code run? · node
i The config that you've selected requires the following dependencies:
eslint, @eslint/js, globals
√ Would you like to install them now? · Yes
√ Which package manager do you want to use? · npm

// ===============/ Middleware обробки помилок /===============//

Наша мідлвара для обробки помилок у поточному вигляді завжди відправляє користувачу деталі помилки (err.message). Це зручно під час розробки, але в продакшені так робити небезпечно — користувач може побачити внутрішню інформацію про застосунок.

Щоб вирішити цю проблему, ми додамо змінну оточення NODE_ENV, яка буде вказувати, у якому середовищі працює застосунок:
development — режим розробки (показуємо деталі помилки і стек).
production — продакшн (повертаємо лише загальне повідомлення).

Оновлюємо файл .env у корені проєкту:

// ------------/ #.env /------------//
PORT=3000
NODE_ENV=development
//

Тепер під час локальної розробки process.env.NODE_ENV матиме значення development.

Оновлений код middleware:

// ------------/ START /----------//
// ------------/ src/server.js /------------//
// ------------/ Решта коду файла / ------------/

// Middleware для обробки помилок
app.use((err, req, res, next) => {
console.error(err);

const isProd = process.env.NODE_ENV === "production";

res.status(500).json({
message: isProd
? "Something went wrong. Please try again later."
: err.message,
});
});
// ------------/ Решта коду файла / ------------/
// ------------/ END /----------//

При деплої продакшн-версії на Render.com змінна NODE_ENV автоматично матиме значення "production", навіть якщо ви її не задавали. Це гарантує, що у продакшені деталі помилок не потраплять у відповідь.

// ===============/ Вбудовані модулі Node.js /===============//

У Node.js є набір вбудованих модулів, які доступні відразу без встановлення додаткових пакетів.
Наприклад:

// node:os — інформація про операційну систему;
// node:http — створення веб-серверів;
// node:path — робота зі шляхами до файлів і папок;
// node:fs — робота з файловою системою.

За потреби більше методів можна знайти у документації Node.js, але основні, які нам потрібні, ми вже розглянули:
https://nodejs.org/api/path.html?utm_source=chatgpt.com

node:fs
https://nodejs.org/api/fs.html?utm_source=chatgpt.com

// ===============/ 2 - Модуль path /===============//

// Об’єднує частини шляху у правильний формат для поточної ОС.
// -------------------------------------------
// на macOS → 'some_folder/some_file.txt'
// на Windows → 'some_folder\\some_file.txt'
// ===========================================

// import path from "node:path";
// const somePath = path.join("some_folder", "some_file.txt");

// ===============/ 3 - path.join(...paths) /===============//
//
// Можна вкладати виклики, щоб будувати складніші шляхи:
// import path from "node:path";
//
// абсолютний шлях до робочої директорії
// const pathToWorkDir = path.join(process.cwd());
//
// додаємо нові частини до шляху
// const pathToFile = path.join(pathToWorkDir, "some_folder", "some_file.txt");

//
// macOS → /коренева*папка/some_folder/some_file.txt
// Windows → C:\\коренева*папка\\some_folder\\some_file.txt

// ===============/ 4 - path.parse(path) /===============//
//
// Розбирає рядок-шлях на складові частини:
// import path from "node:path";
//
// macOS ============//
// ------------/ START /----------//
// console.log(path.parse("/home/user/dir/file.txt"));
/_
{
root: '/',
dir: '/home/user/dir',
base: 'file.txt',
ext: '.txt',
name: 'file'
}
_/
// ------------/ END /----------//
//
//
// Windows ============//
// ------------/ START /----------//
// console.log(path.parse("C:\\path\\dir\\file.txt"));
/_
{
root: 'C:\\',
dir: 'C:\\path\\dir',
base: 'file.txt',
ext: '.txt',
name: 'file'
}
_/
// ------------/ END /----------//
//
//

// ===============/ 5 - Модуль fs /===============//

Одна з головних можливостей Node.js — робота з файлами та папками. Для цього використовується вбудований модуль fs.

Багато його методів існують у двох варіантах:
**_ синхронні (readFileSync, writeFileSync), які блокують виконання коду;
_** асинхронні (через fs/promises), які працюють із Promise і не блокують.

Синхронні методи іноді зручно застосувати, наприклад, щоб один раз зчитати конфігурацію на старті програми. У більшості випадків краще використовувати асинхронні версії.

// ===========/ Читання файлу - fs.readFileSync(path, options) /===========//

// ------------/ fs.readFileSync(path, options)
— синхронне читання вмісту файла. Приймає шлях до файлу та, за потреби, кодування ("utf8", "ascii" тощо). Якщо кодування не вказано, повертає Buffer, якщо вказано — звичайний рядок.

// ------------/ START /----------//
// import fs from "node:fs";

// === приклад без кодування
const buffer = fs.readFileSync("file.txt");
console.log(buffer); // <Buffer 48 65 6c 6c 6f ...>

// == приклад із кодуванням
const data = fs.readFileSync("file.txt", "utf8");
console.log("Вміст файлу:", data); // "Hello"
// ------------/ END /----------//

// ------------/ fs.readFile(path, options)
— асинхронне читання вмісту файла. Приймає шлях і опції. Повертає Promise, який у разі успіху містить або Buffer, або рядок (залежно від того, чи вказано кодування).

// ------------/ START /----------//

<!-- --------------------------------------------------- -->
<!-- import fs from "node:fs/promises"; -->

// без кодування

<!-- const buffer = await fs.readFile("file.txt"); -->
<!-- console.log(buffer); // <Buffer ... > -->

// з кодуванням

<!-- const data = await fs.readFile("file.txt", "utf8"); -->
<!-- console.log("Вміст файлу:", data); // "Hello" -->

// ------------/ END /----------//

<!-- У Node.js Buffer — це спеціальний тип даних для зберігання двійкової інформації (наприклад, вмісту файлів). Якщо потрібно працювати з текстом, достатньо вказати кодування, і тоді результатом буде звичайний рядок. -->
<!-- --------------------------------------------------- -->

// =======/ Запис у файл - fs.writeFileSync(path, data, options) /========//

// ------------/ fs.writeFileSync(path, data, options)
— синхронний запис у файл. Якщо файл існує — перезапише його, якщо ні — створить новий.
// ------------/ START /----------//

<!-- import fs from "node:fs"; -->
<!-- fs.writeFileSync("output.txt", "Привіт з Node.js!", "utf8"); -->

// ------------/ fs.writeFile(path, data, options)
— асинхронний запис у файл. Повертає Promise, що виконується після завершення операції.
// ------------/ START /----------//

<!-- import fs from "node:fs/promises"; -->
<!-- await fs.writeFile("output.txt", "Привіт з Node.js!", "utf8"); -->
<!-- console.log("Дані успішно записані у файл."); -->

// ------------/ END /----------//

// ===========/ Додавання у файл - fs.appendFile(path, data, options) /==========//

// ------------/ fs.appendFile(path, data, options)
— асинхронне додавання у файл. Дописує дані в кінець файлу.
// ------------/ START /----------//

<!-- import fs from "node:fs/promises"; -->
<!-- await fs.appendFile("output.txt", "\nЩе один рядок", "utf8"); -->
<!-- console.log("Дані успішно додані у файл."); -->

// ------------/ END /----------//

// =======/ Перейменування / переміщення файлів - fs.rename(oldPath, newPath) /========//

// ------------/ fs.rename(oldPath, newPath)
— асинхронне перейменування або переміщення файлу. Повертає Promise.
// ------------/ START /----------//

<!-- import fs from "node:fs/promises"; -->
<!-- await fs.rename("oldfile.txt", "newfile.txt"); -->
<!-- console.log("Файл успішно перейменовано."); -->

// ------------/ END /----------//

// =========/ Видалення файлу - fs.unlink(path) /=========//

// ------------/ fs.unlink(path)
— асинхронне видалення файлу. Повертає Promise.
// ------------/ START /----------//

<!-- import fs from "node:fs/promises"; -->
<!-- await fs.unlink("file.txt"); -->
<!-- console.log("Файл успішно видалено."); -->

// ------------/ END /----------//

// ===============/ Підсумок /===============//

path — для правильного формування шляхів у різних ОС.
fs — для роботи з файлами та папками.
Синхронні методи зручні для одноразових операцій (наприклад, читання конфігів на старті).
В реальних застосунках використовуємо асинхронні методи (fs/promises), бо вони не блокують виконання.

Ці два модулі є базовими інструментами у Node.js, і розуміння їхньої роботи — перший крок до створення повноцінних серверних застосунків.

// ===============/ Тип даних Buffer /===============//

При роботі з файловою системою ви часто будете бачити об’єкти типу Buffer. Це спеціальний тип даних у Node.js, призначений для роботи з двійковими даними.

Біт — це найменша одиниця інформації: 0 або 1.
Байт — це 8 бітів. У такій комбінації можна представити 256 різних значень.

Buffer у Node.js — це масив байтів. Кожен байт може зберігати невелике значення (наприклад, код символу).

// ------------/ START /----------//
import fs from "node:fs/promises";
const buffer = await fs.readFile("hello.txt");

// якщо у файлі hello.txt був текст "Hello World!"
console.log(buffer);
// <Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64 21>
// ------------/ END /----------//

Вивід <Buffer ...> показує набір байтів у шістнадцятковій системі (hex). Кожен байт відповідає одному символу або службовому знаку (наприклад, пробілу).

// ===============/ Кодування /===============//

Файл завжди зберігається як набір байтів. Але щоб інтерпретувати його вміст як текст, потрібно знати кодування. Найпоширеніше текстове кодування — UTF-8. Саме воно дозволяє перетворити байти у символи:

// ------------/ START /----------//
import fs from "node:fs/promises";

const buffer = await fs.readFile("hello.txt");
console.log(buffer.toString("utf-8")); // Hello World!
// ------------/ END /----------//

Якщо при читанні файлу одразу вказати кодування ("utf8"), результатом буде рядок, а не Buffer. Якщо кодування не вказано — повертається Buffer.
