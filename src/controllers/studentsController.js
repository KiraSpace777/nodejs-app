// src/controllers/studentsController.js
// =====================================================

import { Student } from '../models/student.js';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';

// Маршрут GET /students : отримати всіх студентів
// -----------------------------------------------
export const getStudents = async (req, res) => {
  const students = await Student.find();
  res.status(200).json(students);
};

// Маршрут GET /students/:studentId: отримати одного студента за id
// -----------------------------------------------
export const getStudentById = async (req, res) => {
  const { studentId } = req.params;
  const student = await Student.findById(studentId);

  // Додаємо базову обробку помилки замість обробника res.status(404)
  // та throw new Error(), через пакет http-errors та функцію createHttpError () у файлі // src/controllers/studentsController.js
  // оновимо відповідно і файл "// src/middleware/errorHandler.js"
  // -------------------------------------------------
  if (!student) {
    throw createHttpError(404, 'Student not found');
  }

  res.status(200).json(student);
};

// СТВОРЕННЯ елементу по схемі Student / для запитів, які щось створюють, відповідь зі статус-кодом 201 Created
export const createStudent = async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json(student);
};

// Роут DELETE запиту
// ------------------------------------
// Додаємо маршрут DELETE /students/:studentId (файл: // src/routes/studentsRoutes.js). Для видалення документа з колекції в Mongoose використовується метод (в контролерах): findOneAndDelete(filter, options), файл: // src/controllers/studentsController.js
// ------------------------------------
export const deleteStudent = async (req, res) => {
  const { studentId } = req.params;
  const student = await Student.findOneAndDelete({
    _id: studentId,
  });

  if (!student) {
    throw createHttpError(404, 'Student not found');
  }

  res.status(200).json(student);
};

// Роут PATCH запиту (оновлення)
// ------------------------------------
// У контролері беремо studentId з параметрів, req.body — дані для часткового оновлення. Якщо студента не знайдено — повертаємо 404. Якщо все добре — повертаємо 200 і оновлений документ.
// ------------------------------------
// export const updateStudent = async (req, res) => {
//   const { studentId } = req.params;

//   const student = await Student.findOneAndUpdate(
//     { _id: studentId }, // Шукаємо по id
//     req.body,
//     { returnDocument: 'after' }, // повертаємо оновлений документ
//   );

//   if (!student) {
//     throw createHttpError(404, 'Student not found');
//   }

//   res.status(200).json(student);
// };
// -------------------------------------------
// оновлений код, для контролю довжини коду ИД
// -------------------------------------------
export const updateStudent = async (req, res) => {
  const { studentId } = req.params;

  // УМОВА 1: Перевіряємо, чи є ID валідним для MongoDB (має бути рівно 24 символи)
  // Якщо формат невалідний, ми перехоплюємо помилку ДО запиту в базу даних, щоб уникнути помилки 500
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw createHttpError(
      404,
      `The ID code (string length) is incorrect. The specified string length [${studentId.length}] is less than the database standard [24]`,
    );
  }

  // Якщо ID валідний за форматом, виконуємо оновлення в базі даних
  const student = await Student.findOneAndUpdate(
    { _id: studentId }, // Шукаємо студента за цим ID
    req.body, // Дані з тіла запиту для часткового оновлення
    { returnDocument: 'after' }, // Повертаємо вже оновлений документ, а не старий
  );

  // УМОВА 2: Якщо формат ID правильний, але такого студента взагалі немає в базі даних
  if (!student) {
    throw createHttpError(404, 'Student not found');
  }

  // Якщо все добре — повертаємо статус 200 та оновлені дані студента
  res.status(200).json(student);
};

// ======================= COMMENTS ==============================
// -----------------------------------------------
// Створюємо контролери
// Створіть папку src/controllers, а в ній файл studentsController.js. У цей файл винесемо контролери, які зараз знаходяться у файлі studentsRoutes.js
// -----------------------------------------------
// Використовуємо контролери у роутері
// Тепер оновимо файл src/routes/studentsRoutes.js, щоб замість логіки напряму викликати контролери.
// -----------------------------------------------
// Роут POST запиту
// -----------------------------------------------
// Додаємо можливість створювати нового студента до колекції за маршрутом POST /students. У запиті будемо очікувати тіло запиту, яке приходитиме як JSON.
// -----------------------------------------------
// Контролер
//
// Дописуємо контролер у файл src/controllers/studentsController.js. Він читає дані з req.body і створює документ через Student.create(...). Для запитів, які щось створюють, семантично правильно відправляти відповідь зі статус-кодом 201 Created.
// src/controllers/studentsController.js
// -------------------------------
// import { Student } from '../models/student.js';

// // Решта контролерів

// // Новий контролер
// export const createStudent = async (req, res) => {
//   const student = await Student.create(req.body);
//   res.status(201).json(student);
// };
// -------------------------------
// Роут
//
// ДАЛІ ми підключаємо контролер у маршрутизатор студентів у файлі:
// src/routes/studentsRoutes.js
// =================================================================
//

// ======================= START CODE ==============================
// // src/controllers/studentsController.js
// // -----------------------------------------------

// import { Student } from '../models/student.js';

// // Маршрут GET /students : отримати всіх студентів
// // -----------------------------------------------
// // У цьому маршруті ми будемо звертатися до колекції students через вбудований метод Mongoose Student.find(), який повертає масив документів (може бути порожнім), що відповідають моделі Student.
// // -----------------------------------------------
// export const getStudents = async (req, res) => {
//   const students = await Student.find();
//   res.status(200).json(students);
// };

// // Маршрут GET /students/:studentId: отримати одного студента за id
// // -----------------------------------------------
// // Для цього маршруту ми використаємо вбудований метод Mongoose Student.findById(). Якщо документ із заданим ідентифікатором не буде знайдено, метод поверне null. У такому випадку ми повернемо статус 404.
// // Властивість params на об’єкті запиту req містить динамічні параметри маршруту. Кожне ім’я параметра відповідає властивості цього об’єкта, а значення, передане в URL, стає значенням цієї властивості.
// // -----------------------------------------------
// export const getStudentById = async (req, res) => {
//   const { studentId } = req.params;
//   const student = await Student.findById(studentId);

//   // Код що був до цього
//   //  if (!student) {
//   //    return res.status(404).json({ message: 'Student not found' });
//   //  }

//   // Додаємо базову обробку помилки замість res.status(404), рефакторинг обробки помилок через єдиний файл "errorHandler"
//   // Виклик throw new Error() передає управління нашій error middleware і припиняє виконання коду поточної функції.
//   // -----------------------------------------------
//   if (!student) {
//     throw new Error('Student not found');
//   }

//   res.status(200).json(student);
// };
