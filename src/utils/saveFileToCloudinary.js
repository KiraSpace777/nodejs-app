// src/utils/saveFileToCloudinary.js

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function saveFileToCloudinary(buffer, userId) {
  const options = {
    folder: 'students-app/avatars',
    public_id: `avatar_${userId}`,
    resource_type: 'image',
    overwrite: true,
    unique_filename: false,
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'auto' },
      { fetch_format: 'auto', quality: 'auto' },
    ],
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
}

// ======================= (5.10.1) =====================
// (5.10.1) Хмарне сховище Cloudinary / Утиліта для завантаження файлів
// ------------------------------------------------------
// src/utils/saveFileToCloudinary.js
// ------------------------------------------------------
// Хмарне сховище Cloudinary
// ------------------------------------------------------
// Cloudinary — це хмарний сервіс для керування зображеннями та відео. Він дозволяє зберігати, обробляти, оптимізувати та доставляти медіафайли. Cloudinary забезпечує можливості завантаження, масштабування, перетворення формату, покращення якості та інтеграцію з іншими вебсервісами для ефективного використання медіаконтенту у веб- та мобільних додатках.
// Ми будемо використовувати Cloudinary для завантаження, зберігання та отримання безпечних URL-адрес для медіафайлів.
// ------------------------------------------------------
// Реєстрація
// ------------------------------------------------------
// Для початку потрібно зареєструватися у Cloudinary:
// Створимо функцію saveFileToCloudinary, яка отримає файл і завантажить його у Cloudinary:
// Додамо cloudinary у залежності нашого додатка:  npm install cloudinary
// ------------------------------------------------------
// Змінні оточення
// ------------------------------------------------------
// Збережемо ключі доступу у файлі .env:
// # .env
//
// # Cloudinary
// CLOUDINARY_CLOUD_NAME=ваше_значення
// CLOUDINARY_API_KEY=ваше_значення
// CLOUDINARY_API_SECRET=ваше_значення
//
// ------------------------------------------------------
// Утиліта для завантаження файлів
// ------------------------------------------------------
// Створимо функцію saveFileToCloudinary, яка отримає файл і завантажить його у Cloudinary:
// src/utils/saveFileToCloudinary.js

// Як працює ця функція:

// Конфігурація Cloudinary: виконується через cloudinary.config(), де ми вказуємо ключі з .env.
// upload_stream: створюється і налаштовується потік для завантаження, куди можна передати вміст файлу.
// uploadStream.end(buffer): передає буфер із зображенням до потоку для завантаження у Cloudinary.
// Promise: функція обгорнута у проміс, щоб можна було зручно використовувати await в місці виклику. Якщо завантаження успішне — повертається результат з усією інформацією про файл, якщо помилка - вона передається у reject.

// Метод cloudinary.uploader.upload_stream(...) створює записувальний потік (Writable stream).

// Writable потік — це приймач, який:
// отримує дані (байти зображення);
// відправляє їх у Cloudinary API;
// сигналізує, коли прийом завершено або сталася помилка.

// Тобто upload_stream — це такий “вхідний порт” у Cloudinary, який чекає, що ви в нього “наллєте” байти зображення.
// Це дозволяє нам передавати дані без створення тимчасових файлів на диску.

//
// ======================= (5.10.2) =====================
// (5.10.2) Хмарне сховище Cloudinary / Оновлення контролера
// ------------------------------------------------------
// src/controllers/userController.js
