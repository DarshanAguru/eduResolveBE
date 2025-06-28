import express from 'express';

import {
  forgotPassword
} from '../Controllers/GlobalRouteController.js';

const globalRouter = express.Router();

/**
 * @openapi
 * /global/forgotPassword:
 *   post:
 *     summary: Forgot password (generate OTP or reset password)
 *     tags: [Global]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [query, email, type, phoneNo]
 *                 properties:
 *                   query:
 *                     type: string
 *                     enum: [generateOTP]
 *                     description: Use 'generateOTP' to generate and send OTP to email.
 *                   email:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [mentor, student, teacher, organization]
 *                   phoneNo:
 *                     type: string
 *               - type: object
 *                 required: [query, otp, password, userId, type]
 *                 properties:
 *                   query:
 *                     type: string
 *                     enum: [verifyOTP&Reset]
 *                     description: Use 'verifyOTP&Reset' to verify OTP and reset password.
 *                   otp:
 *                     type: string
 *                   password:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [mentor, student, teacher, organization]
 *     responses:
 *       200:
 *         description: OTP sent or password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *       400:
 *         description: Invalid query type
 *       401:
 *         description: Invalid OTP
 *       404:
 *         description: Data Not Found
 *       500:
 *         description: Internal Server Error
 */
globalRouter.post(
  '/forgotPassword',
  forgotPassword
);

export default globalRouter;
