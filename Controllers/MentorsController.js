import { Mentors } from '../Database/Mentors.js';
import { VerificationTag } from '../Database/VerificationTag.js';
import jwt from 'jsonwebtoken';
import { hashPassword, verifyPass } from '../utils/passwordVerifyAndHash.js';

export const login = async (req, res) => {
  const { phoneNumber, password } = req.body; // taking post parameters from request
  try {
    const mentor = await Mentors.findOne({ phoneNumber }); // getting the teacher details
    // if not found
    if (!mentor) {
      return res.status(404).send({ message: 'Not Found' });
    }

    if (mentor.verificationStatus === 'pending') {
      return res.status(401).send({ message: 'Pending' }); // Not authorized
    }

    if (mentor.verificationStatus === 'rejected') {
      return res.status(401).send({ message: 'Rejected' }); // Not authorized
    }

    // if incorrect credentials
    if (!await verifyPass(password, mentor.password)) {
      return res.status(401).send({ message: 'Not authorized' });
    }

    const expTime = 60 * 60 * 24; // expiration time in seconds (1 day)

    // jwt token generation
    const token = jwt.sign({ userType: 'Mentors', userId: mentor._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: expTime,
      algorithm: 'HS256'
    });

    const tag = await VerificationTag.findOneAndUpdate({ userId: mentor._id }, {
      userType: 'Mentors',
      token
    }
    ,
    { upsert: true, new: true }
    );

    if (!tag) {
      return res.status(500).send({ message: 'Internal Server Error' }); // Server Error .. Retry login
    }

    const dataToSend = { ...mentor._doc, password: undefined, messages: undefined, created_at: undefined, updated_at: undefined, __v: undefined, token };
    res.status(200).send(dataToSend); // retuning teacher details
  } catch (err) {
    res.status(401).send({ message: 'Not authorized' }); // Not authorized
  }
};

export const register = async (req, res) => {
  const { phoneNumber, name, emailId, password, birthdate, gender, description, subjectExpertise, qualification, resumeLink, institution } = req.body;
  const hashedPassword = await hashPassword(password);
  const age = new Date().getFullYear() - new Date(birthdate).getFullYear(); // calculating age from birthdate

  try {
    const newMentor = new Mentors({
      phoneNumber,
      name,
      emailId,
      age,
      gender,
      password: hashedPassword,
      description,
      subjectExpertise,
      resumeLink,
      qualification,
      institution
    });

    await newMentor.save();
    res.status(201).send({ message: 'Registered' });
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' }); // Internal Server Error
  }
};

export const editDetails = async (req, res) => {
  const mentorId = req.params.id;
  const { name, age, institution, gender, qualification, subjectExpertise, resumeLink } = req.body;
  try {
    const mentor = await Mentors.findOneAndUpdate(
      { _id: mentorId },
      { name, age, institution, gender, qualification, subjectExpertise, resumeLink }
    );
    if (!mentor) {
      return res.status(404).send({ message: 'Mentor not found' });
    }
    await mentor.save();
    res.status(200).send({ message: 'Success' });
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const logout = async (req, res) => {
  const id = req.params.id;

  try {
    const token = req.body.token;
    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY, { algorithms: ['HS256'] });
    if (decoded.userId !== id) {
      return res.status(404).send({ message: 'Not Found' });
    }
    const data = await VerificationTag.findOneAndDelete({ userId: id }); // removing token from the verificationTag DB
    if (!data) {
      return res.status(404).send({ message: 'Not Found' });
    }
    res.status(200).send({ message: 'Logged out Successfully!' });
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' }); // Internal Server Error
  }
};
