// src/routes/authRoutes.js
// ==================================
// Маршрут для реєстрації User (4.4 - Реєстрація користувачів)
// Маршрут для логування User (4.9 - Логін користувачів / валідатор і контролер до маршруту)
// Маршрут для логауту User (4.17 - Логаут користувачів / Роут)
// Маршрут для оновлення сесії User (4.19 - Аутентифікація / Роут)

import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
} from '../controllers/authController.js';
import {
  loginUserSchema,
  registerUserSchema,
} from '../validations/authValidation.js';

const router = Router();

router.post('/auth/register', celebrate(registerUserSchema), registerUser);
router.post('/auth/login', celebrate(loginUserSchema), loginUser);
router.post('/auth/logout', logoutUser);
router.post('/auth/refresh', refreshUserSession);

export default router;
