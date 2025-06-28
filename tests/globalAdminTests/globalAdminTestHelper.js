import request from 'supertest';
import app from '../../App.js';

// REGISTER GLOBAL ADMIN
const registerGlobalAdmin = async (admin) => {
  return await request(app)
    .put('/globalAdmins/register')
    .set('Content-Type', 'application/json')
    .send(admin);
};

// LOGIN GLOBAL ADMIN
const loginGlobalAdmin = async ({ phoneNumber, password }) => {
  return await request(app)
    .post('/globalAdmins/login')
    .set('Content-Type', 'application/json')
    .send({ phoneNumber, password });
};

// LOGOUT GLOBAL ADMIN
const logoutGlobalAdmin = async (id, creds) => {
  return await request(app)
    .post(`/globalAdmins/logout/${id}`)
    .set('Content-Type', 'application/json')
    .send(creds);
};

// VERIFY MENTOR
const verifyMentor = async (mentorId) => {
  return await request(app)
    .patch(`/globalAdmins/verifyMentor/${mentorId}`)
    .set('Content-Type', 'application/json');
};

// REJECT MENTOR
const rejectMentor = async (mentorId) => {
  return await request(app)
    .patch(`/globalAdmins/rejectMentor/${mentorId}`)
    .set('Content-Type', 'application/json');
};

// VERIFY LOCAL ADMIN
const verifyLocalAdmin = async (localAdminId, creds) => {
  return await request(app)
    .post(`/globalAdmins/verifyLocalAdmin/${localAdminId}`)
    .set('Content-Type', 'application/json')
    .send(creds);
};

// REJECT LOCAL ADMIN
const rejectLocalAdmin = async (localAdminId, creds) => {
  return await request(app)
    .post(`/globalAdmins/rejectLocalAdmin/${localAdminId}`)
    .set('Content-Type', 'application/json')
    .send(creds);
};

// GET ALL MENTORS
const getAllMentors = async () => {
  return await request(app)
    .get('/globalAdmins/getAllMentors')
    .set('Content-Type', 'application/json');
};

// GET ALL LOCAL ADMINS
const getAllLocalAdmins = async (creds) => {
  return await request(app)
    .post('/globalAdmins/getAllLocalAdmins')
    .set('Content-Type', 'application/json')
    .send(creds);
};

// FACTORY FOR GLOBAL ADMIN
const globalAdminFactory = (overrides = {}) => ({
  phoneNumber: '9876543210',
  name: 'Test Admin',
  emailId: 'admin@example.com',
  birthdate: '1990-01-01',
  gender: 'Male',
  password: 'Test@123',
  ...overrides
});

// CREATE A GLOBAL ADMIN SESSION (register + login)
const createGlobalAdminSession = async (overrides = {}) => {
  const admin = globalAdminFactory(overrides);

  const registerRes = await registerGlobalAdmin(admin);

  const loginRes = await loginGlobalAdmin({
    phoneNumber: admin.phoneNumber,
    password: admin.password
  });

  return {
    loginRes,
    registerRes,
    admin
  };
};

const GlobalAdminHelper = {
  globalAdminFactory,
  registerGlobalAdmin,
  loginGlobalAdmin,
  logoutGlobalAdmin,
  verifyMentor,
  rejectMentor,
  verifyLocalAdmin,
  rejectLocalAdmin,
  getAllMentors,
  getAllLocalAdmins,
  createGlobalAdminSession
};

export default GlobalAdminHelper;
