import express from 'express'
import { verifyToken } from '../utils/jwt.js'
import { login, register, logout, verifyTeacher, getTeachersBySchool, rejectTeacher } from '../Controllers/LocalAdminController.js'

const LocalAdminRouter = express.Router()

// login and Register
LocalAdminRouter.post('/login', login)
LocalAdminRouter.put('/register', register)

// requires Login and jwt middleware
LocalAdminRouter.post('/verifyTeacher/:id', verifyToken, verifyTeacher)
LocalAdminRouter.post('/rejectTeacher/:id', verifyToken, rejectTeacher)
LocalAdminRouter.post('/getTeachers', verifyToken, getTeachersBySchool)

// requires logged in
LocalAdminRouter.post('/logout/:id', logout)

export default LocalAdminRouter
