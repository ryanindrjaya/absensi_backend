const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const authController = require("./auth.controller")
const classesController = require("./classes.cotroller")
const studentController = require("./student.controller")
const subjectController = require("./subject.controller")
const teacherController = require("./teacher.controller")
const lessonScheduleController = require("./lessonSchedule")
const attendanceController = require("./attendance.controller")

router.post("/auth/login", authController.loginUser)
router.post("/auth/register", authController.createUser)
router.get("/auth/userinfo", auth.verifikasi("admin"), authController.readUser)
router.put("/auth/:id", auth.verifikasi("admin"), authController.updateUser)
router.post("/auth/updateprofile", auth.verifikasi("admin"), authController.updateuserinformationdata)
router.post("/auth/updatepassword", auth.verifikasi("admin"), authController.updatepassworddata)
router.delete("/auth/:id", auth.verifikasi("admin"), authController.deleteUser)
router.get("/users", authController.getUsers)

// class
router.post("/class", auth.verifikasi("admin"), classesController.newClassess)
router.get("/class", auth.verifikasi("admin"), classesController.getClass)
router.delete("/class/:id", auth.verifikasi("admin"), classesController.deleteClasses)
router.put("/class/:id", auth.verifikasi("admin"), classesController.editClassess)

// students
router.post("/student", auth.verifikasi("admin"), studentController.newStudents)
router.get("/students", auth.verifikasi("admin"), studentController.getStudent)
router.get("/student/:class_id/:fk_lesson", auth.verifikasi("teacher"), studentController.getStudentByClassId)
router.post("/student/import-excel", auth.verifikasi("admin"), studentController.newStudentsImport)
router.put("/student/:id", auth.verifikasi("admin"), studentController.editStudent)
router.delete("/student/:id", auth.verifikasi("admin"), studentController.deleteStudent)

// subjects
router.post("/subject", auth.verifikasi("admin"), subjectController.newSubject)
router.get("/subjects", auth.verifikasi("admin"), subjectController.getSubject)
router.delete("/subject/:id", auth.verifikasi("admin"), subjectController.deleteSubject)
router.put("/subject/:id", auth.verifikasi("admin"), subjectController.editSubject)

// subjects
router.post("/teacher", auth.verifikasi("admin"), teacherController.newTeacher)
router.get("/teachers", auth.verifikasi("admin"), teacherController.getTeacher)
router.get("/teacher-lesson", auth.verifikasi("teacher"), teacherController.getTeacherByUserId)
router.get("/teacher/:id", auth.verifikasi("admin"), teacherController.getTeacherById)
router.put("/teacher/:id", auth.verifikasi("admin"), teacherController.editTeacher)
router.delete("/teacher/:id", auth.verifikasi("admin"), teacherController.deleteTeacher)

// lesson schedule
router.post("/lesson-schedule", auth.verifikasi("admin"), lessonScheduleController.createLessonSchedule)
router.get("/lesson-schedules", auth.verifikasi(["admin", "teacher"]), lessonScheduleController.getLessonSchedules)
router.get("/lesson-schedules-user", auth.verifikasi("teacher"), lessonScheduleController.getLessonSchedulesByUserId)
router.put("/lesson-schedule/:id", auth.verifikasi("admin"), lessonScheduleController.editLessonSchedule)
router.delete("/lesson-schedule/:id", auth.verifikasi("admin"), lessonScheduleController.deleteLessonSchedule)

// lesson schedule
router.post("/attendance", auth.verifikasi(["admin", "teacher"]), attendanceController.createAttendance)
router.get("/attendances", auth.verifikasi(["admin", "teacher"]), attendanceController.getAttendances)

module.exports = router