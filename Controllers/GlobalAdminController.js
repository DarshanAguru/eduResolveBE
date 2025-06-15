import { GlobalAdmins } from '../Database/GlobalAdmin.js'
import { VerificationTag } from '../Database/VerificationTag.js'
import jwt from 'jsonwebtoken'
import { hashPassword, verifyPass } from '../utils/passwordVerifyAndHash.js'
import { Mentors } from '../Database/Mentors.js'
import { LocalAdmins } from '../Database/LocalAdmin.js'

export const login = async (req, res) => {
  const { phoneNumber, password } = req.body // taking post parameters from request
  try {
    const globalAdmin = await GlobalAdmins.findOne({ phoneNumber }) // getting the teacher details
    // if not found
    if (!globalAdmin) {
      return res.status(404).send({ message: 'Not Found' })
    }

    // if incorrect credentials
    if (!await verifyPass(password, globalAdmin.password)) {
      return res.status(401).send({ message: 'Not authorized' })
    }

    const expTime = 60 * 60 * 24 // expiration time in seconds (1 day)

    // jwt token generation
    const token = await jwt.sign({ userType: 'HOM', userId: globalAdmin._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: expTime,
      algorithm: 'HS256'
    })

    // jwt token storage
    const tag = await VerificationTag.findOneAndUpdate({ userId: globalAdmin._id }, {
      userType: 'HOM',
      token
    }
    ,
    { upsert: true, new: true }
    )

    if (!tag) {
      return res.status(500).send({ message: 'Internal Server Error' }) // Server Error .. Retry login
    }

    const dataToSend = { ...globalAdmin._doc, password: undefined, created_at: undefined, updated_at: undefined, __v: undefined, token }
    res.status(200).send(dataToSend) // retuning teacher details
  } catch (err) {
    res.status(401).send({ message: 'Not authorized' }) // Not authorized
  }
}

export const register = async (req, res) => {
  const { phoneNumber, name, emailId, password, birthdate, gender } = req.body
  const hashedPassword = await hashPassword(password)
  const age = new Date().getFullYear() - new Date(birthdate).getFullYear() // calculating age from birthdate

  try {
    const newGlobalAdmin = new GlobalAdmins({
      phoneNumber,
      name,
      emailId,
      age,
      gender,
      password: hashedPassword
    })

    await newGlobalAdmin.save()
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

export const verifyMentor = async (req, res) => {
  const mentorId = req.params.id

  try {
    const mentor = await Mentors.findOne({ _id: mentorId })

    if (!mentor) {
      return res.status(404).send({ message: 'Mentor Not Found' })
    }

    if (mentor.verificationStatus === 'verified') {
      return res.status(200).send({ message: 'Already Verified' })
    }

    const updateMentor = await Mentors.updateOne({ _id: mentorId }, { verificationStatus: 'verified' })
    if (!updateMentor) {
      return res.status(500).send({ message: 'Internal Server Error' })
    }

    res.status(200).send({ message: 'Verified' })
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const verifyLocalAdmin = async (req, res) => {
  const localAdminId = req.params.id

  try {
    const localAdmin = await LocalAdmins.findOne({ _id: localAdminId })

    if (!localAdmin) {
      return res.status(404).send({ message: 'Local Admin Not Found' })
    }

    if (localAdmin.verificationStatus === 'verified') {
      return res.status(200).send({ message: 'Already Verified' })
    }

    const updateLocalAdmin = await LocalAdmins.updateOne({ _id: localAdminId }, { verificationStatus: 'verified' })
    if (!updateLocalAdmin) {
      return res.status(500).send({ message: 'Internal Server Error' })
    }

    res.status(200).send({ message: 'Verified' })
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const getAllLocalAdmins = async (req, res) => {
  try {
    const localAdmins = await LocalAdmins.find({})
    if (!localAdmins) {
      return res.status(404).send({ message: 'Not Found' })
    }
    res.status(200).send(localAdmins)
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentors.find({})
    if (!mentors) {
      return res.status(404).send({ message: 'Not Found' })
    }
    res.status(200).send(mentors)
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const rejectMentor = async (req, res) => {
  const mentorId = req.params.id

  try {
    const mentors = await Mentors.findOne({ _id: mentorId })

    if (!mentors) {
      return res.status(404).send({ message: 'Mentor Not Found' })
    }

    if (mentors.verificationStatus === 'rejected') {
      return res.status(200).send({ message: 'Already Rejected' })
    }

    const updateMentor = await Mentors.updateOne({ _id: mentorId }, { verificationStatus: 'rejected' })
    if (!updateMentor) {
      return res.status(500).send({ message: 'Internal Server Error' })
    }
    res.status(200).send({ message: 'Rejected' })
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const rejectLocalAdmin = async (req, res) => {
  const localAdminId = req.params.id

  try {
    const localAdmin = await LocalAdmins.findOne({ _id: localAdminId })

    if (!localAdmin) {
      return res.status(404).send({ message: 'LocalAdmin Not Found' })
    }

    if (localAdmin.verificationStatus === 'rejected') {
      return res.status(200).send({ message: 'Already Rejected' })
    }

    const updateLocalAdmin = await LocalAdmins.updateOne({ _id: localAdminId }, { verificationStatus: 'rejected' })
    if (!updateLocalAdmin) {
      return res.status(500).send({ message: 'Internal Server Error' })
    }
    res.status(200).send({ message: 'Rejected' })
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}
