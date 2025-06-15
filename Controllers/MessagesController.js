import { Mentors } from '../Database/Mentors.js'
import { Messages } from '../Database/Messages.js'
import { Students } from '../Database/Students.js'
import { Teachers } from '../Database/Teachers.js'
import { uploadImage, retrieveImage, deleteImage } from '../utils/uploadToS3.js'

export const getAllMessages = async (req, res) => {
  try {
    let messages = await Messages.find({})
    if (!messages) {
      return res.status(404).send({ message: 'Messages not found' })
    }

    for (let i = 0; i < messages.length; i++) {
      if (messages[i].reports.length >= 10) {
        const msgId = messages[i].messageId
        const imgLink = messages[i].imageLink
        if (imgLink) {
          const path = Buffer.from(imgLink, 'base64').toString('utf-8')
          deleteImage(path)
        }
        messages = messages.filter(msg => msg.messageId !== msgId)
        const studentId = msgId.split('@')[0]
        const studentData = await Students.findOne({ _id: studentId })
        if (!studentData) {
          return res.status(500).send({ message: 'Internal Server Error' })
        }
        if (studentData.notifications.length === 0) {
          studentData.notifications.push({
            userId: 'EDURESOLVE',
            userName: 'Team EduResolve',
            notificationType: 'Report',
            createdAt: new Date().toLocaleString(),
            count: 1
          })
        } else if (studentData.notifications.includes('EDURESOLVE')) {
          const data = studentData.notifications.find({ userId: 'EDURESOLVE' })
          const arr = studentData.notifications.filter(notif => notif.userId !== 'EDURESOLVE')
          data.count = data.count + 1
          arr.push(data)
          studentData.notifications = arr
        } else {
          studentData.notifications.push({
            userId: 'EDURESOLVE',
            userName: 'Team EduResolve',
            notificationType: 'Message Deleted:Due to  violation the terms of EduResolve',
            createdAt: new Date().toLocaleString(),
            count: 1
          })
        }
        await studentData.save()
        await Messages.deleteOne({ messageId: msgId })
      }
    }

    for (let i = 0; i < messages.length; i++) {
      const profmsgs = messages[i].replies.filter(msg => msg.senderType === 'teachers' || msg.senderType === 'mentors')
      const studsmsgs = messages[i].replies.filter(msg => msg.senderType === 'students')
      profmsgs.sort((a, b) => {
        const d1 = new Date(a.created_at).getTime()
        const d2 = new Date(b.created_at).getTime()
        return d1 - d2
      })
      studsmsgs.sort((a, b) => {
        const d1 = new Date(a.created_at).getTime()
        const d2 = new Date(b.created_at).getTime()
        return d1 - d2
      })
      const replies = [...profmsgs, ...studsmsgs]
      messages[i].replies = replies
    }
    res.status(200).send(messages)
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const getMessageThread = async (req, res) => {
  const messageId = req.params.id
  try {
    const message = await Messages.findOne({ messageId })
    if (!message) {
      res.status(404).send({ message: 'Message Not found' })
    }
    res.status(200).send(message)
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const addMessage = async (req, res) => {
  const messageId = req.params.id
  const school = req.body.school
  const messageData = req.body.messageData
  const messageSenderGender = req.body.gender
  const messageSenderName = req.body.name
  const imageLink = req.body.imageLink ? req.body.imageLink : undefined
  const tags = req.body.tags ? req.body.tags : undefined
  const studentId = req.params.id.split('@')[0]
  try {
    const message = {
      messageId,
      messageData,
      messageSenderGender,
      messageSenderName,
      imageLink,
      tags,
      school
    }

    const messageSave = new Messages(message)

    const student = await Students.findOne({ _id: studentId })
    if (!student) {
      return res.status(404).send({ message: 'Not Found' })
    }
    if (!student.messages || student.messages.length === 0) {
      student.messages.push(messageId)
      await student.save()
    } else if (!student.messages.includes(messageId)) {
      student.messages.push(messageId)
      await student.save()
    }

    await messageSave.save()
    res.status(201).send({ message: 'Message Saved' })
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const addReply = async (req, res) => {
  const messageId = req.params.id
  const { senderId, senderType, senderName, message, senderGender } = req.body
  const imageLink = req.body.imageLink ? req.body.imageLink : undefined
  try {
    const messageThread = await Messages.findOne({ messageId })
    if (!messageThread) {
      return res.status(404).send({ message: 'Message Not Found' })
    }

    const newReply = {
      senderId,
      senderType,
      senderName,
      senderGender,
      message,
      imageLink
    }

    if (senderType === 'teachers') {
      const teacher = await Teachers.findOne({ _id: senderId })
      if (!teacher) {
        return res.status(404).send({ message: 'Not Found' })
      }
      if (!teacher.messages || teacher.messages.length === 0) {
        teacher.messages.push(messageId)
        await teacher.save()
      } else if (!teacher.messages.includes(messageId)) {
        teacher.messages.push(messageId)
        await teacher.save()
      }
    }
    if (senderType === 'students') {
      const student = await Students.findOne({ _id: senderId })
      if (!student) {
        return res.status(404).send({ message: 'Not Found' })
      }
      if (!student.messages || student.messages.length === 0) {
        student.messages.push(messageId)
        await student.save()
      } else if (!student.messages.includes(messageId)) {
        student.messages.push(messageId)
        await student.save()
      }
    }
    if (senderType === 'mentors') {
      const mentor = await Mentors.findOne({ _id: senderId })
      if (!mentor) {
        return res.status(404).send({ message: 'Not Found' })
      }
      if (!mentor.messages || mentor.messages.length === 0) {
        mentor.messages.push(messageId)
        await mentor.save()
      } else if (mentor.messages && !mentor.messages.includes(messageId)) {
        mentor.messages.push(messageId)
        await mentor.save()
      }
    }

    const studentId = messageId.split('@')[0]
    const studentData = await Students.findOne({ _id: studentId })
    if (!studentData) {
      return res.status(500).send({ message: 'Internal Server Error' })
    }
    if (studentData.notifications.length === 0) {
      studentData.notifications.push({
        userId: senderId,
        userName: senderName,
        notificationType: 'Reply',
        createdAt: new Date().toLocaleString(),
        count: 1
      })
    } else if (studentData.notifications.includes(senderId)) {
      const data = studentData.notifications.find({ userId: senderId })
      const arr = studentData.notifications.filter(notif => notif.userId !== senderId)
      data.count = data.count + 1
      arr.push(data)
      studentData.notifications = arr
    } else {
      studentData.notifications.push({
        userId: senderId,
        userName: senderName,
        notificationType: 'Reply',
        createdAt: new Date().toLocaleString(),
        count: 1
      })
    }

    await studentData.save()
    messageThread.replies.push(newReply)
    await messageThread.save()
    res.status(201).send({ message: 'Reply added' })
  } catch (err) {
    console.error(err)
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const getAllMessagesBySchool = async (req, res) => {
  const schoolName = req.body.school

  try {
    const schoolMessages = await Messages.find({ school: schoolName })
    if (!schoolMessages) {
      return res.status(404).send({ message: 'Not Found' })
    }

    for (let i = 0; i < schoolMessages.length; i++) {
      const profmsgs = schoolMessages[i].replies.filter(msg => msg.senderType === 'teachers' || msg.senderType === 'mentors')
      const studsmsgs = schoolMessages[i].replies.filter(msg => msg.senderType === 'students')
      profmsgs.sort((a, b) => {
        const d1 = new Date(a.created_at).getTime()
        const d2 = new Date(b.created_at).getTime()
        return d1 - d2
      })
      studsmsgs.sort((a, b) => {
        const d1 = new Date(a.created_at).getTime()
        const d2 = new Date(b.created_at).getTime()
        return d1 - d2
      })
      const replies = [...profmsgs, ...studsmsgs]
      schoolMessages[i].replies = replies
    }
    res.status(200).send(schoolMessages)
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const upvote = async (req, res) => {
  const messageId = req.params.id
  const userId = req.body.userId
  try {
    const messageThread = await Messages.findOne({ messageId })
    if (!messageThread) {
      return res.status(404).send({ message: 'Not Found' })
    }
    if (messageThread.upvote.length === 0) {
      messageThread.upvote.push(userId)
    } else {
      if (messageThread.upvote.includes(userId)) {
        const newArrUpVote = messageThread.upvote.filter(
          (user) => user !== userId
        )
        messageThread.upvote = newArrUpVote
      } else {
        messageThread.upvote.push(userId)
      }
    }
    if (
      messageThread.downvote.length > 0 &&
      messageThread.downvote.includes(userId)
    ) {
      const newArr = messageThread.downvote.filter((user) => user !== userId)
      messageThread.downvote = newArr
    }
    const len = messageThread.upvote.length
    await messageThread.save()
    res.status(200).send({ len })
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const downvote = async (req, res) => {
  const messageId = req.params.id
  const userId = req.body.userId
  try {
    const messageThread = await Messages.findOne({ messageId })
    if (!messageThread) {
      return res.status(404).send({ message: 'Not Found' })
    }
    if (messageThread.downvote.length === 0) {
      messageThread.downvote.push(userId)
    } else {
      if (messageThread.downvote.includes(userId)) {
        const newArrDownVote = messageThread.downvote.filter(
          (user) => user !== userId
        )
        messageThread.downvote = newArrDownVote
      } else {
        messageThread.downvote.push(userId)
      }
    }
    if (
      messageThread.upvote.length > 0 &&
      messageThread.upvote.includes(userId)
    ) {
      const newArr = messageThread.upvote.filter((user) => user !== userId)
      messageThread.upvote = newArr
    }
    const len = messageThread.downvote.length
    await messageThread.save()
    res.status(200).send({ len })
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const reportMessage = async (req, res) => {
  const msgId = req.params.id
  const userId = req.body.userId
  try {
    const msg = await Messages.findOne({ messageId: msgId })
    if (!msg) {
      return res.status(404).send({ message: 'Not Found' })
    }
    if (msg.reports.includes(userId)) {
      return res.status(200).send({ alreadyReported: true })
    } else {
      msg.reports.push(userId)
      await msg.save()
    }

    return res.status(200).send({ alreadyReported: false })
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const uploadFile = async (req, res) => {
  const file = req.file
  const id = req.body.id
  if (!file || file === undefined) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  try {
    // stmts

    const uuid = Date.now().toString()
    const result = await uploadImage(file, id, uuid)
    const key = Buffer.from(result.path).toString('base64')
    res.status(200).send({ key })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Internal Server Error' })
  }
}

export const getImage = async (req, res) => {
  const imagePath = req.params.key
  try {
    const path = Buffer.from(imagePath, 'base64').toString('utf-8')
    const readStream = await retrieveImage(path)
    readStream.pipe(res)
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
}
