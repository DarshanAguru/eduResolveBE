import { LocalAdmins } from '../Database/LocalAdmin.js'
import { VerificationTag } from '../Database/VerificationTag.js'
import jwt from 'jsonwebtoken'
import { hashPassword, verifyPass } from '../utils/passwordVerifyAndHash.js'
import { Teachers } from '../Database/Teachers.js'

export const login = async (req, res) => {
  const { phoneNumber, password } = req.body // taking post parameters from request
  try {
    const localAdmin = await LocalAdmins.findOne({ phoneNumber }) // getting the teacher details
    // if not found
    if (!localAdmin) {
      return res.status(404).send({ message: 'Not Found' })
    }

    // if incorrect credentials
    if (localAdmin.verificationStatus === 'pending') {
      return res.status(401).send({ message: 'Pending' }) // Not authorized
    }

    if (localAdmin.verificationStatus === 'rejected') {
      return res.status(401).send({ message: 'Rejected' }) // Not authorized
    }

    if (!await verifyPass(password, localAdmin.password)) {
      return res.status(401).send({ message: 'Not authorized' })
    }

    const expTime = 60 * 60 * 24 // expiration time in seconds (1 day)

    // jwt token generation
    const token = jwt.sign({ userType: 'HOI', userId: localAdmin._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: expTime,
      algorithm: 'HS256'
    })

    const tag = await VerificationTag.findOneAndUpdate({ userId: localAdmin._id }, {
      userType: 'HOI',
      token
    }
    ,
    { upsert: true, new: true }
    )

    if (!tag) {
      return res.status(500).send({ message: 'Internal Server Error' }) // Server Error .. Retry login
    }

    const dataToSend = { ...localAdmin._doc, password: undefined, created_at: undefined, updated_at: undefined, __v: undefined, token }
    res.status(200).send(dataToSend) // retuning teacher details
  } catch (err) {
    res.status(401).send({ message: 'Not authorized' }) // Not authorized
  }
}

export const register = async (req, res) => {
  const { phoneNumber, name, emailId, institution, password, birthdate, gender, designation, address } = req.body
  const hashedPassword = await hashPassword(password)
  const age = new Date().getFullYear() - new Date(birthdate).getFullYear() // calculating age from birthdate
  if (!phoneNumber || !name || !emailId || !password || !birthdate || !gender || !institution || !designation || !address) {
    return res.status(400).send({ message: 'Invalid data' })
  }
  if (!/^\d{10}$/.test(phoneNumber)) {
    return res.status(400).send({ message: 'Invalid phone number format' }) // phone number should be 10 digits
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailId)) {
    return res.status(400).send({ message: 'Invalid email format' }) // email should be in valid format
  }

  const existingAdmin = await LocalAdmins.findOne({ phoneNumber }) // checking if the phone number already exists
  if (existingAdmin) {
    return res.status(409).send({ message: 'Phone number already exists' })
  }

  try {
    const newLocalAdmin = new LocalAdmins({
      phoneNumber,
      name,
      emailId,
      age,
      gender,
      password: hashedPassword,
      designation,
      institution,
      address
    })

    await newLocalAdmin.save()
    res.status(201).send({ message: 'Registered' })
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' }) // Internal Server Error
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

export const verifyTeacher = async (req, res) => {
  const teacherId = req.params.id

  try {
    const teacher = await Teachers.findOne({ _id: teacherId })

    if (!teacher) {
      return res.status(404).send({ message: 'Teacher Not Found' })
    }

    if (teacher.verificationStatus === 'verified') {
      return res.status(200).send({ message: 'Already Verified' })
    }

    const updateTeacher = await Teachers.updateOne({ _id: teacherId }, { verificationStatus: 'verified' })
    if (!updateTeacher) {
      return res.status(500).send({ message: 'Internal Server Error' })
    }

    res.status(200).send({ message: 'Verified' })
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const rejectTeacher = async (req, res) => {
  const teacherId = req.params.id

  try {
    const teacher = await Teachers.findOne({ _id: teacherId })

    if (!teacher) {
      return res.status(404).send({ message: 'Teacher Not Found' })
    }

    if (teacher.verificationStatus === 'rejected') {
      return res.status(200).send({ message: 'Already Rejected' })
    }

    const updateTeacher = await Teachers.updateOne({ _id: teacherId }, { verificationStatus: 'rejected' })
    if (!updateTeacher) {
      return res.status(500).send({ message: 'Internal Server Error' })
    }
    res.status(200).send({ message: 'Teacher Application Rejected' })
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const getTeachersBySchool = async (req, res) => {
  const school = req.body.school
  try {
    const teachers = await Teachers.find({ institution: school })
    if (!teachers) {
      return res.status(404).send({ message: 'Not Found' })
    }
    res.status(200).send(teachers)
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}
