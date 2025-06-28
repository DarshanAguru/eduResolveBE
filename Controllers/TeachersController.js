import { Teachers } from '../Database/Teachers.js';
import { VerificationTag } from '../Database/VerificationTag.js';
import jwt from 'jsonwebtoken';
import { hashPassword, verifyPass } from '../utils/passwordVerifyAndHash.js';
import { Assignments } from '../Database/Assignments.js';
import { Students } from '../Database/Students.js';
import { LocalAdmins } from '../Database/LocalAdmin.js';

export const login = async (req, res) => {
  const { phoneNumber, password } = req.body;
  try {
    const teacher = await Teachers.findOne({ phoneNumber });
    if (!teacher) return res.status(404).send({ message: 'Not Found' });

    if (teacher.verificationStatus === 'pending')
      return res.status(401).send({ message: 'Pending' });

    if (teacher.verificationStatus === 'rejected')
      return res.status(401).send({ message: 'Rejected' });

    const validPass = await verifyPass(password, teacher.password);
    if (!validPass) return res.status(401).send({ message: 'Not authorized' });

    const expTime = 60 * 60 * 24; // 1 day in seconds
    const token = jwt.sign(
      { userType: 'Teachers', userId: teacher._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: expTime, algorithm: 'HS256' }
    );

    const tag = await VerificationTag.findOneAndUpdate(
      { userId: teacher._id },
      { userType: 'Teachers', token },
      { upsert: true, new: true }
    );

    if (!tag) return res.status(500).send({ message: 'Internal Server Error' });

    const dataToSend = {
      ...teacher._doc,
      password: undefined,
      created_at: undefined,
      updated_at: undefined,
      __v: undefined,
      token
    };

    return res.status(200).send(dataToSend);
  } catch {
    return res.status(401).send({ message: 'Not authorized' });
  }
};

export const register = async (req, res) => {
  const {
    phoneNumber,
    name,
    emailId,
    institution,
    password,
    birthdate,
    gender,
    qualification,
    subjectExpertise
  } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    const age = new Date().getFullYear() - new Date(birthdate).getFullYear();

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
    });

    await newTeacher.save();
    return res.status(201).send({ message: 'Registered' });
  } catch {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const editDetails = async (req, res) => {
  const teacherId = req.params.id;
  const { name, age, school, gender } = req.body;
  try {
    const teacher = await Teachers.findOneAndUpdate(
      { _id: teacherId },
      { name, age, school, gender },
      { new: true }
    );

    if (!teacher) return res.status(404).send({ message: 'Teacher not found' });

    return res.status(200).send({ message: 'Success' });
  } catch {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const logout = async (req, res) => {
  const id = req.params.id;
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY, {
      algorithms: ['HS256']
    });
    if (decoded.userId !== id) return res.status(404).send({ message: 'Not Found' });

    const data = await VerificationTag.findOneAndDelete({ userId: id });
    if (!data) return res.status(404).send({ message: 'Not Found' });

    return res.status(200).send({ message: 'Logged out Successfully!' });
  } catch {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getAssignment = async (req, res) => {
  const assignmentId = req.params.id;
  try {
    const assignment = await Assignments.findOne({ assignmentId });
    if (!assignment) return res.status(404).send({ message: 'Not Found' });
    return res.status(200).send(assignment);
  } catch {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const postAssignment = async (req, res) => {
  const assignmentId = req.params.id;
  const { assignmentTitle, questions, school, grade, deadline, subject } = req.body;
  const teacherId = assignmentId.split('@')[0];
  try {
    const publishDate = new Date().toLocaleString();
    const assignment = {
      assignmentId,
      assignmentTitle,
      questions,
      publishDate,
      deadline,
      grade,
      subject,
      school
    };

    const assignmentSave = new Assignments(assignment);
    const teacher = await Teachers.findOne({ _id: teacherId });
    if (!teacher) return res.status(404).send({ message: 'Not Found' });

    if (!teacher.assignments) teacher.assignments = [];
    if (!teacher.assignments.includes(assignmentId)) {
      teacher.assignments.push(assignmentId);
      await teacher.save();
    }

    const students = await Students.find({ school, grade });
    if (!students) return res.status(500).send({ message: 'Internal Server Error' });

    for (const student of students) {
      student.notifications.push({
        userId: teacherId,
        userName: teacher.name,
        notificationType: 'Assignment',
        createdAt: new Date().toLocaleString()
      });
      await student.save();
    }

    await assignmentSave.save();
    return res.status(201).send({ message: 'Assignment Saved' });
  } catch {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const deleteAssignment = async (req, res) => {
  const assignmentId = req.params.id;
  const teacherId = assignmentId.split('@')[0];
  try {
    await Assignments.findOneAndDelete({ assignmentId });

    const teacher = await Teachers.findOne({ _id: teacherId });
    if (!teacher) return res.status(404).send({ message: 'Not Found' });

    if (!teacher.assignments || teacher.assignments.length === 0) {
      return res.status(404).send({ message: 'Not Found' });
    }

    if (teacher.assignments.includes(assignmentId)) {
      teacher.assignments = teacher.assignments.filter(id => id !== assignmentId);
      await teacher.save();
    }

    return res.status(200).send({ message: 'Deleted Successfully' });
  } catch {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getAllAssignmentsBySchoolAndGradeAndSubject = async (req, res) => {
  const { school, grade, subject } = req.body;
  try {
    const assignments = await Assignments.find({ school, grade, subject });
    if (!assignments || assignments.length === 0)
      return res.status(404).send({ message: 'Not Found' });

    const result = assignments.map(a => ({
      id: a.assignmentId,
      title: a.assignmentTitle,
      deadline: a.deadline
    }));

    return res.status(200).send(result);
  } catch {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getStudentsBySchool = async (req, res) => {
  const { school } = req.body;
  try {
    const students = await Students.find({ school });
    if (!students || students.length === 0)
      return res.status(404).send({ message: 'Not Found' });

    return res.status(200).send(students);
  } catch {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getAssignmentSubmissions = async (req, res) => {
  const assignmentId = req.params.id;
  try {
    const assignmentData = await Assignments.findOne({ assignmentId });
    if (!assignmentData) return res.status(404).send({ message: 'Not Found' });

    const { grade, school, submissions } = assignmentData;
    const allStudents = await Students.find({ grade, school }, { _id: 1, name: 1 });

    const allStudentsIds = allStudents.map(s => s._id.toString());
    const allSubmittedStudentData = submissions.map(s => ({
      id: s.senderId,
      name: s.senderName,
      marks: s.points
    }));
    const allSubmittedStudentIds = submissions.map(s => s.senderId);

    const submitted = [];
    const notSubmitted = [];

    allStudentsIds.forEach(studentId => {
      if (allSubmittedStudentIds.includes(studentId)) {
        const student = allSubmittedStudentData.find(s => s.id === studentId);
        if (student) submitted.push({ name: student.name, marks: student.marks });
      } else {
        const student = allStudents.find(s => s._id.toString() === studentId);
        if (student) notSubmitted.push(student.name);
      }
    });

    return res.status(200).send({ submitted, unsubmitted: notSubmitted });
  } catch {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getAllAssignmentsOfTeacher = async (req, res) => {
  const teacherId = req.params.id;
  try {
    const teacher = await Teachers.findOne({ _id: teacherId });
    if (!teacher) return res.status(404).send({ message: 'Teacher Details not found' });

    const arrAssigns = [];
    for (const assignmentId of teacher.assignments || []) {
      if (assignmentId.split('@')[0] === teacherId) {
        const assign = await Assignments.findOne({ assignmentId });
        if (assign) arrAssigns.push(assign);
      }
    }

    return res.status(200).send(arrAssigns);
  } catch {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getAllSchools = async (req, res) => {
  try {
    const schools = await LocalAdmins.find(
      { verificationStatus: 'approved' },
      { institutionName: 1 }
    );
    return res.status(200).send(schools);
  } catch {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};


export const clearNotification = async (req, res) => {
  const teacherId = req.params.id;
  const notifId = req.body.notifId;

  try {
    const teacher = await Teachers.findOne({ _id: teacherId });
    if (!teacher) {
      return res.status(404).send({ message: 'Teacher not found' });
    }

    teacher.notifications = teacher.notifications.filter(
      (notif) => notif._id.toString() !== notifId
    );

    await teacher.save();
    res.status(200).send({ message: 'Success' });
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getAllNotifications = async (req, res) => {
  const teacherId = req.params.id;

  try {
    const teacher = await Teachers.findOne({ _id: teacherId });
    if (!teacher) {
      return res.status(404).send({ message: 'Teacher not found' });
    }

    const notifications = teacher.notifications;
    return res.status(200).send(notifications);
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};
