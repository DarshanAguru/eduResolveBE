import request from 'supertest'
import app from '../../App.js'

// REGISTER local ADMIN
const registerLocalAdmin = async (admin) => {
  return await request(app)
    .put('/localAdmins/register')
    .set('Content-Type', 'application/json')
    .send(admin)
}

// LOGIN local ADMIN
const loginLocalAdmin = async ({ phoneNumber, password }) => {
  return await request(app)
    .post('/localAdmins/login')
    .set('Content-Type', 'application/json')
    .send({ phoneNumber, password })
}

// LOGOUT local ADMIN
const logoutLocalAdmin = async (id, creds) => {
  return await request(app)
    .post(`/localAdmins/logout/${id}`)
    .set('Content-Type', 'application/json')
    .set('authorization', `Bearer ${creds.token}`)
    .set('x-user-id', creds.id);
}

// VERIFY MENTOR
const verifyTeacher = async (teacherId, creds) => {
  return await request(app)
    .patch(`/localAdmins/verifyTeacher/${teacherId}`)
    .set('Content-Type', 'application/json')
    .set('authorization', `Bearer ${creds.token}`)
    .set('x-user-id', creds.id);
}

// FACTORY FOR local ADMIN
const localAdminFactory = (overrides = {}) => ({
  phoneNumber: '9873353210',
  name: 'Test Local Admin',
  emailId: 'localAdmin@example.com',
  birthdate: '1989-12-11',
  gender: 'Male',
  password: 'Test@123',
  institution: 'ABC Institute',
  designation: 'Test Designation',
  address: '123 Test Street, Test City',
  ...overrides,
})

// CREATE A local ADMIN SESSION (register + login)
const createLocalAdminSession = async (overrides = {}) => {
  const admin = localAdminFactory(overrides)

  const registerRes = await registerLocalAdmin(admin)

  const loginRes = await loginLocalAdmin({
    phoneNumber: admin.phoneNumber,
    password: admin.password,
  })

  return { loginRes, registerRes, admin }
}

const LocalAdminHelper = {
  localAdminFactory,
  registerLocalAdmin,
  loginLocalAdmin,
  logoutLocalAdmin,
  verifyTeacher,
  createLocalAdminSession,
}

export default LocalAdminHelper
