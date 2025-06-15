import express from 'express'
import { verifyToken } from '../utils/jwt.js'
import { login, register, logout, postAssignment, getStudentsBySchool, getAllAssignmentsOfTeacher, getAllSchools, getAllAssignmentsBySchoolAndGradeAndSubject, getAllNotifications, clearNotification, editDetails, getAssignment, deleteAssignment, getAssignmentSubmissions } from '../Controllers/TeachersController.js'

const TeacherRouter = express.Router()

// login and Register
TeacherRouter.post('/login', login)
TeacherRouter.put('/register', register)

// requires Login and jwt middleware
TeacherRouter.patch('/editDetails/:id', verifyToken, editDetails)
TeacherRouter.put('/postassignment/:id', verifyToken, postAssignment)
TeacherRouter.post('/getAssignment/:id', verifyToken, getAssignment)
TeacherRouter.post('/getAllassignments', verifyToken, getAllAssignmentsBySchoolAndGradeAndSubject)
TeacherRouter.post('/getAllStudents', verifyToken, getStudentsBySchool)
TeacherRouter.post('/getassignments/:id', verifyToken, getAllAssignmentsOfTeacher)
TeacherRouter.post('/getAssignmentSubmission/:id', verifyToken, getAssignmentSubmissions)
TeacherRouter.delete('/deleteAssignment/:id', verifyToken, deleteAssignment)
TeacherRouter.post('/getAllNotifications/:id', verifyToken, getAllNotifications)
TeacherRouter.post('/clearNotification/:id', verifyToken, clearNotification)

// requires logged in
TeacherRouter.post('/getAllSchools', getAllSchools)
TeacherRouter.post('/logout/:id', logout)

export default TeacherRouter
