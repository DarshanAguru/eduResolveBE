import express from 'express';
import { verifyToken } from '../utils/jwt.js';
import {
    login,
    register,
    logout,
    postAssignment,
    getStudentsBySchool,
    getAllAssignmentsOfTeacher,
    getAllSchools,
    getAllAssignmentsBySchoolAndGradeAndSubject,
    getAllNotifications,
    clearNotification,
    editDetails,
    getAssignment,
    deleteAssignment,
    getAssignmentSubmissions
} from '../Controllers/TeachersController.js';

const TeacherRouter = express.Router();

/**
 * @openapi
 * /teachers/login:
 *   post:
 *     summary: Login for teachers
 *     tags: [Teachers]
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
 *                 token: { type: string }
 *       401:
 *         description: Not authorized
 */
TeacherRouter.post('/login', login);

/**
 * @openapi
 * /teachers/register:
 *   put:
 *     summary: Register a new teacher
 *     tags: [Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber, name, emailId, institution, password, birthdate, gender, qualification, subjectExpertise]
 *             properties:
 *               phoneNumber: { type: string }
 *               name: { type: string }
 *               emailId: { type: string }
 *               institution: { type: string }
 *               password: { type: string }
 *               birthdate: { type: string, format: date }
 *               gender: { type: string }
 *               qualification: { type: string }
 *               subjectExpertise: { type: string }
 *     responses:
 *       201:
 *         description: Teacher registered successfully
 *       500:
 *         description: Internal Server Error
 */
TeacherRouter.put('/register', register);

/**
 * @openapi
 * /teachers/editDetails/{id}:
 *   patch:
 *     summary: Edit teacher details
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the teacher to edit
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
 *               gender: { type: string }
 *     responses:
 *       200:
 *         description: Teacher details updated successfully
 *       404:
 *         description: Teacher not found
 */
TeacherRouter.patch('/editDetails/:id', verifyToken, editDetails);

/**
 * @openapi
 * /teachers/postassignment/{id}:
 *   put:
 *     summary: Post an assignment
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the teacher posting the assignment
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignmentTitle, questions, school, grade, deadline, subject]
 *             properties:
 *               assignmentTitle: { type: string }
 *               questions: { type: array, items: { type: object } }
 *               school: { type: string }
 *               grade: { type: string }
 *               deadline: { type: string }
 *               subject: { type: string }
 *     responses:
 *       201:
 *         description: Assignment Saved
 *       500:
 *         description: Internal Server Error
 */
TeacherRouter.put('/postassignment/:id', verifyToken, postAssignment);

/**
 * @openapi
 * /teachers/getAssignment/{id}:
 *   post:
 *     summary: Get an assignment by ID
 *     tags: [Teachers]
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
TeacherRouter.post('/getAssignment/:id', verifyToken, getAssignment);

/**
 * @openapi
 * /teachers/getAllassignments:
 *   post:
 *     summary: Get all assignments by school, grade, and subject
 *     tags: [Teachers]
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
 */
TeacherRouter.post('/getAllassignments', verifyToken, getAllAssignmentsBySchoolAndGradeAndSubject);

/**
 * @openapi
 * /teachers/getAllStudents:
 *   post:
 *     summary: Get all students by school
 *     tags: [Teachers]
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
 *         description: All students retrieved successfully
 */
TeacherRouter.post('/getAllStudents', verifyToken, getStudentsBySchool);

/**
 * @openapi
 * /teachers/getassignments/{id}:
 *   post:
 *     summary: Get all assignments for a teacher
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the teacher to retrieve assignments for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All assignments retrieved successfully
 */
TeacherRouter.post('/getassignments/:id', verifyToken, getAllAssignmentsOfTeacher);

/**
 * @openapi
 * /teachers/getAssignmentSubmission/{id}:
 *   post:
 *     summary: Get assignment submissions by ID
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the assignment to retrieve submissions for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment submissions retrieved successfully
 */
TeacherRouter.post('/getAssignmentSubmission/:id', verifyToken, getAssignmentSubmissions);

/**
 * @openapi
 * /teachers/deleteAssignment/{id}:
 *   delete:
 *     summary: Delete an assignment by ID
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the assignment to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment deleted successfully
 */
TeacherRouter.delete('/deleteAssignment/:id', verifyToken, deleteAssignment);

/**
 * @openapi
 * /teachers/getAllNotifications/{id}:
 *   post:
 *     summary: Get all notifications for a teacher
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the teacher to retrieve notifications for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All notifications retrieved successfully
 */
TeacherRouter.post('/getAllNotifications/:id', verifyToken, getAllNotifications);

/**
 * @openapi
 * /teachers/clearNotification/{id}:
 *   post:
 *     summary: Clear a notification for a teacher
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the teacher to clear the notification for
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
 */
TeacherRouter.post('/clearNotification/:id', verifyToken, clearNotification);

/**
 * @openapi
 * /teachers/getAllSchools:
 *   post:
 *     summary: Get all schools
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All schools retrieved successfully
 */
TeacherRouter.post('/getAllSchools', verifyToken, getAllSchools);

/**
 * @openapi
 * /teachers/logout/{id}:
 *   post:
 *     summary: Logout a teacher
 *     tags: [Teachers]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the teacher logging out
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
 *         description: Teacher logged out successfully
 */
TeacherRouter.post('/logout/:id', verifyToken, logout);

export default TeacherRouter;
