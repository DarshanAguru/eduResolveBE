import express from 'express'
import { addMessage, addReply, getAllMessages, getMessageThread, getAllMessagesBySchool, upvote, downvote, reportMessage, uploadFile, getImage } from '../Controllers/MessagesController.js'
import { verifyToken } from '../utils/jwt.js'
import multer from 'multer'

const MessagesRouter = express.Router()

// required JWT token
MessagesRouter.post('/getallmessages', verifyToken, getAllMessages)
MessagesRouter.post('/getmessage/:id', verifyToken, getMessageThread)
MessagesRouter.put('/addmessage/:id', verifyToken, addMessage)
MessagesRouter.put('/addreply/:id', verifyToken, addReply)
MessagesRouter.post('/getmessagesbyschool', verifyToken, getAllMessagesBySchool)
MessagesRouter.post('/upvote/:id', verifyToken, upvote)
MessagesRouter.post('/downvote/:id', verifyToken, downvote)
MessagesRouter.post('/report/:id', verifyToken, reportMessage)

// handle Images
const storage = multer.memoryStorage()
const upload = multer({ storage })
MessagesRouter.put('/uploadImg', upload.single('filee'), verifyToken, uploadFile)

MessagesRouter.get('/getImage/:key', getImage)

export default MessagesRouter
