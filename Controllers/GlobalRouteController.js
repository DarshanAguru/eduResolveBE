import { Mentors } from '../Database/Mentors.js'
import { Students } from '../Database/Students.js'
import { Teachers } from '../Database/Teachers.js'
import { LocalAdmins } from '../Database/LocalAdmin.js'
import { hashPassword } from '../utils/passwordVerifyAndHash.js'
import { ForgotPassword } from '../Database/ForgotPassword.js'
import { generate } from 'otp-generator'
import nodemailer from 'nodemailer'

export const forgotPassword = async (req, res) => {
  const query = req.body.query
  const email = req.body.email
  const type = req.body.type
  const phoneNo = req.body.phoneNo
  try {
    let data
    if (query === 'generateOTP') {
      if (type === 'mentor') {
        data = await Mentors.findOne({ phoneNumber: phoneNo, emailId: email })
      } else if (type === 'student') {
        data = await Students.findOne({ phoneNumber: phoneNo, emailId: email })
      } else if (type === 'teacher') {
        data = await Teachers.findOne({ phoneNumber: phoneNo, emailId: email })
      } else if (type === 'organization') {
        data = await LocalAdmins.findOne({ phoneNumber: phoneNo, emailId: email })
      } else {
        data = null
      }

      if (!data || (data === null)) {
        return res.status(404).send({ message: 'Data Not Found' })
      }

      const otp = generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.USER_EMAIL,
          pass: process.env.APP_PASS
        }
      })

      const mailOptions = {
        from: process.env.USERMAIL,
        to: email,
        subject: 'EDU RESOLVE password reset OTP!',
        text: `Dear User,\nYour OTP for the EDU RESOLVE account reset password is ${otp}.\nIt is valid for 3 minutes, please don't share.\nWarm Regards,\nEDU RESOLVE team.`
      }

      const response = await transporter.sendMail(mailOptions)
      if (!response) {
        return res.status(500).send({ message: 'Internal Server Error' })
      }

      const passwordData = await ForgotPassword.findOneAndUpdate({ userId: data._id }, { emailId: data.emailId, type, otp }, { upsert: true, new: true })

      if (!passwordData) {
        return res.status(500).send({ message: 'Internal Server Error' })
      }

      return res.status(200).send({ message: 'OTP sent', userId: data._id })
    } else if (query === 'verifyOTP&Reset') {
      const otp = req.body.otp
      const password = req.body.password
      const userId = req.body.userId
      const hashedPassword = await hashPassword(password)
      const passData = await ForgotPassword.findOne({ userId })
      if (!passData) {
        return res.status(404).send({ message: 'Not Found' })
      }
      if (otp !== passData.otp) {
        return res.status(401).send({ message: 'Invalid OTP' })
      }
      await ForgotPassword.deleteOne({ _id: passData._id })

      if (type === 'mentor') {
        data = await Mentors.findOneAndUpdate({ _id: userId }, { password: hashedPassword })
      } else if (type === 'student') {
        data = await Students.findOneAndUpdate({ _id: userId }, { password: hashedPassword })
      } else if (type === 'teacher') {
        data = await Teachers.findOneAndUpdate({ _id: userId }, { password: hashedPassword })
      } else if (type === 'organization') {
        data = await LocalAdmins.findOneAndUpdate({ _id: userId }, { password: hashedPassword })
      } else {
        data = null
      }

      if (!data || data === null) {
        return res.status(404).send({ message: 'Data Not Found' })
      }

      return res.status(200).send({ message: 'verified And Reset' })
    } else {
      return res.status(500).send({ message: 'Internal Server Error' })
    }
  } catch (e) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}
