import express from 'express'
import { verifyToken } from '../utils/jwt.js'
import { login, register, logout, submitAssignment, getAllMessagesOfStudent, getAllSchools, getAllAssignmentsBySchoolAndGradeAndSubject, clearNotification, getAllNotifications, editDetails, getAssignment, getAssignmentScoreAndData, getAllAssignmentsForClass } from '../Controllers/StudentController.js'

const StudentRouter = express.Router()

// login and Register
StudentRouter.post('/login', login)
StudentRouter.put('/register', register)

// requires Login and jwt middleware
StudentRouter.patch('/editDetails/:id', verifyToken, editDetails)
StudentRouter.post('/getAssignment/:id', verifyToken, getAssignment)
StudentRouter.put('/submitassignment/:id', verifyToken, submitAssignment)
StudentRouter.post('/getAllAssignmentsForClass', verifyToken, getAllAssignmentsForClass)
StudentRouter.post('/getallassignments', verifyToken, getAllAssignmentsBySchoolAndGradeAndSubject)
StudentRouter.post('/getAssignmentScoreAndData/:id', verifyToken, getAssignmentScoreAndData)
StudentRouter.post('/getmessages/:id', verifyToken, getAllMessagesOfStudent)
StudentRouter.post('/getAllNotifications/:id', verifyToken, getAllNotifications)
StudentRouter.post('/clearNotification/:id', verifyToken, clearNotification)

// requires logged in
StudentRouter.post('/getAllSchools', getAllSchools)
StudentRouter.post('/logout/:id', logout)

export default StudentRouter
