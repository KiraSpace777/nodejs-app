// src/middleware/authenticate.js
// ==============================================
// (4.20) Middleware аутентифікації

import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

export const authenticate = async (req, res, next) => {
  const { sessionId, accessToken } = req.cookies;

  // 1. Перевіряємо наявність кукі
  if (!sessionId || !accessToken) {
    throw createHttpError(401, 'Missing session credentials');
  }

  // 2. Якщо все ок, шукаємо сесію
  const session = await Session.findOne({
    _id: sessionId,
    accessToken,
  });

  // 3. Якщо такої сесії нема, повертаємо помилку
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  // 4. Перевіряємо термін дії access токена
  const isAccessTokenExpired = session.accessTokenValidUntil < new Date();

  if (isAccessTokenExpired) {
    throw createHttpError(401, 'Access token expired');
  }

  // 5. Якщо з токеном все добре і сесія існує, шукаємо користувача
  const user = await User.findById(session.userId);

  // 6. Якщо користувача не знайдено
  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  // 7. Якщо користувач існує, додаємо його до запиту
  req.user = user;

  // 8. Передаємо управління далі
  next();
};

// ====================================
// (4.20) Middleware аутентифікації / Middleware authenticate
// ------------------------------------
// Щоб обмежити доступ до приватних колекцій, ми створимо middleware authenticate, який перевірятиме токени у cookies і визначатиме, чи користувач може виконати запит.

// Що робить цей middleware
// ----------------------------------------
// Перевіряє cookies. Якщо немає — відмовляємо у доступі.
// Шукає сесію: чи існує в базі сесія з таким токеном.
// Перевіряє строк дії токена: якщо він прострочений — користувач має оновити сесію.
// Шукає користувача: якщо сесія дійсна, але користувач у базі видалений — доступ також забороняється.
// Додає користувача у req: після цього контролери зможуть отримати інформацію про нього (req.user).

// Таким чином кожен запит до приватних ресурсів проходить перевірку перед тим, як дійти до контролера.
