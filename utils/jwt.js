import jwt from 'jsonwebtoken';
import { VerificationTag } from '../Database/VerificationTag.js';

export async function verifyToken (req, res, next) {

  try {

    const token = req.body.token;
    const userIdReq = req.body.id;

    if (token === null || token === undefined || token.trim() === '') {

      return res
        .status(401)
        .send({ message: 'Not Authorized' });

    }

    if (
      userIdReq === null ||
      userIdReq === undefined ||
      userIdReq.trim() === '') {

      return res
        .status(401)
        .send({ message: 'Not Authorized' });

    }

    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

    if (!jwtRegex.test(token)) {

      return res
          .status(403)
          .send({ message: 'Invalid Token' });

    }

    const decoded = await jwt.verify(
        token,
        process.env.JWT_SECRET_KEY,
        { algorithms: ['HS256']}
    );

    const { userId } = decoded;

    if (userId !== userIdReq) {

      return res
          .status(403)
          .send({ message: 'Forbidden' });

    }

    const data = await VerificationTag.findOne({ userId });

    if (!data) {

      return res
          .status(403)
          .send({ message: 'Forbidden' });

    }

    if (data.token !== token) {

      return res
          .status(403)
          .send({ message: 'Forbidden' });

    }

    next();

  } catch (err) {

    console.error(err);
    return res
        .status(401)
        .send({ message: 'Not Authorized' });

  }

}
