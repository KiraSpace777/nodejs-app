// src/validations/authValidation.js
// =========================================
// Схема валідації (4.2 - Реєстрація користувачів)

import { Joi, Segments } from 'celebrate';

// Схема валідації auth/register
export const registerUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
};

// Схема валідації (Логін користувачів), (4.7)
export const loginUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

// ======================= (4.2) =====================
// Схема валідації auth
// Реєстрація відбувається через POST /auth/register. Дані приходять у тілі запиту, тому створимо схему для валідації.
// email — повинен бути валідним email і обов’язковим;
// password — мінімум 8 символів.

// ======================= (4.7) =====================
// (4.7) Логін користувачів / Схема валідації
// Спочатку описуємо валідацію тіла запиту: потрібні валідний email і пароль.
