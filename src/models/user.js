// src/models/user.js
// --------------------------
// Модель користувача (4.1 - Реєстрація користувачів)

import { model, Schema } from 'mongoose';

const userSchema = new Schema(
  {
    username: { type: String, trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true },
    // (5.8.1) Аватар користувача / додаємо необов’язкову властивість
    avatar: {
      type: String,
      required: false,
      default: 'https://ac.goit.global/fullstack/react/default-avatar.jpg',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// використовуємо pre-hook Schema.pre("save"), який виконується перед збереженням користувача, щоб у майбутньому користувач міг змінити ім’я у профілі, функція не може бути стрілковою (через this).
userSchema.pre('save', async function () {
  if (!this.username) {
    this.username = this.email;
  }
});

// Перевизначаємо метод toJSON (Видалення паролю з відповіді)
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = model('User', userSchema);

// ======================= (5.8.1) =====================
// (5.8.1) Аватар користувача  / оновлюємо модель userSchema, додаємо необов’язкову властивість
// ----------------------
// src/models/user.js
//
// Ми реалізуємо можливість користувачеві змінювати аватар. Тому до моделі користувача додаємо необов’язкову властивість avatar зі значенням за замовчуванням.
//
// =======================
// ЩО ДАЛІ
// ======================= (5.8.2) =====================
// (5.8.2) Аватар користувача  / Маршрут
// ----------------------
// src/controllers/userController.js
//

// ======================= (4.1) =====================
// Реєстрація користувачів
// Будь-яка робота з аутентифікацією та авторизацією починається з реєстрації користувачів. Користувач — це окрема сутність у нашому додатку, тому спочатку потрібно створити для нього модель.
// ---------------------------------------------------
// 1) Модель користувача
// src/models/user.js

// 2) Схема валідації
// src/validations/authValidation.js

// 3) Контролер та маршрут
// src/controllers/authController.js

// 4) Маршрут для реєстрації:
// src/routes/authRoutes.js

// 5) І підключаємо новий роут у сервері:
// src/server.js
// ---------------------------------------------------
// Таким чином, ми створили модель користувача, налаштували валідацію для реєстрації та підключили маршрут POST /auth/register. Наступний крок — реалізація логіки створення користувача та хешування паролю
// ---------------------------------------------------

// Модель користувача
// -------------------------
// Ми використовуємо email як унікальний ідентифікатор користувача. Тому додаємо до цього поля unique: true.
// username — необов’язкове поле. За замовчуванням воно дорівнює email користувача. У майбутньому користувач зможе змінити ім’я у профілі.
// Для цього ми використовуємо pre-hook Schema.pre("save"), який виконується перед збереженням користувача.
// Оскільки ми використовуємо this (посилання на поточний документ), функція не може бути стрілковою.
// --------------------------
// src/models/user.js
// --------------------------
// Модель користувача

// import { model, Schema } from 'mongoose';

// const userSchema = new Schema(
//   {
//     username: { type: String, trim: true },
//     email: { type: String, unique: true, required: true, trim: true },
//     password: { type: String, required: true },
//   },
//   { timestamps: true },
// );
// userSchema.pre('save', function () {
//   if (!this.username) {
//     this.username = this.email;
//   }
// });
// export const User = model('User', userSchema);
// --------------------------

// Видалення паролю з відповіді
// -------------------------
// Пароль зберігається в базі, але повертати його клієнту небезпечно. Ми можемо видаляти його автоматично з будь-якої відповіді, перевизначивши метод toJSON().
// --------------------------
// src/models/user.js
// --------------------------
// // Перевизначаємо метод toJSON
// userSchema.methods.toJSON = function () {
//   const obj = this.toObject();
//   delete obj.password;
//   return obj;
// };
// --------------------------
// Тепер, коли ми відправляємо користувача через res.json(), поле password автоматично видаляється.
