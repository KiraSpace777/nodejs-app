// src/routes/userRoutes.js

import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { updateUserAvatar } from '../controllers/userController.js';
import { upload } from '../middleware/multer.js';

const router = Router();

router.patch(
  '/users/me/avatar',
  authenticate,
  // (5.9.2) Локальне підключення middleware multer ("upload"),
  // додаємо після авторизації, але до контролера
  upload.single('avatar'),
  updateUserAvatar,
);

export default router;

// ======================= (5.9.2) =====================
// (5.9.2) Налаштування Multer / Локальне підключення middleware, лише до необхідних маршрутів
// =======================================
// src/routes/userRoutes.js
// ---------------------------------------
// middleware multer ("upload") підключається не глобально, а безпосередньо до потрібного маршруту. Додаємо його у PATCH /users/me/avatar
// Метод single(fieldname) обробляє рівно один файл. У запиті очікується поле з іменем, яке ви вказали ("avatar"), і Multer прикріплює цей файл до req.file.
//
// =======================
// ЩО ДАЛІ
// ======================= (5.9.3) =====================
// (5.9.3) Налаштування Multer / Оновлення логіки контролера
// =======================================
// // src/controllers/userController.js

// ======================= (5.8.1) =====================
// (5.8.1) Аватар користувача  / оновлюємо модель userSchema, додаємо необов’язкову властивість
// ----------------------
// src/models/user.js
// ======================= (5.8.2) =====================
// (5.8.2) Аватар користувача  / КОНТРОЛЛЕР / Маршрут "/users/me/avatar"
// ----------------------
// src/controllers/userController.js
// ======================= (5.8.3) =====================
// (5.8.3) Аватар користувача / РОУТЕР  / Маршрут " /users": Middleware authenticate
// ----------------------
// src/routes/userRoutes.js
//
// Middleware authenticate гарантує, що змінювати аватар може лише автентифікований користувач від свого імені.

// =======================
// ЩО ДАЛІ
// ======================= (5.8.4) =====================
// Аватар користувача  /
// ----------------------
// src/server.js
//
// у файлі src/server.js імпортуємо нові раути та додаємо їх через app.use
