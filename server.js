import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import compression from 'compression'
// import * as limiter from 'express-rate-limit'
import StudentRouter from './Routes/StudentsRoutes.js'
import TeacherRouter from './Routes/TeachersRoutes.js'
import MentorRouter from './Routes/MentorsRoutes.js'
import LocalAdminRouter from './Routes/LocalAdminRoutes.js'
import GlobalAdminRouter from './Routes/GlobalAdminRoutes.js'
import MessagesRouter from './Routes/MessagesRoutes.js'
import globalRouter from './Routes/globalRoutes.js'
import cluster from 'cluster'
import os from 'node:os'

dotenv.config()

const app = express()
app.use(express.json())

try {
  mongoose.connect(
    process.env.MONGO_URL
  )
  mongoose.set('strictQuery', false)
} catch (e) {
  console.log(e)
}
// middle wares

app.use(compression())
app.use(cors(
  {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    optionsSuccessStatus: 204
  }
))
// app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 9000

app.get('/healthCheck/checkHealthOfServer', (req, res) => {
  res.sendStatus(200)
})

app.use('/students', StudentRouter)
app.use('/teachers', TeacherRouter)
app.use('/mentors', MentorRouter)
app.use('/localAdmins', LocalAdminRouter)
app.use('/globalAdmins', GlobalAdminRouter)
app.use('/messages', MessagesRouter)
app.use('/global', globalRouter)

if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
  const numCpus = os.cpus().length
  for (let i = 0; i < numCpus; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`)
  })
} else {
  // Start the Express server.
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
  })
}
