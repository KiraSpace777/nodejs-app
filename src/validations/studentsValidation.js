// src/validations/studentsValidation.js
// -----------------------------------------------

import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';

// =====================================
// (1-5) Cхема для валідації тіла запиту
// -------------------------------------
export const createStudentSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(3).max(30).required().messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name should have at least {#limit} characters',
      'string.max': 'Name should have at most {#limit} characters',
      'any.required': 'Name is required',
    }),
    age: Joi.number().integer().min(12).max(65).required().messages({
      'number.base': 'Age must be a number',
      'number.min': 'Age must be at least {#limit}',
      'number.max': 'Age must be at most {#limit}',
      'any.required': 'Age is required',
    }),
    gender: Joi.string().valid('male', 'female', 'other').required().messages({
      'any.only': 'Gender must be one of: male, female, or other',
      'any.required': 'Gender is required',
    }),
    avgMark: Joi.number().min(2).max(12).required().messages({
      'number.base': 'Average mark must be a number',
      'number.min': 'Average mark must be at least {#limit}',
      'number.max': 'Average mark must be at most {#limit}',
      'any.required': 'Average mark is required',
    }),
    onDuty: Joi.boolean().messages({
      'boolean.base': 'onDuty must be a boolean value',
    }),
  }).min(1), // важливо: не дозволяємо порожнє тіло
};

// =====================================
// (6) Валідація ідентифікатора ObjectId
// -------------------------------------
// Кастомний валідатор для ObjectId
const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value)
    ? helpers.message('Invalid id format (must be: string / hex / 24 symbols)')
    : value;
};

// Схема для перевірки параметра studentId (hex, 24 символи)
export const studentIdParamSchema = {
  [Segments.PARAMS]: Joi.object({
    studentId: Joi.string().custom(objectIdValidator).required(),
  }),
};

// =====================================
// (7) Валідація для PATCH
// -------------------------------------
export const updateStudentSchema = {
  [Segments.PARAMS]: Joi.object({
    studentId: Joi.string().custom(objectIdValidator).required(),
  }),
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(3).max(30),
    age: Joi.number().integer().min(12).max(65),
    gender: Joi.string().valid('male', 'female', 'other'),
    avgMark: Joi.number().min(2).max(12),
    onDuty: Joi.boolean(),
  }).min(1), // важливо: не дозволяємо порожнє тіло
};

// =====================================
// (8) Валідація для GET - маршрут отримання всіх студентів
// (Створення пагінації + Валідація параметрів через Joi і celebrate)
// -------------------------------------
// export const getStudentsSchema = {
//   [Segments.QUERY]: Joi.object({
//     page: Joi.number().integer().min(1).default(1),
//     perPage: Joi.number().integer().min(5).max(20).default(10),
//   }),
// };

// =====================================
// (9) Валідація для GET - Створення фільтрів
// -------------------------------------
// export const getStudentsSchema = {
//   [Segments.QUERY]: Joi.object({
//     page: Joi.number().integer().min(1).default(1),
//     perPage: Joi.number().integer().min(5).max(20).default(10),
//     gender: Joi.string().valid('male', 'female', 'other'),
//     minAvgMark: Joi.number().positive(),
//   }),
// };
// -------------------------------------
// (10-Пошук / 11-Сортування)
// -------------------------------------
export const getStudentsSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1),
    perPage: Joi.number().integer().min(5).max(20),
    gender: Joi.string().valid('male', 'female', 'other'),
    minAvgMark: Joi.number().positive(),
    sortBy: Joi.string().valid('_id', 'name', 'age', 'avgMark'),
    sortOrder: Joi.string().valid('asc', 'desc'),
  }),
};
// ==================================================
// ======= Етап 9 - Створення фільтрів
// ------------------------ 1 -----------------------
// src/validations/studentsValidation.js
// ------------------------ 2 -----------------------
// src/controllers/studentsController.js
// --------------------------------------------------

// -------------------------------------
// Створення фільтрів
// -------------------------------------

// Додамо можливість фільтрувати колекцію студентів за статтю (gender) та мінімальним значенням середнього балу (minAvgMark).
// Приклад запиту з усіма параметрами:
// -------------------------------------
// /students?page=1&perPage=15&gender=female&minAvgMark=2
// -------------------------------------

// -------------------------------------
// Схема валідації
// -------------------------------------
// Спочатку оновимо схему, щоб перевіряти всі можливі query-параметри у маршруті GET /students.

// -------------------------------------
// // src/validations/studentsValidation.js
// -------------------------------------
// import { Joi, Segments } from "celebrate";

// export const getStudentsSchema = {
//   [Segments.QUERY]: Joi.object({
//     page: Joi.number().integer().min(1),
//     perPage: Joi.number().integer().min(5).max(20),
//     gender: Joi.string().valid("male", "female", "other"),
//     minAvgMark: Joi.number().positive()
//   })
// };
// -------------------------------------
// page і perPage — як і раніше, для пагінації;
// gender — дозволені значення "male", "female", "other";
// minAvgMark — число більше нуля, для вибору студентів із середнім балом вище заданого.

// -------------------------------------
// Контролер
// -------------------------------------
// Тепер у контролері будуємо запит динамічно, враховуючи, які параметри передав користувач.

// Модифікуємо код контролера:
// -------------------------------------
// // src/controllers/studentsController.js

// export const getStudents = async (req, res) => {
//   const { page = 1, perPage = 10, gender, minAvgMark } = req.query;
//   const skip = (page - 1) * perPage;

//   const studentsQuery = Student.find();

//   // Будуємо фільтр
//   if (gender) {
//     studentsQuery.where("gender").equals(gender);
//   }
//   if (minAvgMark) {
//     studentsQuery.where("avgMark").gte(minAvgMark);
//   }

//   const [totalItems, students] = await Promise.all([
//     studentsQuery.clone().countDocuments(),
//     studentsQuery.skip(skip).limit(perPage),
//   ]);

//   const totalPages = Math.ceil(totalItems / perPage);

//   res.status(200).json({
//     page,
//     perPage,
//     totalItems,
//     totalPages,
//     students,
//   });
// };
// -------------------------------------

// Що тут відбувається?

// studentsQuery.where("gender").equals(gender) — додає умову для фільтрації за статтю, якщо параметр переданий.
// studentsQuery.where("avgMark").gte(minAvgMark) — додає умову для фільтрації за середнім балом (беремо тільки тих, у кого avgMark ≥ minAvgMark).
// Promise.all([...]) — запускаємо підрахунок (countDocuments) і отримання списку студентів одночасно, щоб не робити два послідовних запити.
// .clone() — потрібен у Mongoose, щоб один і той самий запит можна було виконати двічі (для підрахунку і для вибірки).

// У результаті ми отримуємо список студентів із врахуванням пагінації та фільтрів, а також додаткову інформацію: скільки всього студентів (totalItems) і скільки сторінок (totalPages).

// ==================================================
// ======= Етап 8 - Пагінація / Створення пагінації
// ------------------------ 1 -----------------------
// src/validations/studentsValidation.js
// (Валідація параметрів)
// ------------------------ 2 -----------------------
// src/routes/studentsRoutes.js
// (Додаємо middleware валідації до маршруту)
// ------------------------ 3 -----------------------
// src/controllers/studentsController.js
// (Оновлюємо контролер getStudents, щоб він віддавав студентів частинами)
// --------------------------------------------------

// Пагінація — це метод організації великої кількості даних, при якому записи відображаються частинами ("сторінками"), а не всі одразу.
//
// Навіщо потрібна пагінація?
// -----------------------------------
// Полегшує навігацію: користувачеві простіше переглядати дані маленькими частинами.
// Зменшує навантаження: сервер віддає лише потрібну частину результатів, а не всю колекцію.
// Підвищує швидкість: на фронтенді працювати з 10–20 записами значно легше, ніж із кількома тисячами.
//
// Основні параметри пагінації
// -----------------------------------
// При реалізації пагінації ми будемо працювати з такими властивостями:

// perPage — скільки записів показувати на одній сторінці;
// page — номер сторінки, яку хоче отримати користувач;
// totalItems — загальна кількість записів у колекції;
// totalPages — кількість сторінок, яка визначається як:
// -----------------------------------
// Math.ceil(totalItems / perPage)
// -----------------------------------
//
// Як це працює у запиті та відповіді
// -----------------------------------
// Клієнт відправляє параметри page та perPage у запиті до бекенду.
// Бекенд повертає:
// список записів для потрібної сторінки;
// мета-інформацію: page, perPage, totalItems, totalPages.
//
// Таким чином, користувач завжди знає, скільки ще даних є та як між ними переміщатися.
//
// -----------------------------------
// Створення пагінації
// -----------------------------------
// Додаємо пагінацію до маршруту отримання всіх студентів GET /students. Ми очікуємо, що клієнт може передати у рядку запиту параметри page та perPage.
// -----------------------------------
// /students?page=1&perPage=15
// -----------------------------------
// Це означає: "поверни мені першу сторінку з 15 студентів".
//
// -----------------------------------
// Валідація параметрів
// -----------------------------------
// Щоб запити були коректними, одразу додамо валідацію через Joi і celebrate. Для валідації параметрів рядка запиту описуємо схему в Segments.QUERY.
// -----------------------------------
// // src/validations/studentsValidation.js
// -----------------------------------
// import { Joi, Segments } from "celebrate";

// export const getStudentsSchema = {
//   [Segments.QUERY]: Joi.object({
//     page: Joi.number().integer().min(1).default(1),
//     perPage: Joi.number().integer().min(5).max(20).default(10),
//   }),
// };
// -----------------------------------
// Що тут відбувається:
//
// page — має бути цілим числом, не менше ніж 1.
// perPage — кількість студентів на сторінці. Має бути від 5 до 20.
// Обидва параметри необов’язкові.
//
// Додаємо middleware валідації до маршруту:
// -----------------------------------
// // src/routes/studentsRoutes.js
// -----------------------------------
// import { getStudentsSchema } from "../validations/studentsValidation.js";
// router.get("/students", celebrate(getStudentsSchema), getStudents);
// -----------------------------------
//
// Контролер із логікою пагінації
// -----------------------------------
// Тепер оновимо контролер getStudents, щоб він віддавав студентів частинами.
// -----------------------------------
// //src/controllers/studentsController.js
// -----------------------------------
// import { Student } from "../models/student.js";
// -----------------------------------
// export const getStudents = async (req, res) => {
//   // Отримуємо параметри пагінації
//   // і задаємо дефолтні значення
//   const { page = 1, perPage = 10 } = req.query;

//   const skip = (page - 1) * perPage;

//   // Створюємо базовий запит до колекції
//   const studentsQuery = Student.find();

//   // Виконуємо одразу два запити паралельно
//   const [totalItems, students] = await Promise.all([
//     studentsQuery.clone().countDocuments(),
//     studentsQuery.skip(skip).limit(perPage),
//   ]);

// 	// Обчислюємо загальну кількість «сторінок»
//   const totalPages = Math.ceil(totalItems / perPage);

//   res.status(200).json({
//     page,
//     perPage,
//     totalItems,
//     totalPages,
//     students,
//   });
// };
// -----------------------------------
//
// У відповіді ми віддаємо не тільки список студентів, але й корисну мета-інформацію:
// -----------------------------------
// на якій сторінці він зараз,
// скільки студентів показано на сторінці,
// скільки студентів є загалом,
// скільки всього сторінок доступно.

// ==================================================
// ======= Етап 7 - Валідація для PATCH
// ------------------------ 1 -----------------------
// src/validations/studentsValidation.js
// ------------------------ 2 -----------------------
// src/routes/studentsRoutes.js
// ------------------------ 3 -----------------------

// Тепер ми реалізуємо валідацію для маршруту PATCH /students/:studentId.
// У цьому випадку потрібно перевіряти дві речі:

// Ідентифікатор у параметрах маршруту. studentId має бути валідним ObjectId. Це дозволяє відсікти некоректні запити ще до звернення до бази.
// Тіло запиту. Оскільки це PATCH, усі поля є необов’язковими, але хоча б одне повинно бути передано. Для цього у Joi використовується .min(1).

// Створимо схему, яка перевірятиме одночасно і params, і body:
// -----------------------------------
// 1 // src/validations/studentsValidation.js
// -----------------------------------
// import { Joi, Segments } from 'celebrate';
// import { isValidObjectId } from 'mongoose';

// // Кастомний валідатор для ObjectId
// const objectIdValidator = (value, helpers) => {
//   return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
// };

// export const updateStudentSchema = {
//   [Segments.PARAMS]: Joi.object({
//     studentId: Joi.string().custom(objectIdValidator).required(),
//   }),
//   [Segments.BODY]: Joi.object({
//     name: Joi.string().min(3).max(30),
//     age: Joi.number().integer().min(12).max(65),
//     gender: Joi.string().valid('male', 'female', 'other'),
//     avgMark: Joi.number().min(2).max(12),
//     onDuty: Joi.boolean(),
//   }).min(1), // важливо: не дозволяємо порожнє тіло
// };
// -----------------------------------

// Тепер використаємо цю схему у маршруті PATCH /students/:studentId:
// -----------------------------------
// 2 // src/routes/studentsRoutes.js
// -----------------------------------
// import { Router } from 'express';
// import { celebrate } from 'celebrate';
// import { updateStudent } from '../controllers/studentsController.js';
// import { updateStudentSchema } from '../validations/studentsValidation.js';

// const router = Router();
// router.patch('/students/:studentId', celebrate(updateStudentSchema), updateStudent);
// export default router;
// -----------------------------------
// Якщо studentId невалідний → повертається 400 Bad Request з повідомленням "Invalid id format".
// Якщо тіло запиту порожнє → повертається 400 Bad Request з повідомленням від Joi.
// Якщо дані валідні → виконується контролер updateStudent.

// ==================================================
// ======= Етап 6 - Валідація ідентифікатора (ObjectId)
// ------------------------ 1 -----------------------
// src/validations/studentsValidation.js
// - створення схеми objectIdValidator + studentIdParamSchema
// ------------------------ 2 -----------------------
// src/routes/studentsRoutes.js
// Додамо схему "studentIdParamSchema" у маршрут /students/:studentId, щоб celebrate автоматично перевіряв параметр studentId
// --------------------------------------------------
//
// У MongoDB кожен документ має унікальний ідентифікатор у полі _id. Це ObjectId, який має строго визначений формат:
// завжди рядок у шістнадцятковому (hex) вигляді;
// довжина — рівно 24 символи (12 байт у двійковому представленні);
// автоматично генерується MongoDB при створенні документа.

// Через це будь-який довільний рядок (навіть із 24 символів) не обов’язково буде валідним ObjectId. Якщо такий рядок передати у запит, MongoDB може повернути помилку або просто не знайти документ.

// Щоб цього уникнути, ми додаємо валідацію ідентифікатора ще на рівні API. Це дозволяє:
// відсіювати некоректні або шкідливі запити;
// не передавати у базу "сміттєві" значення;
// одразу повертати зрозумілу помилку клієнту.

// -----------------------------------
// Функція objectIdValidator
// -----------------------------------
// Створимо кастомний валідатор для Joi, який перевірятиме значення на валідність ObjectId.
// -----------------------------------
// // src/validations/studentsValidation.js

// import { Joi, Segments } from 'celebrate';
// import { isValidObjectId } from 'mongoose';

// // Кастомний валідатор для ObjectId
// const objectIdValidator = (value, helpers) => {
//   return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
// };

// // Схема для перевірки параметра studentId
// export const studentIdParamSchema = {
//   [Segments.PARAMS]: Joi.object({
//     studentId: Joi.string().custom(objectIdValidator).required(),
//   }),
// };
// -----------------------------------
// isValidObjectId(value) — це утиліта з Mongoose, яка перевіряє, чи рядок відповідає формату MongoDB ObjectId.
// Якщо isValidObjectId повертає false, ми викликаємо helpers.message('Invalid id format'), щоб створити помилку в Joi.
// Якщо все гаразд, функція просто повертає значення далі.

// Таким чином, ми отримуємо зрозумілу помилку для клієнта замість технічної MongoDB-помилки.
// -----------------------------------
// Використання у маршрутах
// -----------------------------------
// Додамо схему у маршрут /students/:studentId, щоб celebrate автоматично перевіряв параметр studentId:

// -----------------------------------
// // src/routes/studentsRoutes.js
// -----------------------------------
// import { Router } from 'express';
// import { celebrate } from 'celebrate';

// import { getStudentById, deleteStudent } from '../controllers/studentsController.js';
// import { studentIdParamSchema } from '../validations/studentsValidation.js';

// const router = Router();

// router.get('/students/:studentId', celebrate(studentIdParamSchema), getStudentById);
// router.delete('/students/:studentId', celebrate(studentIdParamSchema), deleteStudent);

// export default router;
// -----------------------------------

// Ми використовуємо одну й ту саму схему для обох маршрутів:
// GET /students/:studentId — отримання студента за id;
// DELETE /students/:studentId — видалення студента за id.
// Це дозволяє уникнути дублювання коду й зберігати валідацію в одному місці.

// Тепер:
// Якщо id валідний → виконується контролер.
// Якщо id невалідний → celebrate одразу повертає 400 Bad Request з повідомленням "Invalid id format".

// ==================================================
// ======= Етап 5 - Middleware для обробки
//         (+ middleware errors() від celebrate)
// --------------------------------------------------
// === " src/server.js "
//
// Ми вже бачили, що celebrate автоматично генерує помилки при невдалій валідації (наприклад, якщо studentId має неправильний формат). Але щоб ці помилки правильно відображалися у нашому додатку, потрібно підключити спеціальний middleware errors() від celebrate.
//
// Де саме підключати?
//
// Усі middleware виконуються у порядку, в якому вони оголошені.
// Тому errors() має бути підключений до глобального errorHandler.
// Це потрібно для того, щоб спочатку відловлювались помилки валідації celebrate, а вже потім — усі інші.

// // -------------------------------------
// // src/server.js
// // -------------------------------------
// import express from "express";
// import "dotenv/config";
// import cors from "cors";
// // Імпортуємо middleware
// import { errors } from "celebrate";
// import { connectMongoDB } from "./db/connectMongoDB.js";
// import { logger } from "./middleware/logger.js";
// import { notFoundHandler } from "./middleware/notFoundHandler.js";
// import { errorHandler } from "./middleware/errorHandler.js";
// import studentsRoutes from "./routes/studentsRoutes.js";

// const app = express();
// const PORT = process.env.PORT ?? 3000;

// app.use(logger);
// app.use(express.json());
// app.use(cors());
// app.use(studentsRoutes);

// // обробка 404
// app.use(notFoundHandler);
// // обробка помилок від celebrate (валідація)
// app.use(errors());
// // глобальна обробка інших помилок
// app.use(errorHandler);

// await connectMongoDB();

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// // -------------------------------------
// Якщо не підключити errors() від celebrate, то помилки валідації не будуть коректно оброблятися й ви отримаєте сирі Joi-помилки в консолі
//
// Правильний порядок підключення гарантує, що:
// notFoundHandler ловить відсутні маршрути;
// errors() перехоплює проблеми з валідацією;
// errorHandler закриває все інше.
//

// ==================================================
// ======= Етап 4 - Middleware валідації
// --------------------------------------------------
// === " src/routes/studentsRoutes.js "
//
// Тепер підключимо схему "src/validations/studentsValidation.js"
// у маршруті POST /students ("// src/routes/studentsRoutes.js"), щоб валідація виконувалась автоматично до контролера
// -------------------------------------
// celebrate — це middleware для Express, який обгортає Joi та спрощує валідацію в маршрутах. Він дозволяє перевіряти дані у різних частинах запиту: тіло (body), параметри (params), рядок запиту (query), заголовки (headers), кукі (cookies) тощо.

// Ви описуєте схему валідації (Joi schema) і вказуєте, до якої частини запиту її застосувати.
// celebrate виконує цю валідацію до контролера.
// Якщо дані валідні — запит переходить далі у контролер.
// Якщо ні — автоматично повертається помилка 400 Bad Request з поясненням, що саме не відповідає правилам.
// -------------------------------------
// Використання схеми у маршруті
// -------------------------------------
// Тепер підключимо схему у маршруті POST /students, щоб валідація виконувалась автоматично до контролера:
// -------------------------------------
// // src/routes/studentsRoutes.js
// ------
// import { Router } from 'express';
// import { celebrate, Segments } from 'celebrate';
// import { createStudent } from '../controllers/studentsController.js';
// import { createStudentSchema } from '../validations/studentsValidation.js';

// const router = Router();
// router.post('/students', celebrate(createStudentSchema), createStudent);
// export default router;
// -------------------------------------

// У цьому прикладі celebrate перевіряє тіло запиту за схемою createStudentSchema. Якщо дані некоректні — клієнт одразу отримає 400 Bad Request. Якщо все гаразд — виконається контролер createStudent.
// -------------------------------------
// Як це працює
// -------------------------------------
// У Express маршрут може мати не лише контролер, а й кілька проміжних функцій (middleware). Вони виконуються у тому порядку, в якому ми їх вказали.

// У прикладі вище:
// -------------------------------------
// router.post('/students', celebrate(createStudentSchema), createStudent);
// -------------------------------------
// Спочатку виконується celebrate. Він бере дані з req.body і перевіряє їх за схемою.
// Якщо дані невалідні — повертається помилка 400 Bad Request, і контролер не запускається.
// Якщо дані валідні — виконується наступна функція, тобто контролер createStudent.

// Таким чином, додавання celebrate другим аргументом у маршруті гарантує, що контролер працює лише з перевіреними даними.

// ==================================================
// ======= версія коду 3 - Кастомізація повідомлень про помилки
// --------------------------------------------------
// === " src/validations/studentsValidation.js "
//
// За замовчуванням повідомлення про помилки в Joi можуть бути незручними для користувачів: вони занадто технічні й складні для фронтенду.
// Тому варто робити власні повідомлення, щоб у відповіді віддавати більш зрозумілу інформацію — що саме пішло не так із валідацією. Це полегшує обробку помилок на клієнті й покращує досвід як для розробників, так і для користувачів.
// Ми можемо налаштовувати повідомлення через метод .messages():
// ----------------------------------------------
// src/validations/studentsValidation.js
// ----------------------------------------------
// import { Joi, Segments } from 'celebrate';

// export const createStudentSchema = {
//   [Segments.BODY]: Joi.object({
//     name: Joi.string().min(3).max(30).required().messages({
//       "string.base": "Name must be a string",
//       "string.min": "Name should have at least {#limit} characters",
//       "string.max": "Name should have at most {#limit} characters",
//       "any.required": "Name is required",
//     }),
//     age: Joi.number().integer().min(12).max(65).required().messages({
//       "number.base": "Age must be a number",
//       "number.min": "Age must be at least {#limit}",
//       "number.max": "Age must be at most {#limit}",
//       "any.required": "Age is required",
//     }),
//     gender: Joi.string().valid("male", "female", "other").required().messages({
//       "any.only": "Gender must be one of: male, female, or other",
//       "any.required": "Gender is required",
//     }),
//     avgMark: Joi.number().min(2).max(12).required().messages({
//       "number.base": "Average mark must be a number",
//       "number.min": "Average mark must be at least {#limit}",
//       "number.max": "Average mark must be at most {#limit}",
//       "any.required": "Average mark is required",
//     }),
//     onDuty: Joi.boolean().messages({
//       "boolean.base": "onDuty must be a boolean value",
//     }),
//   }),
// };
// ----------------------------------------------
// У цьому прикладі ми використовуємо метод .messages() для кожного правила в схемі, щоб задати власні повідомлення про помилки.

// Правило string.base стосується .string().
// Правило string.min стосується .min(), яке йде після .string().
// І так далі.

// ==================================================
// ======= версія коду 2 - Використання Segments
// --------------------------------------------------
// === " src/validations/studentsValidation.js "
//
// ----------------------------------------------
// // src/validations/studentsValidation.js
// -------
// import { Joi, Segments } from "celebrate";

// export const createStudentSchema = {
//   [Segments.BODY]: Joi.object({
//     name: Joi.string().min(3).max(30).required(),
//     age: Joi.number().integer().min(12).max(65).required(),
//     gender: Joi.string().valid("male", "female", "other").required(),
//     avgMark: Joi.number().min(2).max(12).required(),
//     onDuty: Joi.boolean(),
//   }),
// };
// ----------------------------------------------
// ======= коментарі 2
// ----------------------------------------------
// Segments — це набір «ключів», які визначають, яку саме частину запиту потрібно перевіряти:
// Segments.BODY → тіло запиту (req.body);
// Segments.PARAMS → параметри маршруту (req.params);
// Segments.QUERY → рядок запиту (req.query);
// Segments.HEADERS → заголовки (req.headers);
// Segments.COOKIES → кукі (req.cookies).
//
// Ми передаємо ці значення як ключі в об’єкті запиту.
// Наприклад, валідація параметра маршруту /notes/:category, де category — динамічний параметр:
// ----------------------------------------------
// {
//   [Segments.PARAMS]: Joi.object({
//     category: Joi.string().valid('work', 'study', 'personal').required(),
//   })
// }
// ----------------------------------------------
// У цьому випадку валідуються параметри маршруту, а саме :category.
// Якщо зробити запит GET /notes/work або GET /notes/personal — він пройде валідацію.
// Якщо ж зробити GET /notes/music — celebrate одразу поверне помилку 400 Bad Request, і контролер не виконається.
//
// ==================================================
// ======= версія коду 1 - Базова схема валідації
// --------------------------------------------------
// === " src/validations/studentsValidation.js "
//
// Визначення схем (Schema definition): ви можете повністю описати схеми для об'єктів, які бажаєте валідувати. Для цього використовуються методи Joi.object() та Joi.array() для структур, а також методи для примітивів (числа, рядки, булеві значення тощо). Схеми є зрозумілими та читаються майже як звичайні правила.
// Список усіх доступних правил є в офіційній документації.
// https://joi.dev/api/?utm_source=chatgpt.com
// -------------------------------------
// Ми описуємо правила для кожного поля. Наприклад, name має бути рядком довжиною від 3 до 30 символів і є обов’язковим.
// -----------------------------------------------
// =====  -1- схема для валідації тіла запиту ====
// -----------------------------------------------
// Приклад схеми для перевірки тіла запиту під час створення нового студента:
// -------------------------------------
// import { Joi } from 'celebrate';
// -------------------------------------
// const bodySchema = Joi.object({
//   name: Joi.string().min(3).max(30).required(),
//   age: Joi.number().integer().min(12).max(65).required(),
//   gender: Joi.string().valid('male', 'female', 'other').required(),
//   avgMark: Joi.number().min(2).max(12).required(),
//   onDuty: Joi.boolean(),
// });
//
// -----------------------------------------------
// =====  -2- Використання Segments ====
// -----------------------------------------------
//
// Далі потрібно визначити, яку саме частину HTTP-запиту ця схема має валідувати. Для цього ми експортуємо схему як об’єкт і через Segments вказуємо, що саме перевіряємо: body, params, query, headers чи cookies.

// Ось так виглядає схема для валідації тіла запиту:
// -------------------------------------
// // src/validations/studentsValidation.js
//
// import { Joi, Segments } from "celebrate";
// export const createStudentSchema = {
//   [Segments.BODY]: Joi.object({
//     name: Joi.string().min(3).max(30).required(),
//     age: Joi.number().integer().min(12).max(65).required(),
//     gender: Joi.string().valid("male", "female", "other").required(),
//     avgMark: Joi.number().min(2).max(12).required(),
//     onDuty: Joi.boolean(),
//   }),
// };
// -------------------------------------
