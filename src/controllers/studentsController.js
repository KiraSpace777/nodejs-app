// src/controllers/studentsController.js
// -----------------------------------------------

import { Student } from '../models/student.js';
import createHttpError from 'http-errors';

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
  // та throw new Error(), через пакет http-errors та функцію createHttpError ()
  // оновимо відповідно і файл "// src/middleware/errorHandler.js"
  // -------------------------------------------------
  if (!student) {
    throw createHttpError(404, 'Student not found');
  }

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
