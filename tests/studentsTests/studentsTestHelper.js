import request from 'supertest';
import app from '../../App.js';

const registerStudent = async (student) => {
  return await request(app)
    .put('/students/register')
    .set('Content-Type', 'application/json')
    .send(student);
};

const loginStudent = async ({ phoneNumber, password }) => {
  return await request(app)
    .post('/students/login')
    .set('Content-Type', 'application/json')
    .send({ phoneNumber, password });
};

const editStudentDetails = async (id, details, creds) => {
  return await request(app)
    .patch(`/students/editDetails/${id}`)
    .set('Content-Type', 'application/json')
    .set('authorization', `Bearer ${creds.token}`)
    .set('x-user-id', creds.id)
    .send(details);
};

const createStudentSession = async (overrides = {}) => {
  const student = studentFactory(overrides);
  const registerRes = await registerStudent(student);
  const loginRes = await loginStudent({
    phoneNumber: student.phoneNumber,
    password: student.password
  });

  return { loginRes, registerRes };
};

const logoutStudent = async (id, creds) => {
  return await request(app)
    .post(`/students/logout/${id}`)
    .set('Content-Type', 'application/json')
    .set('authorization', `Bearer ${creds.token}`)
    .set('x-user-id', creds.id);
};

const getAllSchools = async (creds) => {
  return await request(app)
    .post('/students/getAllSchools')
    .set('Content-Type', 'application/json')
    .set('authorization', `Bearer ${creds.token}`)
    .set('x-user-id', creds.id);
};

const studentFactory = (overrides = {}) => ({
  phoneNumber: '1234567890',
  name: 'Test Student',
  emailId: 'test@example.com',
  grade: '10',
  birthdate: '2008-01-01',
  gender: 'F',
  school: 'ABC School',
  password: 'Pass@123',
  ...overrides
});

const StudentHelper = {
  studentFactory,
  registerStudent,
  loginStudent,
  editStudentDetails,
  createStudentSession,
  logoutStudent,
  getAllSchools
};

export default StudentHelper;
