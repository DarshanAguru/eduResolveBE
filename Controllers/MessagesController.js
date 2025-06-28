import { Mentors } from '../Database/Mentors.js';
import { Messages } from '../Database/Messages.js';
import { Students } from '../Database/Students.js';
import { Teachers } from '../Database/Teachers.js';
import {
  uploadImage,
  retrieveImage,
  deleteImage
} from '../utils/uploadToS3.js';

export const getAllMessages = async (req, res) => {
  try {
    let messages = await Messages.find({});
    if (!messages) {
      return res.status(404).send({ message: 'Messages not found' });
    }

    for (let i = 0; i < messages.length; i++) {
      if (messages[i].reports.length >= 10) {
        const msgId = messages[i].messageId;
        const imgLink = messages[i].imageLink;
        if (imgLink) {
          const path = Buffer
            .from(imgLink, 'base64')
            .toString('utf-8');
          deleteImage(path);
        }

        messages = messages.filter(
          msg => msg.messageId !== msgId
        );

        const studentId = msgId.split('@')[0];
        const studentData = await Students.findOne({ _id: studentId });
        if (!studentData) {
          return res.status(500).send({
            message: 'Internal Server Error'
          });
        }

        const notifIndex = studentData.notifications.findIndex(
          notif => notif.userId === 'EDURESOLVE'
        );

        if (notifIndex === -1) {
          studentData.notifications.push({
            userId: 'EDURESOLVE',
            userName: 'Team EduResolve',
            notificationType: 'Message Deleted:Due to violation ' +
              'of EduResolve terms',
            createdAt: new Date().toLocaleString(),
            count: 1
          });
        } else {
          studentData.notifications[notifIndex].count += 1;
        }

        await studentData.save();
        await Messages.deleteOne({ messageId: msgId });
      }
    }

    for (let i = 0; i < messages.length; i++) {
      const profmsgs = messages[i].replies.filter(
        msg => msg.senderType === 'teachers' ||
               msg.senderType === 'mentors'
      );
      const studsmsgs = messages[i].replies.filter(
        msg => msg.senderType === 'students'
      );

      profmsgs.sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );
      studsmsgs.sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );

      messages[i].replies = [...profmsgs, ...studsmsgs];
    }

    res.status(200).send(messages);
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getMessageThread = async (req, res) => {
  const messageId = req.params.id;
  try {
    const message = await Messages.findOne({ messageId });
    if (!message) {
      return res.status(404).send({ message: 'Message Not found' });
    }
    res.status(200).send(message);
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const addMessage = async (req, res) => {
  const messageId = req.params.id;
  const {
    school,
    messageData,
    gender: messageSenderGender,
    name: messageSenderName,
    imageLink,
    tags
  } = req.body;

  const studentId = messageId.split('@')[0];

  try {
    const message = {
      messageId,
      messageData,
      messageSenderGender,
      messageSenderName,
      imageLink,
      tags,
      school
    };

    const messageSave = new Messages(message);

    const student = await Students.findOne({ _id: studentId });
    if (!student) {
      return res.status(404).send({ message: 'Not Found' });
    }

    if (!student.messages.includes(messageId)) {
      student.messages.push(messageId);
      await student.save();
    }

    await messageSave.save();
    res.status(201).send({ message: 'Message Saved' });
  } catch (err) {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const addReply = async (req, res) => {
  const messageId = req.params.id;
  const {
    senderId,
    senderType,
    senderName,
    message,
    senderGender,
    imageLink
  } = req.body;

  try {
    const messageThread = await Messages.findOne({ messageId });
    if (!messageThread) {
      return res.status(404).send({ message: 'Message Not Found' });
    }

    const newReply = {
      senderId,
      senderType,
      senderName,
      senderGender,
      message,
      imageLink
    };

    const updateSenderModel = async (Model) => {
      const sender = await Model.findOne({ _id: senderId });
      if (!sender) {
        return res.status(404).send({ message: 'Not Found' });
      }
      if (!sender.messages.includes(messageId)) {
        sender.messages.push(messageId);
        await sender.save();
      }
    };

    if (senderType === 'teachers') {
      await updateSenderModel(Teachers);
    } else if (senderType === 'students') {
      await updateSenderModel(Students);
    } else if (senderType === 'mentors') {
      await updateSenderModel(Mentors);
    }

    const studentId = messageId.split('@')[0];
    const studentData = await Students.findOne({ _id: studentId });
    if (!studentData) {
      return res.status(500).send({ message: 'Internal Server Error' });
    }

    const notifIndex = studentData.notifications.findIndex(
      notif => notif.userId === senderId
    );

    if (notifIndex === -1) {
      studentData.notifications.push({
        userId: senderId,
        userName: senderName,
        notificationType: 'Reply',
        createdAt: new Date().toLocaleString(),
        count: 1
      });
    } else {
      studentData.notifications[notifIndex].count += 1;
    }

    await studentData.save();
    messageThread.replies.push(newReply);
    await messageThread.save();
    res.status(201).send({ message: 'Reply added' });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getAllMessagesBySchool = async (req, res) => {
  const schoolName = req.body.school;

  try {
    const schoolMessages = await Messages.find({ school: schoolName });
    if (!schoolMessages) {
      return res.status(404).send({ message: 'Not Found' });
    }

    for (let i = 0; i < schoolMessages.length; i++) {
      const profmsgs = schoolMessages[i].replies.filter(
        (msg) =>
          msg.senderType === 'teachers' ||
          msg.senderType === 'mentors'
      );
      const studsmsgs = schoolMessages[i].replies.filter(
        (msg) => msg.senderType === 'students'
      );
      profmsgs.sort((a, b) => {
        const d1 = new Date(a.created_at).getTime();
        const d2 = new Date(b.created_at).getTime();
        return d1 - d2;
      });
      studsmsgs.sort((a, b) => {
        const d1 = new Date(a.created_at).getTime();
        const d2 = new Date(b.created_at).getTime();
        return d1 - d2;
      });
      const replies = [...profmsgs, ...studsmsgs];
      schoolMessages[i].replies = replies;
    }

    res.status(200).send(schoolMessages);
  } catch (err) {
    return res.status(500).send({
      message: 'Internal Server Error',
    });
  }
};

export const upvote = async (req, res) => {
  const messageId = req.params.id;
  const userId = req.body.userId;

  try {
    const messageThread = await Messages.findOne({ messageId });
    if (!messageThread) {
      return res.status(404).send({ message: 'Not Found' });
    }

    if (messageThread.upvote.length === 0) {
      messageThread.upvote.push(userId);
    } else {
      if (messageThread.upvote.includes(userId)) {
        const newArrUpVote = messageThread.upvote.filter(
          (user) => user !== userId
        );
        messageThread.upvote = newArrUpVote;
      } else {
        messageThread.upvote.push(userId);
      }
    }

    if (
      messageThread.downvote.length > 0 &&
      messageThread.downvote.includes(userId)
    ) {
      const newArr = messageThread.downvote.filter(
        (user) => user !== userId
      );
      messageThread.downvote = newArr;
    }

    const len = messageThread.upvote.length;
    await messageThread.save();
    res.status(200).send({ len });
  } catch (err) {
    return res.status(500).send({
      message: 'Internal Server Error',
    });
  }
};

export const downvote = async (req, res) => {
  const messageId = req.params.id;
  const userId = req.body.userId;

  try {
    const messageThread = await Messages.findOne({ messageId });
    if (!messageThread) {
      return res.status(404).send({ message: 'Not Found' });
    }

    if (messageThread.downvote.length === 0) {
      messageThread.downvote.push(userId);
    } else {
      if (messageThread.downvote.includes(userId)) {
        const newArrDownVote = messageThread.downvote.filter(
          (user) => user !== userId
        );
        messageThread.downvote = newArrDownVote;
      } else {
        messageThread.downvote.push(userId);
      }
    }

    if (
      messageThread.upvote.length > 0 &&
      messageThread.upvote.includes(userId)
    ) {
      const newArr = messageThread.upvote.filter(
        (user) => user !== userId
      );
      messageThread.upvote = newArr;
    }

    const len = messageThread.downvote.length;
    await messageThread.save();
    res.status(200).send({ len });
  } catch (err) {
    return res.status(500).send({
      message: 'Internal Server Error',
    });
  }
};

export const reportMessage = async (req, res) => {
  const msgId = req.params.id;
  const userId = req.body.userId;

  try {
    const msg = await Messages.findOne({ messageId: msgId });
    if (!msg) {
      return res.status(404).send({ message: 'Not Found' });
    }

    if (msg.reports.includes(userId)) {
      return res.status(200).send({ alreadyReported: true });
    } else {
      msg.reports.push(userId);
      await msg.save();
    }

    return res.status(200).send({ alreadyReported: false });
  } catch (err) {
    return res.status(500).send({
      message: 'Internal Server Error',
    });
  }
};

export const uploadFile = async (req, res) => {
  const file = req.file;
  const id = req.body.id;

  if (!file || file === undefined) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const lastDotIndex = file.originalname.lastIndexOf('.');
  let fileExtension = '';

  if (lastDotIndex !== -1) {
    fileExtension = file.originalname.substring(lastDotIndex + 1);
  }

  if (
    ['jpeg', 'jpg', 'png'].find((fe) => fe === fileExtension) === undefined
  ) {
    return res.status(400).json({
      error: 'Only jpg, jpeg, png format allowed',
    });
  }

  try {
    const uuid = Date.now().toString();
    const result = await uploadImage(file, id, uuid);

    if (result.path === null) {
      return res.status(400).send({
        message: 'Image size limit exceed',
      });
    }

    const key = Buffer.from(result.path).toString('base64');
    return res.status(200).send({ key });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: 'Internal Server Error',
    });
  }
};

export const getImage = async (req, res) => {
  const imagePath = req.params.key;

  try {
    const path = Buffer.from(imagePath, 'base64').toString('utf-8');
    const readStream = await retrieveImage(path);
    readStream.pipe(res);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
};
