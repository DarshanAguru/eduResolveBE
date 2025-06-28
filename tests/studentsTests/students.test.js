import {
  connectTestDB,
  clearTestDB,
  closeTestDB
} from '../dbConnection.js';

import StudentHelper from './studentsTestHelper.js';

/* eslint-disable */
beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await closeTestDB());

describe('/students endpoints', () => {

  it('PUT /register registers a new student', async () => {
    const student = StudentHelper.studentFactory();
    const res = await StudentHelper.registerStudent(student);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Registered');
  });

  it('PUT /register fails to register with existing phone number', async () => {
    const student = StudentHelper.studentFactory();
    await StudentHelper.registerStudent(student);

    const newStudent = StudentHelper.studentFactory({
      name: 'Test Student 2',
      emailId: 'new@example.com'
    });

    const res = await StudentHelper.registerStudent(newStudent);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('Phone number already exists');
  });

  it('POST /login logs in the student', async () => {
    const student = StudentHelper.studentFactory({
      phoneNumber: '9999999999',
      name: 'Darshi'
    });

    await StudentHelper.registerStudent(student);

    const res = await StudentHelper.loginStudent({
      phoneNumber: '9999999999',
      password: 'Pass@123'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.phoneNumber).toBe('9999999999');
  });

  it('POST /login fails login with wrong password', async () => {
    const student = StudentHelper.studentFactory();
    await StudentHelper.registerStudent(student);

    const res = await StudentHelper.loginStudent({
      phoneNumber: student.phoneNumber,
      password: 'wrong'
    });

    expect([401, 404]).toContain(res.statusCode);
  });

  it('POST /login fails login with non-existent phone number', async () => {
    const res = await StudentHelper.loginStudent({
      phoneNumber: '0000000000',
      password: 'Pass@123'
    });

    expect(res.statusCode).toBe(404);
  });

  it('PUT /register fails to register with missing data', async () => {
    const student = StudentHelper.studentFactory({
      phoneNumber: '',
      emailId: ''
    });

    const res = await StudentHelper.registerStudent(student);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid data');
  });

  it('PUT /register fails to register with invalid phone number', async () => {
    const student = StudentHelper.studentFactory({ phoneNumber: '12345' });
    const res = await StudentHelper.registerStudent(student);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid phone number format');
  });

  it('PUT /register fails to register with invalid email format', async () => {
    const student = StudentHelper.studentFactory({ emailId: 'invalid' });
    const res = await StudentHelper.registerStudent(student);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid email format');
  });

  it('PATCH /editDetails edits details of a student', async () => {
    const { loginRes, registerRes } = await StudentHelper.createStudentSession();
    const studentId = loginRes.body._id;
    const updatedDetails = {
      id: studentId,
      token: loginRes.body.token,
      name: 'Updated Name',
      grade: '11'
    };

    const res = await StudentHelper.editStudentDetails(studentId, updatedDetails);

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body.message).toBe('Registered');
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Success');
  });

  it('PATCH /editDetails fails to edit details with invalid token', async () => {
    const { loginRes, registerRes } = await StudentHelper.createStudentSession();
    const studentId = loginRes.body._id;
    const updatedDetails = {
      id: studentId,
      token: 'invalidtoken',
      name: 'Updated Name',
      grade: '11'
    };

    const res = await StudentHelper.editStudentDetails(studentId, updatedDetails);

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body.message).toBe('Registered');
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    expect(res.statusCode).toBe(403);
  });

  it('PATCH /editDetails fails to edit details with invalid id', async () => {
    const { loginRes, registerRes } = await StudentHelper.createStudentSession();
    const updatedDetails = {
      id: 'invalid',
      token: loginRes.body.token,
      name: 'Updated Name',
      grade: '11'
    };

    const res = await StudentHelper.editStudentDetails('invalid', updatedDetails);

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body.message).toBe('Registered');
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    expect(res.statusCode).toBe(403);
  });

  it('POST /getAllSchools when no schools are registered', async () => {
    const { loginRes, registerRes } = await StudentHelper.createStudentSession();
    const id = loginRes.body._id;
    const token = loginRes.body.token;

    const res = await StudentHelper.getAllSchools({ id, token });

    expect(res.statusCode).toBe(404);
  });

  it('POST /logout logs out the student', async () => {
    const { loginRes, registerRes } = await StudentHelper.createStudentSession();
    const studentId = loginRes.body._id;
    const creds = { id: studentId, token: loginRes.body.token };

    const res = await StudentHelper.logoutStudent(studentId, creds);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Logged out Successfully!');
  });

});
