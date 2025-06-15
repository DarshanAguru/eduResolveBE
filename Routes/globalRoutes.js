import express from 'express'
import { forgotPassword } from '../Controllers/GlobalRouteController.js'

const globalRouter = express.Router()

globalRouter.post('/forgotPassword', forgotPassword)

export default globalRouter
