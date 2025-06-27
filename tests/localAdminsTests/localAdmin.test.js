import { connectTestDB, clearTestDB, closeTestDB } from '../dbConnection.js';
import LocalAdminHelper from './localAdminTestHelper.js';
import GlobalAdminHelper from '../globalAdminTests/globalAdminTestHelper.js';

/* eslint-disable  */
beforeAll(async () => await connectTestDB())
afterEach(async () => await clearTestDB())
afterAll(async () => await closeTestDB())

describe('/localAdmins endpoints', () => {
  it('PUT /register registers a new local admin', async () => {
    const admin = LocalAdminHelper.localAdminFactory()
    const res = await LocalAdminHelper.registerLocalAdmin(admin)

    expect(res.statusCode).toBe(201)
    expect(res.body.message).toBe('Registered')
  })

  
  it('PUT /register fails to register with existing phone number', async () => {
    const admin = LocalAdminHelper.localAdminFactory()
    await LocalAdminHelper.registerLocalAdmin(admin)

    const newAdmin = LocalAdminHelper.localAdminFactory({ name: 'Test Admin 2', emailId: 'new@example.com' })
    const res = await LocalAdminHelper.registerLocalAdmin(newAdmin)

    expect(res.statusCode).toBe(409)
    expect(res.body.message).toBe('Phone number already exists')
  })

  it('POST /login logs in the local admin', async () => {
    const admin = LocalAdminHelper.localAdminFactory({ phoneNumber: '9847283732', name: 'Admin' })
    await LocalAdminHelper.registerLocalAdmin(admin)
    const {loginRes, registerRes} = await GlobalAdminHelper.createGlobalAdminSession()
    const creds = { id: loginRes.body._id, token: loginRes.body.token }
    const allLocalAdmins = await GlobalAdminHelper.getAllLocalAdmins(creds)
    const presLA = allLocalAdmins.body.find(val => val.phoneNumber === admin.phoneNumber)
    await GlobalAdminHelper.verifyLocalAdmin(presLA._id, creds)
    const res = await LocalAdminHelper.loginLocalAdmin({ phoneNumber: admin.phoneNumber, password: admin.password })
    expect(res.statusCode).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.phoneNumber).toBe('9847283732')
  })

  it('POST /login fails login with pending status', async () => {
    const admin = LocalAdminHelper.localAdminFactory({ phoneNumber: '9847283732', name: 'Admin' })
    await LocalAdminHelper.registerLocalAdmin(admin)

    const res = await LocalAdminHelper.loginLocalAdmin({ phoneNumber: '9847283732', password: 'Test@123' })

    expect(res.statusCode).toBe(401)
    expect(res.body.message).toBe('Pending')
  })

  it('POST /login fails login with inactive status', async () => {
    const admin = LocalAdminHelper.localAdminFactory({ phoneNumber: '9847283732', name: 'Admin' })
    await LocalAdminHelper.registerLocalAdmin(admin)
    const {loginRes, registerRes} = await GlobalAdminHelper.createGlobalAdminSession()
    const creds = { id: loginRes.body._id, token: loginRes.body.token }
    const allLocalAdmins = await GlobalAdminHelper.getAllLocalAdmins(creds)
    const presLA = allLocalAdmins.body.find(val => val.phoneNumber === admin.phoneNumber)
    await GlobalAdminHelper.rejectLocalAdmin(presLA._id, creds)
    const res = await LocalAdminHelper.loginLocalAdmin({ phoneNumber: '9847283732', password: 'Test@123' })
    expect(res.statusCode).toBe(401)
    expect(res.body.message).toBe('Rejected')
  })

  it('POST /login fails login with wrong password', async () => {
    const admin = LocalAdminHelper.localAdminFactory()
    await LocalAdminHelper.registerLocalAdmin(admin)

    const res = await LocalAdminHelper.loginLocalAdmin({ phoneNumber: admin.phoneNumber, password: 'wrong' })

    expect([401, 404]).toContain(res.statusCode) // Accept either error code
  })

  it("POST /login fails login with non-existent phone number", async () => {
    const res = await LocalAdminHelper.loginLocalAdmin({ phoneNumber: '0000000000', password: 'Pass@123' })
    expect(res.statusCode).toBe(404)
  })  

  it('PUT /register fails to register with missing data', async () => {
    const admin = LocalAdminHelper.localAdminFactory({ phoneNumber: '', emailId: '' })
    const res = await LocalAdminHelper.registerLocalAdmin(admin)

    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe('Invalid data')
  })

  it('PUT /register fails to register with invalid phone number', async () => {
    const admin = LocalAdminHelper.localAdminFactory({ phoneNumber: '12345' })
    const res = await LocalAdminHelper.registerLocalAdmin(admin)

    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe('Invalid phone number format')
  })

  it('PUT /register fails to register with invalid email format', async () => {
    const admin = LocalAdminHelper.localAdminFactory({ emailId: 'invalid' })
    const res = await LocalAdminHelper.registerLocalAdmin(admin)

    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe('Invalid email format')
  })

  it('POST /logout logs out the local admin', async () => {
     const admin = LocalAdminHelper.localAdminFactory({ phoneNumber: '9847283732', name: 'Admin' })
    await LocalAdminHelper.registerLocalAdmin(admin)

    const {loginRes, registerRes} = await GlobalAdminHelper.createGlobalAdminSession()
    const creds = { id: loginRes.body._id, token: loginRes.body.token }
    const allLocalAdmins = await GlobalAdminHelper.getAllLocalAdmins(creds)
    const presLA = allLocalAdmins.body.find(val => val.phoneNumber === admin.phoneNumber)
    await GlobalAdminHelper.verifyLocalAdmin(presLA._id, creds)
    const loginLA = await LocalAdminHelper.loginLocalAdmin({ phoneNumber: admin.phoneNumber, password: admin.password })
    const credsLA = { id: loginLA.body._id, token: loginLA.body.token }
    const res = await LocalAdminHelper.logoutLocalAdmin(credsLA.id, credsLA)
    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Logged out Successfully!')
  })


})
