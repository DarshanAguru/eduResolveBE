import {
  connectTestDB,
  clearTestDB,
  closeTestDB
} from '../dbConnection.js'
import LocalAdminHelper from '../localAdminsTests/localAdminTestHelper.js'
import GlobalAdminHelper from './globalAdminTestHelper.js'

/* eslint-disable */
beforeAll(async () => await connectTestDB())
afterEach(async () => await clearTestDB())
afterAll(async () => await closeTestDB())

describe('/globalAdmins endpoints', () => {

  it('PUT /register registers a new global admin', async () => {

    const admin = GlobalAdminHelper.globalAdminFactory()
    const res = await GlobalAdminHelper.registerGlobalAdmin(admin)

    expect(res.statusCode).toBe(201)
    expect(res.body.message).toBe('Registered')

  })

  it(
    'PUT /register fails to register with existing phone number',
    async () => {

      const admin = GlobalAdminHelper.globalAdminFactory()
      await GlobalAdminHelper.registerGlobalAdmin(admin)

      const newAdmin = GlobalAdminHelper.globalAdminFactory({
        name: 'Test Admin 2',
        emailId: 'new@example.com'
      })

      const res = await GlobalAdminHelper.registerGlobalAdmin(newAdmin)

      expect(res.statusCode).toBe(409)
      expect(res.body.message).toBe('Phone number already exists')

    }
  )

  it('POST /login logs in the global admin', async () => {

    const admin = GlobalAdminHelper.globalAdminFactory({
      phoneNumber: '9876543210',
      name: 'Darshi'
    })

    await GlobalAdminHelper.registerGlobalAdmin(admin)

    const res = await GlobalAdminHelper.loginGlobalAdmin({
      phoneNumber: '9876543210',
      password: 'Test@123'
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.phoneNumber).toBe('9876543210')

  })

  it('POST /login fails login with wrong password', async () => {

    const admin = GlobalAdminHelper.globalAdminFactory()
    await GlobalAdminHelper.registerGlobalAdmin(admin)

    const res = await GlobalAdminHelper.loginGlobalAdmin({
      phoneNumber: admin.phoneNumber,
      password: 'wrong'
    })

    expect([401, 404]).toContain(res.statusCode)

  })

  it(
    'POST /login fails login with non-existent phone number',
    async () => {

      const res = await GlobalAdminHelper.loginGlobalAdmin({
        phoneNumber: '0000000000',
        password: 'Pass@123'
      })

      expect(res.statusCode).toBe(404)

    }

  )

  it(
    'PUT /register fails to register with missing data',
    async () => {

      const admin = GlobalAdminHelper.globalAdminFactory({
        phoneNumber: '',
        emailId: ''
      })

      const res = await GlobalAdminHelper.registerGlobalAdmin(admin)

      expect(res.statusCode).toBe(400)
      expect(res.body.message).toBe('Invalid data')

    }
  )

  it(
    'PUT /register fails to register with invalid phone number',
    async () => {

      const admin = GlobalAdminHelper.globalAdminFactory({
        phoneNumber: '12345'
      })

      const res = await GlobalAdminHelper.registerGlobalAdmin(admin)

      expect(res.statusCode).toBe(400)
      expect(res.body.message).toBe('Invalid phone number format')

    }
  )

  it(
    'PUT /register fails to register with invalid email format',
    async () => {

      const admin = GlobalAdminHelper.globalAdminFactory({
        emailId: 'invalid'
      })

      const res = await GlobalAdminHelper.registerGlobalAdmin(admin)

      expect(res.statusCode).toBe(400)
      expect(res.body.message).toBe('Invalid email format')

    }
  )

  it(
    'POST /getAllLocalAdmins retrieves all local admins',
    async () => {

      const { loginRes } = await GlobalAdminHelper.createGlobalAdminSession()
      const creds = {
        id: loginRes.headers['x-user-id'],
        token: loginRes.headers['authorization'].split(' ')[1]
      }

      const localAdmin = LocalAdminHelper.localAdminFactory()
      await LocalAdminHelper.registerLocalAdmin(localAdmin)

      const res = await GlobalAdminHelper.getAllLocalAdmins(creds)

      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)

    }
  )

  it(
    'POST /getAllLocalAdmins fails without credentials',
    async () => {

      const res = await GlobalAdminHelper.getAllLocalAdmins({
        id: '',
        token: ''
      })

      expect(res.statusCode).toBe(401)
      expect(res.body.message).toBe('Not Authorized')

    }
  )

  it(
    'POST /getAllLocalAdmins with no local admins returns empty array',
    async () => {

      const { loginRes } = await GlobalAdminHelper.createGlobalAdminSession()
      const creds = {
        id: loginRes.headers['x-user-id'],
        token: loginRes.headers['authorization'].split(' ')[1]
      };

      const res = await GlobalAdminHelper.getAllLocalAdmins(creds);
      expect(res.statusCode).toBe(404)

    }
  )

  it('POST /verifyLocalAdmin/:id verifies a local admin', async () => {

    const { loginRes } = await GlobalAdminHelper.createGlobalAdminSession()
    const creds = {
      id: loginRes.headers['x-user-id'],
      token: loginRes.headers['authorization'].split(' ')[1]
    }

    const localAdmin = LocalAdminHelper.localAdminFactory()
    await LocalAdminHelper.registerLocalAdmin(localAdmin)

    const allLocalAdmins =
      await GlobalAdminHelper.getAllLocalAdmins(creds)

    const localAdminId = allLocalAdmins.body.find(
      val => val.phoneNumber === localAdmin.phoneNumber
    )._id

    const res = await GlobalAdminHelper.verifyLocalAdmin(
      localAdminId,
      creds
    )

    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Verified')

  })

  it('POST /rejectLocalAdmin/:id rejects a local admin', async () => {

    const { loginRes } = await GlobalAdminHelper.createGlobalAdminSession()
    const creds = {
      id: loginRes.headers['x-user-id'],
      token: loginRes.headers['authorization'].split(' ')[1]
    }

    const localAdmin = LocalAdminHelper.localAdminFactory()
    await LocalAdminHelper.registerLocalAdmin(localAdmin)

    const allLocalAdmins =
      await GlobalAdminHelper.getAllLocalAdmins(creds)

    const localAdminId = allLocalAdmins.body.find(
      val => val.phoneNumber === localAdmin.phoneNumber
    )._id

    const res = await GlobalAdminHelper.rejectLocalAdmin(
      localAdminId,
      creds
    )

    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Rejected')

  })

  it('POST /logout logs out the global admin', async () => {

    const { loginRes } = await GlobalAdminHelper.createGlobalAdminSession()
    const adminId = loginRes.headers['x-user-id']
    const creds = {
      id: adminId,
      token: loginRes.headers['authorization'].split(' ')[1]
    }

    const res = await GlobalAdminHelper.logoutGlobalAdmin(
      adminId,
      creds
    )

    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Logged out Successfully!')

  })

})
