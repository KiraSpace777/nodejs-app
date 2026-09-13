// src/utils/sendEmail.js

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (options) => {
  return await transporter.sendMail(options);
};

// =================(5.3)====================
// Функціонал відправлення листів виносимо в окрему утиліту sendEmail
// transporter створює з’єднання зі SMTP-сервером.
// nodemailer автоматично підбере безпечні налаштування відповідно до порту та відповіді сервера.
// =================(5.4)============
// Генеруємо токен (JWT) для лінка
// Встановлюємо бібліотеку jsonwebtoken для роботи з JWT.
// npm i jsonwebtoken
// Для створення токена потрібен випадковий секретний рядок. Додаємо його як змінну оточення JWT_SECRET, що використовуватиметься для підпису токена. Значення може бути довільним, напр., wKYqbcFlT0AOdZPkyTH6URf0gG або будь-яке інше.
// # .env
