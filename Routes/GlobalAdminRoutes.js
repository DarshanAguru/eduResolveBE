import express from 'express';

import { verifyToken } from '../utils/jwt.js';

import {
  login,
  register,
  logout,
  verifyLocalAdmin,
  verifyMentor,
  getAllMentors,
  getAllLocalAdmins,
  rejectLocalAdmin,
  rejectMentor
} from '../Controllers/GlobalAdminController.js';

const GlobalAdminRouter = express.Router();

/**
 * @openapi
 * /globaladmin/login:
 *   post:
 *     summary: Login for global admin
 *     tags: [GlobalAdmin]
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
 *                 token: { type: string }
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Not Found
 */
GlobalAdminRouter.post(
  '/login',
  login
);

/**
 * @openapi
 * /globaladmin/register:
 *   put:
 *     summary: Register a new global admin
 *     tags: [GlobalAdmin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber, name, emailId, password, birthdate, gender]
 *             properties:
 *               phoneNumber: { type: string }
 *               name: { type: string }
 *               emailId: { type: string }
 *               password: { type: string }
 *               birthdate: { type: string, format: date }
 *               gender: { type: string }
 *     responses:
 *       201:
 *         description: Global admin registered successfully
 *       400:
 *         description: Invalid data
 *       409:
 *         description: Phone number already exists
 *       500:
 *         description: Internal Server Error
 */
GlobalAdminRouter.put(
  '/register',
  register
);

/**
 * @openapi
 * /globaladmin/verifyMentor/{id}:
 *   post:
 *     summary: Verify a mentor by ID
 *     tags: [GlobalAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the mentor to verify
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mentor verified successfully
 *       404:
 *         description: Mentor Not Found
 *       500:
 *         description: Internal Server Error
 */
GlobalAdminRouter.post(
  '/verifyMentor/:id',
  verifyToken,
  verifyMentor
);

/**
 * @openapi
 * /globaladmin/verifyLocalAdmin/{id}:
 *   post:
 *     summary: Verify a local admin by ID
 *     tags: [GlobalAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the local admin to verify
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Local admin verified successfully
 *       404:
 *         description: Local Admin Not Found
 *       500:
 *         description: Internal Server Error
 */
GlobalAdminRouter.post(
  '/verifyLocalAdmin/:id',
  verifyToken,
  verifyLocalAdmin
);

/**
 * @openapi
 * /globaladmin/rejectMentor/{id}:
 *   post:
 *     summary: Reject a mentor by ID
 *     tags: [GlobalAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the mentor to reject
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mentor application rejected
 *       404:
 *         description: Mentor Not Found
 *       500:
 *         description: Internal Server Error
 */
GlobalAdminRouter.post(
  '/rejectMentor/:id',
  verifyToken,
  rejectMentor
);

/**
 * @openapi
 * /globaladmin/rejectLocalAdmin/{id}:
 *   post:
 *     summary: Reject a local admin by ID
 *     tags: [GlobalAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the local admin to reject
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Local admin application rejected
 *       404:
 *         description: Local Admin Not Found
 *       500:
 *         description: Internal Server Error
 */
GlobalAdminRouter.post(
  '/rejectLocalAdmin/:id',
  verifyToken,
  rejectLocalAdmin
);

/**
 * @openapi
 * /globaladmin/getAllMentors:
 *   post:
 *     summary: Get all mentors
 *     tags: [GlobalAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mentors retrieved successfully
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
GlobalAdminRouter.post(
  '/getAllMentors',
  verifyToken,
  getAllMentors
);

/**
 * @openapi
 * /globaladmin/getAllLocalAdmins:
 *   post:
 *     summary: Get all local admins
 *     tags: [GlobalAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Local admins retrieved successfully
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
GlobalAdminRouter.post(
  '/getAllLocalAdmins',
  verifyToken,
  getAllLocalAdmins
);

/**
 * @openapi
 * /globaladmin/logout/{id}:
 *   post:
 *     summary: Logout a global admin
 *     tags: [GlobalAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the global admin logging out
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
 *         description: Global admin logged out successfully
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
GlobalAdminRouter.post(
  '/logout/:id',
  logout
);

export default GlobalAdminRouter;
