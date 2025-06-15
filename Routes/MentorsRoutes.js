import express from 'express'
import { verifyToken } from '../utils/jwt.js'
import { login, register, logout, editDetails } from '../Controllers/MentorsController.js'

const MentorRouter = express.Router()

// login and Register
MentorRouter.post('/login', login)
MentorRouter.put('/register', register)

// requires Login and jwt middleware
MentorRouter.post('/editDetails/:id', verifyToken, editDetails)

// requires logged in
MentorRouter.post('/logout/:id', logout)

export default MentorRouter
