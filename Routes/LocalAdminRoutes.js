import express from 'express';

import { verifyToken } from '../utils/jwt.js';

import {
  login,
  register,
  logout,
  verifyTeacher,
  getTeachersBySchool,
  rejectTeacher
} from '../Controllers/LocalAdminController.js';

const LocalAdminRouter = express.Router();

/**
 * @openapi
 * /localadmin/login:
 *   post:
 *     summary: Login for local admin
 *     tags: [LocalAdmin]
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
 *                 designation: { type: string }
 *                 address: { type: string }
 *                 token: { type: string }
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Not Found
 */
LocalAdminRouter.post(
  '/login',
  login
);

/**
 * @openapi
 * /localadmin/register:
 *   put:
 *     summary: Register a new local admin
 *     tags: [LocalAdmin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber, name, emailId, institution, password, birthdate, gender, designation, address]
 *             properties:
 *               phoneNumber: { type: string }
 *               name: { type: string }
 *               emailId: { type: string }
 *               institution: { type: string }
 *               password: { type: string }
 *               birthdate: { type: string, format: date }
 *               gender: { type: string }
 *               designation: { type: string }
 *               address: { type: string }
 *     responses:
 *       201:
 *         description: Local admin registered successfully
 *       400:
 *         description: Invalid data
 *       409:
 *         description: Phone number already exists
 *       500:
 *         description: Internal Server Error
 */
LocalAdminRouter.put(
  '/register',
  register
);

/**
 * @openapi
 * /localadmin/verifyTeacher/{id}:
 *   post:
 *     summary: Verify a teacher by ID
 *     tags: [LocalAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the teacher to verify
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Teacher verified successfully
 *       404:
 *         description: Teacher Not Found
 *       500:
 *         description: Internal Server Error
 */
LocalAdminRouter.post(
  '/verifyTeacher/:id',
  verifyToken,
  verifyTeacher
);

/**
 * @openapi
 * /localadmin/rejectTeacher/{id}:
 *   post:
 *     summary: Reject a teacher by ID
 *     tags: [LocalAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the teacher to reject
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Teacher application rejected
 *       404:
 *         description: Teacher Not Found
 *       500:
 *         description: Internal Server Error
 */
LocalAdminRouter.post(
  '/rejectTeacher/:id',
  verifyToken,
  rejectTeacher
);

/**
 * @openapi
 * /localadmin/getTeachers:
 *   post:
 *     summary: Get all teachers by school
 *     tags: [LocalAdmin]
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
 *         description: Teachers retrieved successfully
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
LocalAdminRouter.post(
  '/getTeachers',
  verifyToken,
  getTeachersBySchool
);

/**
 * @openapi
 * /localadmin/logout/{id}:
 *   post:
 *     summary: Logout a local admin
 *     tags: [LocalAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the local admin logging out
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
 *         description: Local admin logged out successfully
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
LocalAdminRouter.post(
  '/logout/:id',
  logout
);

export default LocalAdminRouter;
