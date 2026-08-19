// src/middleware/errorHandler.js
// -------------------------------------
// Error middleware + Використання http-errors

import { HttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  console.error('Error Middleware:', err);

  // Якщо помилка створена через http-errors
  // src/controllers/studentsController.js
  // --------------------------------------
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message || err.name,
    });
  }

  // перевірка, якщо ми в продакшн версії, виводимо тільки загальну інформацію, що виникла помилка, без деталей
  const isProd = process.env.NODE_ENV === 'production';

  // Усі інші помилки — як внутрішні
  res.status(500).json({
    message: isProd
      ? 'Something went wrong. Please try again later.'
      : err.message,
  });
};

// =============================================
// ================= COMMENTS ==================
// -------------------------------------
// Error middleware
//
// Це middleware має 4 аргументи (err, req, res, next) — саме за цим Express розуміє, що воно призначене для помилок.
// Використовується завжди останнім, щоб перехопити всі помилки з попередніх обробників.
// Ми виводимо помилку в консоль і повертаємо клієнту відповідь зі статусом 500 Internal Server Error.
// далі потрібно імпортувати та запустити на сервері // src/server.js
// -------------------------------------
// Використання http-errors
// npm install http-errors === пакет http-errors дозволяє створювати помилки з потрібним статусом і повідомленням.
// -------------------------------------
// У контролері використовуємо функцію createHttpError:
// src/controllers/studentsController.js
//
// Тепер замість «звичайної» помилки ми явно вказуємо код 404 і повідомлення.
// -------------------------------------
// Оновлюємо errorHandler
// src/middleware/errorHandler.js
//
// У middleware errorHandler також потрібно оновити код, щоб він відрізняв HTTP-помилки від інших.
// -------------------------------------
// HttpError — це свідомо створені помилки, які ми самі генеруємо в коді (наприклад, createError(400, "Bad request"), createError(404, "Not Found") тощо). Такі повідомлення вважаються безпечними для користувача, оскільки вони не містять внутрішніх деталей застосунку чи бази даних. Тому їх можна повертати "як є" як у режимі розробки, так і в продакшені.
// А от для решти помилок ситуація інша. Їхні повідомлення можуть містити:
// частину Mongo-запиту,
// stack trace,
// назви внутрішніх змінних чи функцій.
// Таку інформацію небезпечно показувати у продакшені, тому:
// у development ми повертаємо реальний err.message, щоб було зручно дебажити,
// у production віддаємо лише загальне дружнє повідомлення, без деталей.
// --------------------------------
// Результат
// --------------------------------
// Тепер, якщо відправити запит на GET /students/:id із неіснуючим id, отримаємо у відповідь:
// статус: 404 Not Found,
// повідомлення: "Student not found".
// Таким чином ми винесли обробку помилок у єдине місце, зробили її більш правильною та зрозумілою для клієнта.

// =============================================
// ================ START CODE =================

// // src/middleware/errorHandler.js
// // -------------------------------------
// // Error middleware + Використання http-errors

// export const errorHandler = (err, req, res, next) => {
//   console.error(err);

//   const isProd = process.env.NODE_ENV === 'production';

//   res.status(500).json({
//     message: isProd
//       ? 'Something went wrong. Please try again later.'
//       : err.message,
//   });
// };
