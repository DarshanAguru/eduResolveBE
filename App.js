import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import compression from 'compression';
// import * as limiter from 'express-rate-limit'
import StudentRouter from './Routes/StudentsRoutes.js';
import TeacherRouter from './Routes/TeachersRoutes.js';
import MentorRouter from './Routes/MentorsRoutes.js';
import LocalAdminRouter from './Routes/LocalAdminRoutes.js';
import GlobalAdminRouter from './Routes/GlobalAdminRoutes.js';
import MessagesRouter from './Routes/MessagesRoutes.js';
import globalRouter from './Routes/globalRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

try {
  if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URL);
    mongoose.set('strictQuery', false);
  }
} catch (e) {
  console.log(e);
}
// middle wares

app.use(compression());
app.use(cors(
  {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    optionsSuccessStatus: 204
  }
));
// app.use(express.urlencoded({ extended: false }));

app.get('/healthCheck/checkHealthOfServer', (req, res) => {
  res.sendStatus(200);
});

app.use('/students', StudentRouter);
app.use('/teachers', TeacherRouter);
app.use('/mentors', MentorRouter);
app.use('/localAdmins', LocalAdminRouter);
app.use('/globalAdmins', GlobalAdminRouter);
app.use('/messages', MessagesRouter);
app.use('/global', globalRouter);

export default app;
