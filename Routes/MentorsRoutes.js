import express from 'express';

import { verifyToken } from '../utils/jwt.js';

import {
  login,
  register,
  logout,
  editDetails
} from '../Controllers/MentorsController.js';

const MentorRouter = express.Router();

/**
 * @openapi
 * /mentors/login:
 *   post:
 *     summary: Login for mentors
 *     tags: [Mentors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber, password]
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id: { type: string }
 *                 phoneNumber: { type: string }
 *                 name: { type: string }
 *                 emailId: { type: string }
 *                 age: { type: integer }
 *                 gender: { type: string }
 *                 institution: { type: string }
 *                 qualification: { type: string }
 *                 subjectExpertise: { type: string }
 *                 description: { type: string }
 *                 resumeLink: { type: string }
 *                 token: { type: string }
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Not Found
 */
MentorRouter.post(
  '/login',
  login
);

/**
 * @openapi
 * /mentors/register:
 *   put:
 *     summary: Register a new mentor
 *     tags: [Mentors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber, name, emailId, password, birthdate, gender, description, subjectExpertise, qualification, resumeLink, institution]
 *             properties:
 *               phoneNumber: { type: string }
 *               name: { type: string }
 *               emailId: { type: string }
 *               password: { type: string }
 *               birthdate: { type: string, format: date }
 *               gender: { type: string }
 *               description: { type: string }
 *               subjectExpertise: { type: string }
 *               qualification: { type: string }
 *               resumeLink: { type: string }
 *               institution: { type: string }
 *     responses:
 *       201:
 *         description: Mentor registered successfully
 *       500:
 *         description: Internal Server Error
 */
MentorRouter.put(
  '/register',
  register
);

/**
 * @openapi
 * /mentors/editDetails/{id}:
 *   post:
 *     summary: Edit mentor details
 *     tags: [Mentors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the mentor to edit
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               age: { type: integer }
 *               institution: { type: string }
 *               gender: { type: string }
 *               qualification: { type: string }
 *               subjectExpertise: { type: string }
 *               resumeLink: { type: string }
 *     responses:
 *       200:
 *         description: Mentor details updated successfully
 *       404:
 *         description: Mentor not found
 *       500:
 *         description: Internal Server Error
 */
MentorRouter.post(
  '/editDetails/:id',
  verifyToken,
  editDetails
);

/**
 * @openapi
 * /mentors/logout/{id}:
 *   post:
 *     summary: Logout a mentor
 *     tags: [Mentors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the mentor logging out
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: Mentor logged out successfully
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
MentorRouter.post(
  '/logout/:id',
  logout
);

export default MentorRouter;
