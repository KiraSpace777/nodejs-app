// src/routes/studentsRoutes.js
// ------------------------------------
// Роутер для студентів
//
// + celebrate // підключимо схему "createStudentSchema" з "src/validations/studentsValidation.js" (Middleware для валідації на сервері введених користувачем даних) у маршруті POST /students, щоб валідація виконувалась автоматично до контролера
// + celebrate // підключимо middleware errors() від celebrate
// + celebrate // (6) Валідація ідентифікатора objectIdValidator (string, hex, 24 symbols = 12 байт у двійковому представленні)
// + celebrate // (7) Валідація для PATCH (updateStudentSchema)
// + celebrate // (8) Валідація + пагінація для GET, всі студенти (getStudentsSchema)

import { Router } from 'express';
import { celebrate } from 'celebrate'; // підключення celebrate (middleware валідації для Express)

import {
  getStudents,
  getStudentById,
  createStudent,
  deleteStudent,
  updateStudent,
} from '../controllers/studentsController.js';

import {
  createStudentSchema,
  studentIdParamSchema,
  updateStudentSchema,
  getStudentsSchema,
} from '../validations/studentsValidation.js'; // підключення celebrate (middleware валідації для Express)

const router = Router();

// router.get('/students', getStudents);
// (8)-studentsValidation.js, підключення celebrate (middleware валідація)
router.get('/students', celebrate(getStudentsSchema), getStudents);
// router.get('/students/:studentId', getStudentById);
// (6)-studentsValidation.js, підключення celebrate (middleware валідація)
router.get(
  '/students/:studentId',
  celebrate(studentIdParamSchema),
  getStudentById,
);
// router.post('/students', createStudent);
// (1-5)-studentsValidation.js, підключення celebrate (middleware валідація)
router.post('/students', celebrate(createStudentSchema), createStudent);
// router.delete('/students/:studentId', deleteStudent);
// (6)-studentsValidation.js, підключення celebrate (middleware валідація)
router.delete(
  '/students/:studentId',
  celebrate(studentIdParamSchema),
  deleteStudent,
);
// router.patch('/students/:studentId', updateStudent);
// (7)-studentsValidation.js, підключення celebrate (middleware валідація)
router.patch(
  '/students/:studentId',
  celebrate(updateStudentSchema),
  updateStudent,
);

export default router;

// =========================================================================
// ======== Модуль 3 (підключення celebrate) =======
// -------------------------------------------------------------------------
// celebrate — це middleware для Express, який обгортає Joi та спрощує валідацію в маршрутах. Він дозволяє перевіряти дані у різних частинах запиту: тіло (body), параметри (params), рядок запиту (query), заголовки (headers), кукі (cookies) тощо.
//
// Ви описуєте схему валідації (Joi schema) і вказуєте, до якої частини запиту її застосувати.
// celebrate виконує цю валідацію до контролера.
// Якщо дані валідні — запит переходить далі у контролер.
// Якщо ні — автоматично повертається помилка 400 Bad Request з поясненням, що саме не відповідає правилам.
//
// Тепер підключимо схему "src/validations/studentsValidation.js"
// у маршруті POST /students (// src/routes/studentsRoutes.js), щоб валідація виконувалась автоматично до контролера:
//
// // ------------------------------------
// // src/routes/studentsRoutes.js
// // ------------------------------------
// import { Router } from 'express';
// import { celebrate, Segments } from 'celebrate';
// import { createStudent } from '../controllers/studentsController.js';
// import { createStudentSchema } from '../validations/studentsValidation.js';

// const router = Router();
// router.post('/students', celebrate(createStudentSchema), createStudent);
// export default router;
// // ------------------------------------
//
// У цьому прикладі celebrate перевіряє тіло запиту за схемою createStudentSchema. Якщо дані некоректні — клієнт одразу отримає 400 Bad Request. Якщо все гаразд — виконається контролер createStudent.
//
// -------------------------------------------------------------------------
// Валідація ідентифікатора
// -------------------------------------------------------------------------
// У MongoDB кожен документ має унікальний ідентифікатор у полі _id. Це ObjectId, який має строго визначений формат:

// завжди рядок у шістнадцятковому (hex) вигляді;
// довжина — рівно 24 символи (12 байт у двійковому представленні);
// автоматично генерується MongoDB при створенні документа.

// ------------------------------------
// Функція objectIdValidator
// ------------------------------------
// Створимо кастомний валідатор для Joi, який перевірятиме значення на валідність ObjectId.
// // ------------------------------------
// // src/validations/studentsValidation.js
// // ------------------------------------
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
// ------------------------------------
// isValidObjectId(value) — це утиліта з Mongoose, яка перевіряє, чи рядок відповідає формату MongoDB ObjectId.
// Якщо isValidObjectId повертає false, ми викликаємо helpers.message('Invalid id format'), щоб створити помилку в Joi.
// Якщо все гаразд, функція просто повертає значення далі.

// Таким чином, ми отримуємо зрозумілу помилку для клієнта замість технічної MongoDB-помилки.
// ------------------------------------
// Використання у маршрутах
// ------------------------------------
// Додамо схему у маршрут /students/:studentId, щоб celebrate автоматично перевіряв параметр studentId:
// // ------------------------------------
// // src/routes/studentsRoutes.js
// // ------------------------------------
// import { Router } from 'express';
// import { celebrate } from 'celebrate';

// import { getStudentById, deleteStudent } from '../controllers/studentsController.js';
// import { studentIdParamSchema } from '../validations/studentsValidation.js';

// const router = Router();

// router.get('/students/:studentId', celebrate(studentIdParamSchema), getStudentById);
// router.delete('/students/:studentId', celebrate(studentIdParamSchema), deleteStudent);

// export default router;
// ------------------------------------
// Ми використовуємо одну й ту саму схему для обох маршрутів:
// GET /students/:studentId — отримання студента за id;
// DELETE /students/:studentId — видалення студента за id.
// Це дозволяє уникнути дублювання коду й зберігати валідацію в одному місці.

// Тепер:
// Якщо id валідний → виконується контролер.
// Якщо id невалідний → celebrate одразу повертає 400 Bad Request з повідомленням "Invalid id format".

// =========================================================================
// ======== Код з попереднього модуля № 2 (до підключення celebrate) =======
// -------------------------------------------------------------------------
// // src/routes/studentsRoutes.js
// // ------------------------------------
// // Роутер для студентів

// import { Router } from 'express';
// import {
//   getStudents,
//   getStudentById,
//   createStudent,
//   deleteStudent,
//   updateStudent,
// } from '../controllers/studentsController.js';

// const router = Router();

// router.get('/students', getStudents);
// router.get('/students/:studentId', getStudentById);
// router.post('/students', createStudent);
// router.delete('/students/:studentId', deleteStudent);
// router.patch('/students/:studentId', updateStudent);

// export default router;
// ===============================================
// Роутер для студентів
// src/routes/studentsRoutes.js
// ===============================================
// Тут оголошуємо роутер і одразу експортуємо його. Це «порожня рамка», у яку додамо маршрути.
// Далі переносимо контролери, які обробляють маршрути /students та /students/:studentId із файла server.js у файл роутингу studentsRoutes.js. Для їх оголошення замість app використовуємо створений router
// ------------------------------------
// Підключаємо роутер
// Тепер імпортуємо створений роутер у файл server.js та додаємо його як middleware до app, за допомогою методу app.use().
// ------------------------------------
// Створюємо контролери
// Створіть папку src/controllers, а в ній файл studentsController.js. У цей файл винесемо контролери, які зараз знаходяться у файлі studentsRoutes.js
// -----------------------------------------------
// Використовуємо контролери у роутері
// Тепер оновимо файл src/routes/studentsRoutes.js, щоб замість логіки напряму викликати контролери.
// -----------------------------------------------
// Ми винесли контролери в окремий файл і тепер маршрути виглядають більш чисто. Така організація дозволяє:
// відокремити логіку обробки запитів від опису маршрутів;
// полегшити підтримку та рефакторинг коду;
// підготувати ґрунт для подальшої роботи (наприклад, додавання нових методів чи валідації).

// ===============================================
// Роут POST запиту
// ===============================================
// Додаємо можливість створювати нового студента до колекції за маршрутом POST /students. У запиті будемо очікувати тіло запиту, яке приходитиме як JSON.
// -----------------------------------------------
// Контролер
//
// Дописуємо контролер у файл src/controllers/studentsController.js. Він читає дані з req.body і створює документ через Student.create(...). Для запитів, які щось створюють, семантично правильно відправляти відповідь зі статус-кодом 201 Created.
// src/controllers/studentsController.js
// -------------------------------
// Роут
//
// ДАЛІ ми підключаємо контролер у маршрутизатор студентів у файлі:
// src/routes/studentsRoutes.js
// -------------------------------
// ===============================================
// Роут DELETE запиту
// ===============================================
// Додаємо маршрут DELETE /students/:studentId, за допомогою якого користувачі зможуть видаляти студентів з бази даних.
// -------------------------------
// Контролер
// -------------------------------
// Для видалення документа з колекції в Mongoose використовується метод:
// findOneAndDelete(filter, options)
// де:
// filter — перший аргумент, який вказує на умову пошуку документа для видалення (обов’язковий);
// options — об’єкт із додатковими налаштуваннями (необов’язковий);
// У контролері отримуємо studentId із параметрів, видаляємо студента через Mongoose-метод findOneAndDelete, і якщо такого не існує — повертаємо помилку 404. Якщо все добре — повертаємо 200 Success.
// -------------------------------
// Роут
// -------------------------------
// Додаємо DELETE-роут /students/:studentId та підключаємо контролер
//
// ===============================================
// Роут PATCH запиту
// ===============================================
// Додаємо маршрут PATCH /students/:studentId, за допомогою якого користувачі зможуть частково оновлювати дані студентів у базі даних. Від PUT метод PATCH відрізняється тим, що оновлюється не весь ресурс, а лише окремі його поля
// -------------------------------
// Метод Mongoose
// -------------------------------
// Для оновлення документа в Mongoose використовується метод:
// findOneAndUpdate(query, update, options)
// де:
// query — об’єкт умов пошуку документа (обов’язковий);
// update — об’єкт із даними для оновлення (обов’язковий);
// options — об’єкт додаткових налаштувань (необов’язковий), наприклад:
// returnDocument: "after" — повернути оновлений документ;
// includeResultMetadata: true — додати метадані результату;
// upsert: true — створити документ, якщо не знайдено (для PATCH зазвичай не використовуємо).
// -------------------------------
// Контролер
// -------------------------------
// У контролері беремо studentId з параметрів, req.body — дані для часткового оновлення. Якщо студента не знайдено — повертаємо 404. Якщо все добре — повертаємо 200 і оновлений документ.
// src/controllers/studentsController.js
// -------------------------------
// Роут
// -------------------------------
// Підключаємо контролер у маршрутизатор студентів:
// src/routes/studentsRoutes.js
