// src/server.js
// ------------------------------------------------------
// npm init -y === Ініціалізує npm: файл package.json.
// npm install -D nodemon === автоматично перезапускає застосунок.
// npm init @eslint/config@latest === задати єдиний стиль написання коду
// npm install express ===  мінімалістичний веб-фреймворк для Node.js
// npm install cors === дозволяє браузеру робити запити з одного домену до іншого
// npm install pino-http pino-pretty ===  Логування запитів (вхідні/вихідні запити, час обробки)
// npm install dotenv ===  зчитування змінних оточення

// ===================== 2 (КОД) ========================
// Приклад: логування часу та запитів
// + обробка помилок через middleware (404/500)
// ======================================================

import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT ?? 3000; // Використовуємо значення з .env або дефолтний порт 3000
// const PORT = Number(process.env.PORT) || 3000;

// ===============================================
// Middleware list
// ===============================================
app.use(express.json()); // Middleware для парсингу JSON
app.use(cors()); // Дозволяє запити з будь-яких джерел
app.use(
  pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat:
          '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
        hideObject: true,
      },
    },
  }),
); // Логування запитів

// ===============================================
// Логування часу
// ===============================================
app.use((req, res, next) => {
  console.log(`Time: ${new Date().toLocaleString()}`);
  next();
});

// ===============================================
// Кореневий маршрут
// ===============================================
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello, World!' });
});

// ===============================================
// Маршрут для тестування middleware помилки
// GET http://localhost:3000/test-error
// GET {{domain}}/test-error
// ===============================================
app.get('/test-error', (req, res) => {
  // Штучна помилка для прикладу
  throw new Error('Something went wrong');
});

// ===============================================
// Middleware 404 (після всіх маршрутів)
// GET http://localhost:3000/random
// GET {{domain}}/random
// ===============================================
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ===============================================
// Middleware 500 для обробки помилок (останнє)
// ===============================================
// до введення змінної ENV
// -----------------------------------------
// app.use((err, req, res, next) => {
//   console.error('Error:', err.message);
//   res.status(500).json({
//     message: 'Internal Server Error',
//     error: err.message,
//   });
// });
// -----------------------------------------
// оновлений Middleware 500 з врахуванням змінної ENV 'production'
// та обмеження в продакшн відображення деталей помилки
// -----------------------------------------
app.use((err, req, res, next) => {
  console.error(err);

  const isProd = process.env.NODE_ENV === 'production';

  res.status(500).json({
    message: isProd
      ? 'Something went wrong. Please try again later.'
      : err.message,
  });
});

// ===============================================
// Запуск сервера
// ===============================================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ======================= 2 (КОМЕНТАРІ) =========================
// Логування часу у поточному коді виконується не під час перезапуску сервера, а при кожному HTTP-запиті від клієнта до цього сервера.
// Ми винесли функцію console.log всередину проміжного ПЗ (middleware) app.use((req, res, next) => { ... }). Цей блок коду спрацьовує виключно тоді, коли хтось (наприклад, ми через браузер або Postman) звертається до сервера за адресою http://localhost:3000/.
//  ----------------------------------------
// Чому так відбувається?
//  ----------------------------------------
// app.listen(...) (рядки 24-26) — цей код виконується один раз під час старту або перезапуску сервера за допомогою nodemon. Тому повідомлення Server is running on port 3000 з'являється чітко при кожному перезапуску
// .app.use(...) (рядки 13-16) — це функція-обробник запитів. Вона не запускається сама по собі під час старту. Вона «спить» і чекає, поки на сервер надійде мережевий запит.
// ----------------------------------------
// Як це змінити?
// ----------------------------------------
// Якщо ми хочемо, щоб час поточного запуску сервера виводився саме під час його старту (разом із повідомленням про порт), треба перенести логування в app.listen:
// -----------
// javascript
// -----------
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//     console.log(`Start Time: ${new Date().toLocaleString()}`);
// });

// Таким чином, якщо ми хочемо відстежувати саме запити користувачів, треба залишити код у app.use, але потрібно пам'ятати, що для появи нового рядка часу потрібно обов'язково надіслати запит на сервер (наприклад, оновити сторінку в браузері).

// // ===================== 1 (КОД) ========================
// // Мінімальний застосунок (app boilerplate)
// // ======================================================
//
// import express from 'express';

// const app = express();
// const PORT = 3000;

// // Перший маршрут
// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'Hello world!' });
// });

// // Запуск сервера
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
