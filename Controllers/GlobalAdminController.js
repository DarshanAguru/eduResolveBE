import { GlobalAdmins } from '../Database/GlobalAdmin.js';
import { VerificationTag } from '../Database/VerificationTag.js';
import jwt from 'jsonwebtoken';
import { hashPassword, verifyPass } from 
  '../utils/passwordVerifyAndHash.js';
import { Mentors } from '../Database/Mentors.js';
import { LocalAdmins } from '../Database/LocalAdmin.js';

export const login = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const globalAdmin = await GlobalAdmins.findOne({ phoneNumber });

    if (!globalAdmin) {
      return res.status(404).send({ message: 'Not Found' });
    }

    const isMatch = await verifyPass(password, globalAdmin.password);
    if (!isMatch) {
      return res.status(401).send({ message: 'Not authorized' });
    }

    const expTime = 60 * 60 * 24; // 1 day

    const token = jwt.sign(
      { userType: 'HOM', userId: globalAdmin._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: expTime, algorithm: 'HS256' }
    );

    const tag = await VerificationTag.findOneAndUpdate(
      { userId: globalAdmin._id },
      { userType: 'HOM', token },
      { upsert: true, new: true }
    );

    if (!tag) {
      return res.status(500).send({ message: 'Internal Server Error' });
    }

    const dataToSend = {
      ...globalAdmin._doc,
      password: undefined,
      created_at: undefined,
      updated_at: undefined,
      __v: undefined,
      token
    };

    res.status(200).send(dataToSend);
  } catch (err) {
    res.status(401).send({ message: 'Not authorized' });
  }
};

export const register = async (req, res) => {
  const { phoneNumber, name, emailId, password, birthdate, gender } =
    req.body;

  if (
    !phoneNumber || !name || !emailId ||
    !password || !birthdate || !gender
  ) {
    return res.status(400).send({ message: 'Invalid data' });
  }

  if (!/^\d{10}$/.test(phoneNumber)) {
    return res.status(400).send({
      message: 'Invalid phone number format'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailId)) {
    return res.status(400).send({ message: 'Invalid email format' });
  }

  const existingAdmin = await GlobalAdmins.findOne({ phoneNumber });
  if (existingAdmin) {
    return res
      .status(409)
      .send({ message: 'Phone number already exists' });
  }

  const hashedPassword = await hashPassword(password);
  const age =
    new Date().getFullYear() - new Date(birthdate).getFullYear();

  try {
    const newGlobalAdmin = new GlobalAdmins({
      phoneNumber,
      name,
      emailId,
      age,
      gender,
      password: hashedPassword
    });

    await newGlobalAdmin.save();
    res.status(201).send({ message: 'Registered' });
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const logout = async (req, res) => {
  const id = req.params.id;

  try {
    const token = req.body.token;
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY,
      { algorithms: ['HS256'] }
    );

    if (decoded.userId !== id) {
      return res.status(404).send({ message: 'Not Found' });
    }

    const data = await VerificationTag.findOneAndDelete({ userId: id });

    if (!data) {
      return res.status(404).send({ message: 'Not Found' });
    }

    res.status(200).send({ message: 'Logged out Successfully!' });
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const verifyMentor = async (req, res) => {
  const mentorId = req.params.id;

  try {
    const mentor = await Mentors.findById(mentorId);

    if (!mentor) {
      return res.status(404).send({ message: 'Mentor Not Found' });
    }

    if (mentor.verificationStatus === 'verified') {
      return res.status(200).send({ message: 'Already Verified' });
    }

    await Mentors.updateOne(
      { _id: mentorId },
      { verificationStatus: 'verified' }
    );

    res.status(200).send({ message: 'Verified' });
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const verifyLocalAdmin = async (req, res) => {
  const localAdminId = req.params.id;

  try {
    const localAdmin = await LocalAdmins.findById(localAdminId);

    if (!localAdmin) {
      return res
        .status(404)
        .send({ message: 'Local Admin Not Found' });
    }

    if (localAdmin.verificationStatus === 'verified') {
      return res.status(200).send({ message: 'Already Verified' });
    }

    await LocalAdmins.updateOne(
      { _id: localAdminId },
      { verificationStatus: 'verified' }
    );

    res.status(200).send({ message: 'Verified' });
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getAllLocalAdmins = async (req, res) => {
  try {
    const localAdmins = await LocalAdmins.find({});
    if (!localAdmins.length) {
      return res.status(404).send({ message: 'Not Found' });
    }
    res.status(200).send(localAdmins);
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentors.find({});
    if (!mentors.length) {
      return res.status(404).send({ message: 'Not Found' });
    }
    res.status(200).send(mentors);
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const rejectMentor = async (req, res) => {
  const mentorId = req.params.id;

  try {
    const mentor = await Mentors.findById(mentorId);

    if (!mentor) {
      return res.status(404).send({ message: 'Mentor Not Found' });
    }

    if (mentor.verificationStatus === 'rejected') {
      return res.status(200).send({ message: 'Already Rejected' });
    }

    await Mentors.updateOne(
      { _id: mentorId },
      { verificationStatus: 'rejected' }
    );

    res.status(200).send({ message: 'Rejected' });
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const rejectLocalAdmin = async (req, res) => {
  const localAdminId = req.params.id;

  try {
    const localAdmin = await LocalAdmins.findById(localAdminId);

    if (!localAdmin) {
      return res
        .status(404)
        .send({ message: 'LocalAdmin Not Found' });
    }

    if (localAdmin.verificationStatus === 'rejected') {
      return res.status(200).send({ message: 'Already Rejected' });
    }

    await LocalAdmins.updateOne(
      { _id: localAdminId },
      { verificationStatus: 'rejected' }
    );

    res.status(200).send({ message: 'Rejected' });
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
};
