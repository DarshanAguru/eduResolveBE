import { Students } from '../Database/Students.js'
import { VerificationTag } from '../Database/VerificationTag.js'
import jwt from 'jsonwebtoken'
import { hashPassword, verifyPass } from '../utils/passwordVerifyAndHash.js'
import { Assignments } from '../Database/Assignments.js'
import { Messages } from '../Database/Messages.js'
import { LocalAdmins } from '../Database/LocalAdmin.js'
import { Teachers } from '../Database/Teachers.js'

export const login = async (req, res) => {
  const { phoneNumber, password } = req.body // taking post parameters from request
  try {
    const student = await Students.findOne({ phoneNumber }) // getting the student details
    if (!student) {
      return res.status(404).send({ message: 'Not Found' })
    }

    // if incorrect credentials
    try {
      const isValid = await verifyPass(password, student.password)
      if (!isValid) return res.status(401).send({ message: 'Not authorized' })
    } catch (err) {
      return res.status(500).send({ message: 'Error verifying password' })
    }

    const expTime = 60 * 60 * 24 // expiration time in seconds (1 day)

    // jwt token generation
    const token = jwt.sign(
      { userType: 'Students', userId: student._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: expTime,
        algorithm: 'HS256'
      }
    )

    const tag = await VerificationTag.findOneAndUpdate(
      { userId: student._id },
      {
        userType: 'Students',
        token
      },
      { upsert: true, new: true }
    )

    if (!tag) {
      return res.status(500).send('Internal server Error') // server error ... Retry login
    }

    const dataToSend = {
      ...student._doc,
      password: undefined,
      messages: undefined,
      created_at: undefined,
      updated_at: undefined,
      __v: undefined,
      token
    }
    res.status(200).send(dataToSend) // retuning student details
  } catch (err) {
    res.status(401).send({ message: 'Not authorized' }) // Not authorized
  }
}

export const register = async (req, res) => {
  const { phoneNumber, name, emailId, grade, school, birthdate, gender, password } =
    req.body
    // check validity of the data
  if (
    !phoneNumber || !name || !emailId || !grade || !school || !birthdate || !gender || !password
  ) {
    return res.status(400).send({ message: 'Invalid data' })
  }

  // Validate phone number format (example: 10 digits)
  const phoneRegex = /^\d{10}$/
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).send({ message: 'Invalid phone number format' })
  }
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailId)) {
    return res.status(400).send({ message: 'Invalid email format' })
  }

  const hashedPassword = await hashPassword(password)
  const age = new Date().getFullYear() - new Date(birthdate).getFullYear() // calculating age from birthdate
  const existingStudent = await Students.findOne({ phoneNumber })
  if (existingStudent) {
    return res.status(409).send({ message: 'Phone number already exists' })
  }
  try {
    const newStudent = new Students({
      phoneNumber,
      name,
      emailId,
      grade,
      age,
      gender,
      school,
      password: hashedPassword
    })

    await newStudent.save()
    res.status(201).send({ message: 'Registered' })
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' }) // Internal Server Error
  }
}

export const getAssignment = async (req, res) => {
  const assignmentId = req.params.id
  try {
    const assignment = await Assignments.findOne({ assignmentId })
    if (!assignment) {
      return res.status(404).send({ message: 'Not Found' })
    }

    const assignmentCopy = JSON.parse(JSON.stringify(assignment))
    assignmentCopy.questions.forEach(q => {
      q.options.forEach(opt => (opt.isChecked = false))
    })

    const assignmentToSend = { ...assignmentCopy, answers: undefined }

    res.status(200).send(assignmentToSend)
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const editDetails = async (req, res) => {
  const studentId = req.params.id
  const { name, age, school, grade, gender } = req.body
  try {
    const student = await Students.findOneAndUpdate(
      { _id: studentId },
      { name, age, school, grade, gender }, { new: true }
    )
    if (!student) {
      return res.status(404).send({ message: 'Student not found' })
    }
    res.status(200).send({ message: 'Success' })
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const logout = async (req, res) => {
  const id = req.params.id

  try {
    const token = req.body.token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY, {
      algorithms: ['HS256']
    })
    if (decoded.userId !== id) {
      return res.status(404).send({ message: 'Not Found' })
    }
    const data = await VerificationTag.findOneAndDelete({ userId: id }) // removing token from the verificationTag DB
    if (!data) {
      return res.status(404).send({ message: 'Not Found' })
    }
    res.status(200).send({ message: 'Logged out Successfully!' })
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' }) // Internal Server Error
  }
}

export const getAllMessagesOfStudent = async (req, res) => {
  const studentId = req.params.id
  try {
    const student = await Students.findOne({ _id: studentId })
    if (!student) {
      return res.status(404).send({ message: 'Student Details not found' })
    }

    const messageIds = student.messages.filter(id => id.startsWith(studentId))

    const messages = await Messages.find({ messageId: { $in: messageIds } })

    const arrMessages = messages.filter(msg => msg.messageId.split('@')[0] === studentId)

    res.status(200).send(arrMessages)
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const submitAssignment = async (req, res) => {
  const assignmentId = req.params.id
  const { senderId, senderName, assignmentAnswers } = req.body

  try {
    const assignment = await Assignments.findOne({ assignmentId })
    if (!assignment) {
      return res.status(404).send({ message: 'Not Found' })
    }
    let points = 0
    let totalMarks = 0
    for (let i = 0; i < assignmentAnswers.length; i++) {
      if (assignmentAnswers[i] !== null) {
        const marks = parseInt(assignment.questions[i].marks)
        totalMarks += marks
        let check = 0
        for (let j = 0; j < assignment.questions[i].answers.length; j++) {
          if (j >= assignmentAnswers[i].length) {
            break
          }
          const submitted = [...assignmentAnswers[i]].sort()
          const correct = [...assignment.questions[i].answers].sort()
          const isCorrect = submitted.every((ans, j) =>
            ans.trim().toLowerCase() === correct[j]?.trim().toLowerCase()
          )
          if (isCorrect) {
            check += 1
          }
        }
        if (check === assignment.questions[i].answers.length) {
          points += marks
        }
      }
    }
    points = `${points}/${totalMarks}`

    const newSubmission = {
      senderId,
      senderName,
      assignmentAnswers,
      points
    }

    const student = await Students.findOne({ _id: senderId })
    if (!student) {
      return res.status(404).send({ message: 'Not Found' })
    }

    if (!student.assignments || student.assignments.length === 0) {
      student.assignments.push(assignmentId)
      await student.save()
      const teacherId = assignmentId.split('@')[0]
      const teacher = await Teachers.findOne({ _id: teacherId })
      if (!teacher) {
        return res.status(500).send({ message: 'Internal Server Error' })
      }

      teacher.notifications.push({
        userId: senderId,
        userName: senderName,
        notificationType: 'Assignment Submit',
        createdAt: new Date().toLocaleString(),
        count: 1
      })
      await teacher.save()
      assignment.submissions.push(newSubmission)
      await assignment.save()
    } else if (!student.assignments.includes(assignmentId)) {
      student.assignments.push(assignmentId)
      await student.save()
      const teacherId = assignmentId.split('@')[0]
      const teacher = await Teachers.findOne({ _id: teacherId })
      if (!teacher) {
        return res.status(500).send({ message: 'Internal Server Error' })
      }

      teacher.notifications.push({
        userId: senderId,
        userName: senderName,
        notificationType: 'Assignment Submit',
        createdAt: new Date().toLocaleString(),
        count: 1
      })
      await teacher.save()
      assignment.submissions.push(newSubmission)
      await assignment.save()
    } else {
      return res.status(400).send({ message: 'Already Submitted' })
    }
    res.status(201).send({ marks: points })
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const getAssignmentScoreAndData = async (req, res) => {
  try {
    const assignmentId = req.params.id
    const studentId = req.body.id
    const assignment = await Assignments.findOne({ assignmentId })
    if (!assignment) {
      return res.status(404).send({ message: 'Not Found' })
    }
    const studentSubmission = assignment.submissions.filter((submission) => (submission.senderId === studentId))[0]
    const questions = assignment.questions
    const studentData = { studentAnswers: studentSubmission.assignmentAnswers, marks: studentSubmission.points }
    return res.status(200).send({ studentData, AssignmentData: questions })
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const getAllAssignmentsForClass = async (req, res) => {
  try {
    const school = req.body.school
    const grade = req.body.grade
    const assignments = await Assignments.find({ school, grade })

    if (!assignments) {
      return res.status(400).send({ message: 'Not Found' })
    }
    return res.status(200).send(assignments)
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const getAllAssignmentsBySchoolAndGradeAndSubject = async (req, res) => {
  const school = req.body.school
  const grade = req.body.grade
  const subject = req.body.subject
  try {
    const assignments = await Assignments.find({ school, grade, subject })

    if (!assignments) {
      return res.status(404).send({ message: 'Not Found' })
    }
    const dataToSend = []
    for (let i = 0; i < assignments.length; i++) {
      const assign = { id: assignments[i].assignmentId, title: assignments[i].assignmentTitle, publishDate: assignments[i].publishDate, deadline: assignments[i].deadline }
      dataToSend.push(assign)
    }
    res.status(200).send(dataToSend)
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const getAllSchools = async (req, res) => {
  try {
    const schools = await LocalAdmins.find(
      { verificationStatus: 'verified' },
      'institution'
    )
    if (!schools || schools.length === 0) {
      return res.status(404).send({ message: 'Not Found' })
    }
    res.status(200).send(schools)
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const getAllNotifications = async (req, res) => {
  const studentId = req.params.id
  try {
    const student = await Students.findOne({ _id: studentId })
    if (!student) {
      return res.status(404).send({ message: 'Student not found' })
    }

    const notifications = student.notifications
    return res.status(200).send(notifications)
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const clearNotification = async (req, res) => {
  const studentId = req.params.id
  const notifId = req.body.notifId
  try {
    const student = await Students.findOne({ _id: studentId })
    if (!student) {
      return res.status(404).send({ message: 'Student not found' })
    }

    const notifArr = student.notifications.filter(
      (notif) => notif.userId !== notifId
    )
    student.notifications = notifArr
    await student.save()
    res.status(200).send({ message: 'Success' })
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}
