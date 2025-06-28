import express from 'express';
import { verifyToken } from '../utils/jwt.js';
import { login,
    register,
    logout,
    submitAssignment,
    getAllMessagesOfStudent,
    getAllSchools,
    getAllAssignmentsBySchoolAndGradeAndSubject,
    clearNotification,
    getAllNotifications,
    editDetails,
    getAssignment,
    getAssignmentScoreAndData,
    getAllAssignmentsForClass
} from '../Controllers/StudentController.js';

const StudentRouter = express.Router();

/**
 * @openapi
 * /students/login:
 *   post:
 *     summary: Login for students
 *     tags: [Students]
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
 *                 school: { type: string }
 *                 grade: { type: string }
 *                 token: { type: string }
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Not Found
 */
StudentRouter.post(
    '/login',
    login
);

/**
 * @openapi
 * /students/register:
 *   put:
 *     summary: Register a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber, name, emailId, grade, school, birthdate, gender, password]
 *             properties:
 *               phoneNumber: { type: string }
 *               name: { type: string }
 *               emailId: { type: string }
 *               grade: { type: string }
 *               school: { type: string }
 *               birthdate: { type: string, format: date }
 *               gender: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Student registered successfully
 *       400:
 *         description: Invalid data
 *       409:
 *         description: Phone number already exists
 *       500:
 *         description: Internal Server Error
 */
StudentRouter.put(
    '/register',
    register
);

/**
 * @openapi
 * /students/editDetails/{id}:
 *   patch:
 *     summary: Edit student details
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the student to edit
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
 *               school: { type: string }
 *               grade: { type: string }
 *               gender: { type: string }
 *     responses:
 *       200:
 *         description: Student details updated successfully
 *       404:
 *         description: Student not found
 */
StudentRouter.patch(
    '/editDetails/:id',
    verifyToken,
    editDetails
);

/**
 * @openapi
 * /students/getAssignment/{id}:
 *   post:
 *     summary: Get an assignment by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the assignment to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment retrieved successfully
 *       404:
 *         description: Not Found
 */
StudentRouter.post(
    '/getAssignment/:id',
    verifyToken,
    getAssignment
);

/**
 * @openapi
 * /students/submitassignment/{id}:
 *   put:
 *     summary: Submit an assignment
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the assignment to submit
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [senderId, senderName, assignmentAnswers]
 *             properties:
 *               senderId: { type: string }
 *               senderName: { type: string }
 *               assignmentAnswers: { type: array, items: { type: array, items: { type: string } } }
 *     responses:
 *       201:
 *         description: Assignment submitted successfully
 *       400:
 *         description: Already Submitted
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
StudentRouter.put(
    '/submitassignment/:id',
    verifyToken,
    submitAssignment
);

/**
 * @openapi
 * /students/getAllAssignmentsForClass:
 *   post:
 *     summary: Get all assignments for a class
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [school, grade]
 *             properties:
 *               school: { type: string }
 *               grade: { type: string }
 *     responses:
 *       200:
 *         description: All assignments retrieved successfully
 *       404:
 *         description: Not Found
 */
StudentRouter.post(
    '/getAllAssignmentsForClass',
    verifyToken,
    getAllAssignmentsForClass
);

/**
 * @openapi
 * /students/getallassignments:
 *   post:
 *     summary: Get all assignments by school, grade, and subject
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [school, grade, subject]
 *             properties:
 *               school: { type: string }
 *               grade: { type: string }
 *               subject: { type: string }
 *     responses:
 *       200:
 *         description: All assignments retrieved successfully
 *       404:
 *         description: Not Found
 */
StudentRouter.post(
    '/getallassignments',
    verifyToken,
    getAllAssignmentsBySchoolAndGradeAndSubject
);

/**
 * @openapi
 * /students/getAssignmentScoreAndData/{id}:
 *   post:
 *     summary: Get assignment score and data for a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the assignment
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id: { type: string, description: "Student ID" }
 *     responses:
 *       200:
 *         description: Assignment score and data retrieved successfully
 *       404:
 *         description: Not Found
 */
StudentRouter.post(
    '/getAssignmentScoreAndData/:id',
    verifyToken,
    getAssignmentScoreAndData
);

/**
 * @openapi
 * /students/getmessages/{id}:
 *   post:
 *     summary: Get all messages for a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the student
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All messages retrieved successfully
 *       404:
 *         description: Student Details not found
 */
StudentRouter.post(
    '/getmessages/:id',
    verifyToken,
    getAllMessagesOfStudent
);

/**
 * @openapi
 * /students/getAllNotifications/{id}:
 *   post:
 *     summary: Get all notifications for a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the student
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All notifications retrieved successfully
 *       404:
 *         description: Student not found
 */
StudentRouter.post(
    '/getAllNotifications/:id',
    verifyToken,
    getAllNotifications
);

/**
 * @openapi
 * /students/clearNotification/{id}:
 *   post:
 *     summary: Clear a notification for a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the student
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [notifId]
 *             properties:
 *               notifId: { type: string }
 *     responses:
 *       200:
 *         description: Notification cleared successfully
 *       404:
 *         description: Student not found
 */
StudentRouter.post(
    '/clearNotification/:id',
    verifyToken,
    clearNotification
);

/**
 * @openapi
 * /students/getAllSchools:
 *   post:
 *     summary: Get all schools
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All schools retrieved successfully
 *       404:
 *         description: Not Found
 */
StudentRouter.post(
    '/getAllSchools',
    verifyToken,
    getAllSchools
);

/**
 * @openapi
 * /students/logout/{id}:
 *   post:
 *     summary: Logout a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the student logging out
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
 *         description: Student logged out successfully
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
StudentRouter.post(
    '/logout/:id',
    verifyToken,
    logout
);

export default StudentRouter;
