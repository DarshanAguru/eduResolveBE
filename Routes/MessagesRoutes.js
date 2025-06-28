import express from 'express';
import {
  addMessage,
  addReply,
  getAllMessages,
  getMessageThread,
  getAllMessagesBySchool,
  upvote,
  downvote,
  reportMessage,
  uploadFile,
  getImage
} from '../Controllers/MessagesController.js';

import { verifyToken } from '../utils/jwt.js';
import multer from 'multer';

const MessagesRouter = express.Router();

/**
 * @openapi
 * /messages/getallmessages:
 *   post:
 *     summary: Get all messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All messages retrieved successfully
 *       404:
 *         description: Messages not found
 */
MessagesRouter.post(
  '/getallmessages',
  verifyToken,
  getAllMessages
);

/**
 * @openapi
 * /messages/getmessage/{id}:
 *   post:
 *     summary: Get a message thread by ID
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The message thread ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message thread retrieved successfully
 *       404:
 *         description: Message Not found
 */
MessagesRouter.post(
  '/getmessage/:id',
  verifyToken,
  getMessageThread
);

/**
 * @openapi
 * /messages/addmessage/{id}:
 *   put:
 *     summary: Add a new message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The message ID (studentId@timestamp)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [school, messageData, gender, name]
 *             properties:
 *               school: { type: string }
 *               messageData: { type: string }
 *               gender: { type: string }
 *               name: { type: string }
 *               imageLink: { type: string }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Message Saved
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
MessagesRouter.put(
  '/addmessage/:id',
  verifyToken,
  addMessage
);

/**
 * @openapi
 * /messages/addreply/{id}:
 *   put:
 *     summary: Add a reply to a message thread
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The message thread ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [senderId, senderType, senderName, message]
 *             properties:
 *               senderId: { type: string }
 *               senderType: { type: string, enum: [students, teachers, mentors] }
 *               senderName: { type: string }
 *               senderGender: { type: string }
 *               message: { type: string }
 *               imageLink: { type: string }
 *     responses:
 *       201:
 *         description: Reply added
 *       404:
 *         description: Message Not Found
 *       500:
 *         description: Internal Server Error
 */
MessagesRouter.put(
  '/addreply/:id',
  verifyToken,
  addReply
);

/**
 * @openapi
 * /messages/getmessagesbyschool:
 *   post:
 *     summary: Get all messages by school
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [school]
 *             properties:
 *               school: { type: string }
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       404:
 *         description: Not Found
 */
MessagesRouter.post(
  '/getmessagesbyschool',
  verifyToken,
  getAllMessagesBySchool
);

/**
 * @openapi
 * /messages/upvote/{id}:
 *   post:
 *     summary: Upvote a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The message thread ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       200:
 *         description: Upvote processed
 *       404:
 *         description: Not Found
 */
MessagesRouter.post(
  '/upvote/:id',
  verifyToken,
  upvote
);

/**
 * @openapi
 * /messages/downvote/{id}:
 *   post:
 *     summary: Downvote a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The message thread ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       200:
 *         description: Downvote processed
 *       404:
 *         description: Not Found
 */
MessagesRouter.post(
  '/downvote/:id',
  verifyToken,
  downvote
);

/**
 * @openapi
 * /messages/report/{id}:
 *   post:
 *     summary: Report a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The message thread ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       200:
 *         description: Report processed
 *       404:
 *         description: Not Found
 */
MessagesRouter.post(
  '/report/:id',
  verifyToken,
  reportMessage
);

// handle Images
const storage = multer.memoryStorage();

const upload = multer({
  storage
});

/**
 * @openapi
 * /messages/uploadImg:
 *   put:
 *     summary: Upload an image for a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [filee, id]
 *             properties:
 *               filee:
 *                 type: string
 *                 format: binary
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file type/size
 *       500:
 *         description: Internal Server Error
 */
MessagesRouter.put(
  '/uploadImg',
  upload.single('filee'),
  verifyToken,
  uploadFile
);

/**
 * @openapi
 * /messages/getImage/{key}:
 *   get:
 *     summary: Get an uploaded image by key
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: The base64-encoded image key
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image retrieved successfully
 *       404:
 *         description: Not Found
 */
MessagesRouter.get(
  '/getImage/:key',
  getImage
);

export default MessagesRouter;
