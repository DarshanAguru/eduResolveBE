import { Teachers } from '../Database/Teachers.js'
import { VerificationTag } from '../Database/VerificationTag.js'
import jwt from 'jsonwebtoken'
import { hashPassword, verifyPass } from '../utils/passwordVerifyAndHash.js'
import { Assignments } from '../Database/Assignments.js'
import { Students } from '../Database/Students.js'
import { LocalAdmins } from '../Database/LocalAdmin.js'

export const login = async (req, res) => {
  const { phoneNumber, password } = req.body // taking post parameters from request
  try {
    const teacher = await Teachers.findOne({ phoneNumber }) // getting the teacher details
    if (!teacher) {
      return res.status(404).send({ message: 'Not Found' })
    }

    if (teacher.verificationStatus === 'pending') {
      return res.status(401).send({ message: 'Pending' }) // Not authorized
    }

    if (teacher.verificationStatus === 'rejected') {
      return res.status(401).send({ message: 'Rejected' }) // Not authorized
    }

    // if incorrect credentials
    if (!await verifyPass(password, teacher.password)) {
      return res.status(401).send({ message: 'Not authorized' })
    }

    const expTime = 60 * 60 * 24 // expiration time in seconds (1 day)

    // jwt token generation
    const token = jwt.sign({ userType: 'Teachers', userId: teacher._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: expTime,
      algorithm: 'HS256'
    })

    const tag = await VerificationTag.findOneAndUpdate({ userId: teacher._id }, {
      userType: 'Teachers',
      token
    }
    ,
    { upsert: true, new: true }
    )

    if (!tag) {
      return res.status(500).send({ message: 'Internal Server Error' }) // Server Error .. Retry login
    }

    const dataToSend = { ...teacher._doc, password: undefined, created_at: undefined, updated_at: undefined, __v: undefined, token }
    res.status(200).send(dataToSend) // retuning teacher details
  } catch (err) {
    res.status(401).send({ message: 'Not authorized' }) // Not authorized
  }
}

export const register = async (req, res) => {
  const { phoneNumber, name, emailId, institution, password, birthdate, gender, qualification, subjectExpertise } = req.body
  const hashedPassword = await hashPassword(password)

  const age = new Date().getFullYear() - new Date(birthdate).getFullYear() // calculating age from birthdate

  try {
    const newTeacher = new Teachers({
      phoneNumber,
      name,
      emailId,
      age,
      gender,
      institution,
      password: hashedPassword,
      qualification,
      subjectExpertise
    })

    await newTeacher.save()
    res.status(201).send({ message: 'Registered' })
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' }) // Internal Server Error
  }
}

export const editDetails = async (req, res) => {
  const teacherId = req.params.id
  const { name, age, school, gender } = req.body
  try {
    const teacher = await Teachers.findOneAndUpdate(
      { _id: teacherId },
      { name, age, school, gender }
    )
    if (!teacher) {
      return res.status(404).send({ message: 'Teacher not found' })
    }
    await teacher.save()
    res.status(200).send({ message: 'Success' })
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const logout = async (req, res) => {
  const id = req.params.id

  try {
    const token = req.body.token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY, { algorithms: ['HS256'] })
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

export const getAssignment = async (req, res) => {
  const assignmentId = req.params.id
  try {
    const assignment = await Assignments.findOne({ assignmentId })
    if (!assignment) {
      return res.status(404).send({ message: 'Not Found' })
    }
    res.status(200).send(assignment)
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const postAssignment = async (req, res) => {
  const assignmentId = req.params.id
  const { assignmentTitle, questions, school, grade, deadline, subject } = req.body
  const teacherId = req.params.id.split('@')[0]
  try {
    const publishDate = new Date().toLocaleString()
    const assignment = {
      assignmentId,
      assignmentTitle,
      questions,
      publishDate,
      deadline,
      grade,
      subject,
      school
    }

    const assignmentSave = new Assignments(assignment)
    const teacher = await Teachers.findOne({ _id: teacherId })
    if (!teacher) {
      return res.status(404).send({ message: 'Not Found' })
    }
    if (!teacher.assignments || teacher.assignments.length === 0) {
      teacher.assignments.push(assignmentId)
      await teacher.save()
    } else if (!teacher.assignments.includes(assignmentId)) {
      teacher.assignments.push(assignmentId)
      await teacher.save()
    }

    const students = await Students.find({ school, grade })
    if (!students) {
      return res.status(500).send({ message: 'Internal Server Error' })
    }

    for (let i = 0; i < students.length; i++) {
      const student = students[i]
      student.notifications.push({ userId: teacherId, userName: teacher.name, notificationType: 'Assignment', createdAt: new Date().toLocaleString() })
      await student.save()
    }

    await assignmentSave.save()
    res.status(201).send({ message: 'Assignment Saved' })
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const deleteAssignment = async (req, res) => {
  const assignmentId = req.params.id
  const teacherId = req.params.id.split('@')[0]
  try {
    await Assignments.findOneAndDelete({ assignmentId })
    const teacher = await Teachers.findOne({ _id: teacherId })
    if (!teacher) {
      return res.status(404).send({ message: 'Not Found' })
    }
    if (!teacher.assignments || teacher.assignments.length === 0) {
      return res.status(404).send({ message: 'Not Found' })
    } else if (teacher.assignments.includes(assignmentId)) {
      const reqAssignments = teacher.assignments.filter((assId) => (assId !== assignmentId))
      teacher.assignments = reqAssignments
      await teacher.save()
    }
    return res.status(200).send({ message: 'Deleted Successfully' })
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
    const result = []
    for (let i = 0; i < assignments.length; i++) {
      result.push({ id: assignments[i].assignmentId, title: assignments[i].assignmentTitle, deadline: assignments[i].deadline })
    }
    res.status(200).send(result)
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const getStudentsBySchool = async (req, res) => {
  const school = req.body.school
  try {
    const students = await Students.find({ school })
    if (!students) {
      return res.status(404).send({ message: 'Not Found' })
    }
    res.status(200).send(students)
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const getAssignmentSubmissions = async (req, res) => {
  try {
    const assignmentId = req.params.id
    const assignmentData = await Assignments.findOne({ assignmentId })
    const grade = assignmentData.grade
    const school = assignmentData.school
    const allStudents = await Students.find({ grade, school }, { _id: true, name: true })
    const allStudentsIds = allStudents.map((student) => (student._id.toString()))
    const allSubmittedStudentData = assignmentData.submissions.map((submissionData) => ({ id: submissionData.senderId, name: submissionData.senderName, marks: submissionData.points }))
    const allSubmittedStudentIds = assignmentData.submissions.map((submissionData) => (submissionData.senderId))
    const submitted = []
    const notSubmitted = []
    allStudentsIds.forEach((studentId) => {
      if (allSubmittedStudentIds.includes(studentId)) {
        const student = allSubmittedStudentData.filter((submission) => (submission.id === studentId))[0]
        submitted.push({ name: student.name, marks: student.marks })
      } else {
        notSubmitted.push(allStudents.filter((studentt) => (studentt.id === studentId))[0].name)
      }
    })
    return res.status(200).send({ submitted, unsubmitted: notSubmitted })
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const getAllAssignmentsOfTeacher = async (req, res) => {
  const teacherId = req.params.id
  try {
    const teacher = await Teachers.findOne({ _id: teacherId })
    if (!teacher) {
      return res.status(404).send({ message: 'Teacher Details not found' })
    }
    const arrAssigns = []
    for (let i = 0; i < teacher.assignments.length; i++) {
      if (teacher.assignments[i].split('@')[0] === teacherId) {
        const assign = await Assignments.findOne({ assignmentId: teacher.assignments[i] })
        arrAssigns.push(assign)
      }
    }
    res.status(200).send(arrAssigns)
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const getAllSchools = async (req, res) => {
  try {
    const schools = await LocalAdmins.find({ verificationStatus: 'verified' }, 'institution')
    if (!schools) {
      return res.status(404).send({ message: 'Not Found' })
    }
    res.status(200).send(schools)
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const getAllNotifications = async (req, res) => {
  const teacherId = req.params.id
  try {
    const teacher = await Teachers.findOne({ _id: teacherId })
    if (!teacher) {
      return res.status(404).send({ message: 'Teacher not found' })
    }
    const notifications = teacher.notifications
    return res.status(200).send(notifications)
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const clearNotification = async (req, res) => {
  const teacherId = req.params.id
  const notifId = req.body.notifId
  try {
    const teacher = await Teachers.findOne({ _id: teacherId })
    if (!teacher) {
      return res.status(404).send({ message: 'Teacher not found' })
    }
    const notifArr = teacher.notifications.filter(notif => notif.userId !== notifId)
    teacher.notifications = notifArr
    await teacher.save()
    res.status(200).send({ message: 'Success' })
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}
